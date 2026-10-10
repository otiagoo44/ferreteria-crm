begin;
-- Only Edge service_role may resolve the private organization and call intake.
create function public.consume_intake_rate(p_org uuid,p_bucket text,p_limit integer) returns boolean
language plpgsql security definer set search_path='' as $$
declare w timestamptz:=date_trunc('hour',now()); n integer;
begin
 if p_limit not between 1 and 1000 or length(p_bucket)>100 then return false; end if;
 insert into public.rate_limit_buckets(organization_id,bucket_key,window_start,count) values(p_org,p_bucket,w,1)
 on conflict(organization_id,bucket_key,window_start) do update set count=public.rate_limit_buckets.count+1 returning count into n;
 return n<=p_limit;
end $$;
revoke all on function public.consume_intake_rate(uuid,text,integer) from public, anon, authenticated;
grant execute on function public.consume_intake_rate(uuid,text,integer) to service_role;

create function public.receive_intake(p_org uuid,p_payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare sub uuid:=(p_payload->>'submission_id')::uuid; h text; existing public.intake_submissions;
 q uuid; ref uuid; event_id bigint; stamp timestamptz:=clock_timestamp(); item jsonb;
begin
 -- Defense in depth. Full exact schema is validated by Edge before RPC.
 if jsonb_typeof(p_payload)<>'object' or p_payload->>'schema_version'<>'1' or p_payload->>'contact_consent'<>'true'
 or octet_length(p_payload::text)>32768 or length(p_payload->>'name') not between 2 and 100
 or not (p_payload->>'phone' ~ '^\+[1-9][0-9]{7,14}$') or jsonb_typeof(p_payload->'items')<>'array'
 or jsonb_array_length(p_payload->'items')>50 then raise exception 'invalid intake' using errcode='22023'; end if;
 if exists(select 1 from jsonb_object_keys(p_payload) k where k not in ('schema_version','submission_id','name','phone','message','items','fulfilment_preference','contact_consent','consent_version','attribution')) then raise exception 'invalid routing fields' using errcode='22023'; end if;
 h:=encode(extensions.digest(convert_to(p_payload::text,'UTF8'),'sha256'),'hex');
 perform pg_advisory_xact_lock(hashtextextended(p_org::text||sub::text,0));
 select * into existing from public.intake_submissions where organization_id=p_org and submission_id=sub;
 if found then
  if existing.payload_hash<>h then raise exception 'idempotency conflict' using errcode='P0002'; end if;
  return jsonb_build_object('status','received','reference',existing.reference,'received_at',existing.received_at,'replayed',true);
 end if;
 -- Unknown sender remains unverified, never merged or used to overwrite a known customer.
 insert into public.inquiries(organization_id,subject,request_snapshot) values(p_org,coalesce(nullif(left(trim(p_payload->>'message'),160),''),'Solicitud de materiales'),p_payload)
 returning id,reference into q,ref;
 insert into public.contact_channels(organization_id,inquiry_id,value,verified) values(p_org,q,p_payload->>'phone',false);
 for item in select * from jsonb_array_elements(p_payload->'items') loop
  insert into public.inquiry_items(organization_id,inquiry_id,product_ref,description,quantity,unit)
  values(p_org,q,item->>'product_ref',item->>'description',(item->>'quantity')::numeric,item->>'unit');
 end loop;
 insert into public.activity_events(organization_id,inquiry_id,kind,detail,occurred_at)
 values(p_org,q,'human_entry',jsonb_build_object('origin','public-intake','submission_id',sub),stamp) returning id into event_id;
 -- due_at intentionally NULL until a confirmed/versioned calendar is configured.
 insert into public.response_cycles(organization_id,inquiry_id,opened_event_id,latest_event_id,opened_at) values(p_org,q,event_id,event_id,stamp);
 insert into public.intake_submissions(organization_id,submission_id,payload_hash,snapshot,inquiry_id,reference,received_at)
 values(p_org,sub,h,p_payload,q,ref,stamp);
 return jsonb_build_object('status','received','reference',ref,'received_at',stamp,'replayed',false);
end $$;
revoke all on function public.receive_intake(uuid,jsonb) from public, anon, authenticated;
grant execute on function public.receive_intake(uuid,jsonb) to service_role;

create function public.assign_inquiry(p_id uuid,p_expected integer,p_assigned uuid) returns integer
language plpgsql security definer set search_path='' as $$
declare q public.inquiries; n integer;
begin
 select * into q from public.inquiries where id=p_id for update;
 if not found or private.member_role(q.organization_id) not in ('propietaria','supervisora') or private.member_role(q.organization_id) is null then raise exception 'not authorized' using errcode='42501'; end if;
 if q.version is distinct from p_expected then raise exception 'version conflict' using errcode='40001'; end if;
 if p_assigned is not null and not exists(select 1 from public.memberships where organization_id=q.organization_id and user_id=p_assigned and active and role='vendedor') then raise exception 'invalid assignee' using errcode='22023'; end if;
 update public.inquiries set assigned_to=p_assigned,version=version+1,updated_at=clock_timestamp() where id=q.id returning version into n;
 insert into public.activity_events(organization_id,inquiry_id,actor_id,kind,detail) values(q.organization_id,q.id,auth.uid(),'system',jsonb_build_object('action','assignment','from',q.assigned_to,'to',p_assigned));
 return n;
end $$;

create function public.transition_inquiry(p_id uuid,p_expected integer,p_stage text,p_outcome text default null,p_reason text default null,p_duplicate uuid default null) returns integer
language plpgsql security definer set search_path='' as $$
declare q public.inquiries; permitted boolean; n integer;
begin
 select * into q from public.inquiries where id=p_id for update;
 if not found or not private.can_inquiry(q.organization_id,q.id) then raise exception 'not authorized' using errcode='42501'; end if;
 if q.version is distinct from p_expected then raise exception 'version conflict' using errcode='40001'; end if;
 permitted:=case q.stage when 'Nueva' then p_stage in ('En atención','Por presupuestar','Cerrada') when 'En atención' then p_stage in ('Por presupuestar','Cerrada') when 'Por presupuestar' then p_stage in ('En atención','Presupuesto enviado','Cerrada') when 'Presupuesto enviado' then p_stage in ('En atención','Por presupuestar','Aceptada','Cerrada') when 'Aceptada' then p_stage in ('En atención','Cerrada') when 'Cerrada' then p_stage='En atención' else false end;
 if not permitted then raise exception 'invalid transition' using errcode='22023'; end if;
 if p_stage='Presupuesto enviado' and not exists(select 1 from public.quotes where organization_id=q.organization_id and inquiry_id=q.id) then raise exception 'quote required'; end if;
 if p_stage='Aceptada' and not exists(select 1 from public.quotes where organization_id=q.organization_id and inquiry_id=q.id and status='Aceptado' and accepted_version is not null) then raise exception 'accepted revision required'; end if;
 if p_duplicate is not null and not private.can_inquiry(q.organization_id,p_duplicate) then raise exception 'unauthorized duplicate' using errcode='42501'; end if;
 update public.inquiries set stage=p_stage,outcome=case when p_stage='Cerrada' then p_outcome end,close_reason=p_reason,duplicate_of=p_duplicate,version=version+1,updated_at=clock_timestamp() where id=q.id returning version into n;
 insert into public.activity_events(organization_id,inquiry_id,actor_id,kind,detail) values(q.organization_id,q.id,auth.uid(),'system',jsonb_build_object('action','transition','from',q.stage,'to',p_stage,'outcome',p_outcome,'reason',p_reason));
 return n;
end $$;

create function public.record_manual_attention(p_id uuid,p_expected integer,p_covered bigint,p_result text) returns integer
language plpgsql security definer set search_path='' as $$
declare q public.inquiries; cycle public.response_cycles; n integer;
begin
 select * into q from public.inquiries where id=p_id for update;
 if not found or not private.can_inquiry(q.organization_id,q.id) then raise exception 'not authorized' using errcode='42501'; end if;
 if q.version is distinct from p_expected then raise exception 'version conflict' using errcode='40001'; end if;
 if coalesce(length(trim(p_result)),0) not between 1 and 2000 then raise exception 'manual result required'; end if;
 select * into cycle from public.response_cycles where organization_id=q.organization_id and inquiry_id=q.id and closed_at is null for update;
 if found then
  if p_covered<cycle.opened_event_id or p_covered>cycle.latest_event_id or not exists(select 1 from public.activity_events where organization_id=q.organization_id and inquiry_id=q.id and id=p_covered and kind='human_entry') then raise exception 'invalid covered event'; end if;
  if p_covered=cycle.latest_event_id then
   update public.response_cycles set closed_at=clock_timestamp(),covered_event_id=p_covered,evidence='manual' where id=cycle.id;
  end if;
  -- A later event preserves debt and its original clock; partial coverage is audited.
 end if;
 insert into public.activity_events(organization_id,inquiry_id,actor_id,kind,evidence,detail) values(q.organization_id,q.id,auth.uid(),'manual_attention','manual',jsonb_build_object('result',p_result,'covered_event',p_covered));
 update public.inquiries set version=version+1,updated_at=clock_timestamp() where id=q.id returning version into n;
 return n;
end $$;
revoke all on function public.assign_inquiry(uuid,integer,uuid),public.transition_inquiry(uuid,integer,text,text,text,uuid),public.record_manual_attention(uuid,integer,bigint,text) from public,anon;
grant execute on function public.assign_inquiry(uuid,integer,uuid),public.transition_inquiry(uuid,integer,text,text,text,uuid),public.record_manual_attention(uuid,integer,bigint,text) to authenticated;
commit;
