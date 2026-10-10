begin;
create function public.compose_primary_task(p_id uuid,p_expected integer,p_title text,p_due timestamptz,p_kind text) returns uuid
language plpgsql security definer set search_path='' as $$
declare q public.inquiries; task uuid;
begin
 select * into q from public.inquiries where id=p_id for update;
 if not found or not private.can_inquiry(q.organization_id,q.id) then raise exception 'not authorized' using errcode='42501'; end if;
 if q.version is distinct from p_expected then raise exception 'version conflict' using errcode='40001'; end if;
 if q.stage='Cerrada' or p_due is null then raise exception 'open inquiry and due date required'; end if;
 insert into public.tasks(organization_id,inquiry_id,title,kind,assigned_to,due_at) values(q.organization_id,q.id,trim(p_title),p_kind,q.assigned_to,p_due) returning id into task;
 update public.inquiries set primary_task_id=task,version=version+1,updated_at=clock_timestamp() where id=q.id;
 insert into public.activity_events(organization_id,inquiry_id,actor_id,kind,detail) values(q.organization_id,q.id,auth.uid(),'system',jsonb_build_object('action','primary_task','task_id',task));
 return task;
end $$;

create function public.complete_task(p_task uuid,p_expected integer) returns void
language plpgsql security definer set search_path='' as $$
declare t public.tasks; q public.inquiries;
begin
 -- Lock parent before child, consistent with all inquiry mutations.
 select * into t from public.tasks where id=p_task;
 if not found or not private.can_inquiry(t.organization_id,t.inquiry_id) then raise exception 'not authorized' using errcode='42501'; end if;
 select * into q from public.inquiries where id=t.inquiry_id for update;
 if not private.can_inquiry(q.organization_id,q.id) then raise exception 'not authorized after lock' using errcode='42501'; end if;
 select * into t from public.tasks where id=p_task for update;
 if t.version is distinct from p_expected then raise exception 'version conflict' using errcode='40001'; end if;
 if t.completed_at is not null then return; end if;
 update public.tasks set completed_at=clock_timestamp(),version=version+1 where id=t.id;
 update public.inquiries set primary_task_id=case when primary_task_id=t.id then null else primary_task_id end,version=version+1,updated_at=clock_timestamp() where id=q.id;
 insert into public.activity_events(organization_id,inquiry_id,actor_id,kind,detail) values(q.organization_id,q.id,auth.uid(),'system',jsonb_build_object('action','complete_task','task_id',t.id));
end $$;

create function public.register_external_quote(p_id uuid,p_expected integer,p_reference text,p_amount numeric,p_validity date) returns uuid
language plpgsql security definer set search_path='' as $$
declare q public.inquiries; quote uuid; revision integer;
begin
 select * into q from public.inquiries where id=p_id for update;
 if not found or not private.can_inquiry(q.organization_id,q.id) then raise exception 'not authorized' using errcode='42501'; end if;
 if q.version is distinct from p_expected then raise exception 'version conflict' using errcode='40001'; end if;
 if q.stage not in ('Por presupuestar','Presupuesto enviado') or p_validity is null or (p_amount is not null and (p_amount::text in ('NaN','Infinity','-Infinity') or p_amount<0 or p_amount<>trunc(p_amount))) then raise exception 'invalid quote'; end if;
 select id into quote from public.quotes where organization_id=q.organization_id and inquiry_id=q.id order by id limit 1 for update;
 if not found then insert into public.quotes(organization_id,inquiry_id) values(q.organization_id,q.id) returning id into quote; end if;
 select coalesce(max(version),0)+1 into revision from public.quote_versions where organization_id=q.organization_id and quote_id=quote;
 insert into public.quote_versions(organization_id,quote_id,version,external_ref,amount_pyg,document_date,valid_until) values(q.organization_id,quote,revision,trim(p_reference),p_amount,(clock_timestamp() at time zone 'America/Asuncion')::date,p_validity);
 update public.quotes set status='Enviado' where id=quote;
 update public.inquiries set stage='Presupuesto enviado',version=version+1,updated_at=clock_timestamp() where id=q.id;
 insert into public.activity_events(organization_id,inquiry_id,actor_id,kind,evidence,detail) values(q.organization_id,q.id,auth.uid(),'system','manual',jsonb_build_object('action','quote_registered','quote_id',quote,'revision',revision));
 return quote;
end $$;

create function public.record_quote_decision(p_quote uuid,p_expected integer,p_revision integer,p_accept boolean) returns void
language plpgsql security definer set search_path='' as $$
declare p public.quotes; q public.inquiries;
begin
 select * into p from public.quotes where id=p_quote;
 if not found or not private.can_inquiry(p.organization_id,p.inquiry_id) then raise exception 'not authorized' using errcode='42501'; end if;
 select * into q from public.inquiries where id=p.inquiry_id for update;
 if not private.can_inquiry(q.organization_id,q.id) then raise exception 'not authorized after lock' using errcode='42501'; end if;
 if q.version is distinct from p_expected then raise exception 'version conflict' using errcode='40001'; end if;
 if p_accept is null or q.stage<>'Presupuesto enviado' or not exists(select 1 from public.quote_versions where organization_id=p.organization_id and quote_id=p.id and version=p_revision) then raise exception 'invalid decision'; end if;
 update public.quotes set status=case when p_accept then 'Aceptado' else 'Rechazado' end,accepted_version=case when p_accept then p_revision end where id=p.id;
 update public.inquiries set stage=case when p_accept then 'Aceptada' else stage end,version=version+1,updated_at=clock_timestamp() where id=q.id;
 insert into public.activity_events(organization_id,inquiry_id,actor_id,kind,evidence,detail) values(q.organization_id,q.id,auth.uid(),'system','manual',jsonb_build_object('action','quote_decision','quote_id',p.id,'revision',p_revision,'accepted',p_accept));
end $$;
revoke all on function public.compose_primary_task(uuid,integer,text,timestamptz,text),public.complete_task(uuid,integer),public.register_external_quote(uuid,integer,text,numeric,date),public.record_quote_decision(uuid,integer,integer,boolean) from public,anon;
grant execute on function public.compose_primary_task(uuid,integer,text,timestamptz,text),public.complete_task(uuid,integer),public.register_external_quote(uuid,integer,text,numeric,date),public.record_quote_decision(uuid,integer,integer,boolean) to authenticated;
commit;
