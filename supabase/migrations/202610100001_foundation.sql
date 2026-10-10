-- Original implementation; staging candidate, NOT executed in Supabase yet.
begin;
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;
create extension if not exists pgcrypto with schema extensions;

create table public.organizations (
 id uuid primary key default gen_random_uuid(), name text not null, timezone text not null default 'America/Asuncion'
);
create table public.profiles (id uuid primary key references auth.users(id), display_name text not null check(length(display_name) between 1 and 100));
create table public.memberships (
 organization_id uuid not null references public.organizations(id), user_id uuid not null references public.profiles(id),
 role text not null check(role in ('propietaria','supervisora','vendedor')), active boolean not null default true,
 primary key(organization_id,user_id)
);
create table public.customers (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 name text not null check(length(name) between 2 and 100), kind text not null default 'particular' check(kind in ('particular','empresa')),
 created_at timestamptz not null default now(), unique(organization_id,id)
);
create table public.inquiries (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id),
 reference uuid not null default gen_random_uuid(), customer_id uuid, subject text not null check(length(subject) between 1 and 160),
 request_snapshot jsonb not null default '{}', stage text not null default 'Nueva' check(stage in ('Nueva','En atención','Por presupuestar','Presupuesto enviado','Aceptada','Cerrada')),
 assigned_to uuid, primary_task_id uuid, outcome text check(outcome in ('consulta resuelta','venta declarada','perdida','cancelada','duplicada','spam')),
 close_reason text, duplicate_of uuid, version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(organization_id,id), unique(organization_id,reference),
 foreign key(organization_id,customer_id) references public.customers(organization_id,id),
 foreign key(organization_id,assigned_to) references public.memberships(organization_id,user_id),
 foreign key(organization_id,duplicate_of) references public.inquiries(organization_id,id),
 check(duplicate_of is null or duplicate_of <> id),
 check((stage='Cerrada' and outcome is not null and (outcome not in ('perdida','cancelada') or coalesce(length(trim(close_reason)),0)>0) and (outcome<>'duplicada' or duplicate_of is not null)) or (stage<>'Cerrada' and outcome is null))
);
create table public.contact_channels (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), customer_id uuid,
 inquiry_id uuid, channel text not null default 'phone' check(channel='phone'), value text not null, verified boolean not null default false,
 unique(organization_id,id), foreign key(organization_id,customer_id) references public.customers(organization_id,id),
 foreign key(organization_id,inquiry_id) references public.inquiries(organization_id,id), check(customer_id is not null or inquiry_id is not null)
);
-- Phone is NOT unique and does not establish an authenticated identity.
create table public.inquiry_items (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, inquiry_id uuid not null,
 product_ref text, description text not null check(length(description) between 2 and 300), quantity numeric not null check(quantity>0 and quantity<=1000000),
 unit text not null check(unit in ('unidad','bolsa','kg','m','m2','m3','l','por_confirmar')), unique(organization_id,id),
 foreign key(organization_id,inquiry_id) references public.inquiries(organization_id,id),
 check(unit not in ('unidad','bolsa') or quantity=trunc(quantity))
);
create table public.tasks (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, inquiry_id uuid not null,
 title text not null check(length(title) between 1 and 200), kind text not null check(kind in ('atención','seguimiento','preparación')),
 assigned_to uuid, due_at timestamptz not null, completed_at timestamptz, version integer not null default 1,
 unique(organization_id,id), unique(organization_id,inquiry_id,id),
 foreign key(organization_id,inquiry_id) references public.inquiries(organization_id,id),
 foreign key(organization_id,assigned_to) references public.memberships(organization_id,user_id)
);
alter table public.inquiries add constraint primary_task_same_inquiry foreign key(organization_id,id,primary_task_id) references public.tasks(organization_id,inquiry_id,id) deferrable initially deferred;
create table public.quotes (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, inquiry_id uuid not null,
 status text not null default 'Enviado' check(status in ('Enviado','Aceptado','Rechazado')), accepted_version integer,
 unique(organization_id,id), foreign key(organization_id,inquiry_id) references public.inquiries(organization_id,id)
);
create table public.quote_versions (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, quote_id uuid not null, version integer not null check(version>0),
 external_ref text not null check(length(external_ref) between 1 and 100), amount_pyg numeric(20,0) check(amount_pyg>=0),
 document_date date not null, valid_until date not null, file_id uuid, sent_at timestamptz not null default now(),
 unique(organization_id,id), unique(organization_id,quote_id,version),
 foreign key(organization_id,quote_id) references public.quotes(organization_id,id)
);
alter table public.quotes add constraint accepted_revision_exists foreign key(organization_id,id,accepted_version) references public.quote_versions(organization_id,quote_id,version) deferrable initially deferred;
create table public.activity_events (
 id bigint generated always as identity primary key, organization_id uuid not null, inquiry_id uuid not null, actor_id uuid references public.profiles(id),
 kind text not null check(kind in ('system','note','manual_attention','human_entry')), evidence text check(evidence in ('manual','verified')),
 detail jsonb not null default '{}', occurred_at timestamptz not null default clock_timestamp(), unique(organization_id,id),
 foreign key(organization_id,inquiry_id) references public.inquiries(organization_id,id)
);
create table public.business_hours (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), version integer not null,
 timezone text not null default 'America/Asuncion', weekly_shifts jsonb not null, sla_minutes integer not null check(sla_minutes between 1 and 1440),
 effective_from timestamptz not null, unique(organization_id,id), unique(organization_id,version)
);
create table public.calendar_exceptions (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, calendar_id uuid not null, local_date date not null, shifts jsonb not null default '[]',
 unique(organization_id,calendar_id,local_date), foreign key(organization_id,calendar_id) references public.business_hours(organization_id,id)
);
create table public.response_cycles (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, inquiry_id uuid not null, calendar_id uuid,
 opened_event_id bigint not null, latest_event_id bigint not null, opened_at timestamptz not null, due_at timestamptz,
 closed_at timestamptz, covered_event_id bigint, evidence text check(evidence in ('manual','verified')),
 unique(organization_id,id), foreign key(organization_id,inquiry_id) references public.inquiries(organization_id,id),
 foreign key(organization_id,calendar_id) references public.business_hours(organization_id,id),
 foreign key(organization_id,opened_event_id) references public.activity_events(organization_id,id),
 foreign key(organization_id,latest_event_id) references public.activity_events(organization_id,id)
);
create unique index one_open_cycle on public.response_cycles(organization_id,inquiry_id) where closed_at is null;
create table public.private_files (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null, inquiry_id uuid not null, object_path text not null unique,
 mime_type text not null check(mime_type in ('application/pdf','image/png','image/jpeg')), bytes bigint not null check(bytes>0 and bytes<=10485760),
 unique(organization_id,id), foreign key(organization_id,inquiry_id) references public.inquiries(organization_id,id)
);
alter table public.quote_versions add foreign key(organization_id,file_id) references public.private_files(organization_id,id);
create table public.saved_views (
 id uuid primary key default gen_random_uuid(), organization_id uuid not null references public.organizations(id), owner_id uuid not null,
 name text not null check(length(name) between 1 and 80), object_name text not null check(object_name in ('inquiries','customers','quotes','tasks','reports')),
 layout text not null check(layout in ('table','kanban')), configuration jsonb not null default '{}', shared boolean not null default false,
 unique(organization_id,id), foreign key(organization_id,owner_id) references public.memberships(organization_id,user_id)
);
create table public.user_preferences (
 organization_id uuid not null, user_id uuid not null, preferences jsonb not null default '{}', primary key(organization_id,user_id),
 foreign key(organization_id,user_id) references public.memberships(organization_id,user_id)
);
create table public.intake_submissions (
 organization_id uuid not null references public.organizations(id), submission_id uuid not null, payload_hash text not null, snapshot jsonb not null,
 inquiry_id uuid not null, reference uuid not null, received_at timestamptz not null default clock_timestamp(),
 primary key(organization_id,submission_id), foreign key(organization_id,inquiry_id) references public.inquiries(organization_id,id)
);
create table public.rate_limit_buckets (
 organization_id uuid not null references public.organizations(id), bucket_key text not null, window_start timestamptz not null,
 count integer not null, primary key(organization_id,bucket_key,window_start)
);

create index inquiry_assigned_stage on public.inquiries(organization_id,assigned_to,stage,created_at);
create index inquiry_customer on public.inquiries(organization_id,customer_id);
create index tasks_due on public.tasks(organization_id,due_at) where completed_at is null;
create index tasks_inquiry on public.tasks(organization_id,inquiry_id);
create index cycles_due on public.response_cycles(organization_id,due_at) where closed_at is null;
create index events_inquiry on public.activity_events(organization_id,inquiry_id,id);
create index contact_phone on public.contact_channels(organization_id,value);

-- JWT role/org claims never decide membership; read live membership for every request.
create function private.member_role(org uuid) returns text language sql stable security definer set search_path='' as $$
 select m.role from public.memberships m where m.organization_id=org and m.user_id=auth.uid() and m.active
 and (m.role='vendedor' or coalesce(auth.jwt()->>'aal','')='aal2')
$$;
create function private.can_inquiry(org uuid, inquiry uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.inquiries q where q.organization_id=org and q.id=inquiry
 and (private.member_role(org) in ('propietaria','supervisora') or (private.member_role(org)='vendedor' and q.assigned_to=auth.uid())))
$$;
create function private.can_customer(org uuid, customer uuid) returns boolean language sql stable security definer set search_path='' as $$
 select private.member_role(org) in ('propietaria','supervisora') or exists(select 1 from public.inquiries q where q.organization_id=org and q.customer_id=customer and private.can_inquiry(org,q.id))
$$;
revoke all on function private.member_role(uuid), private.can_inquiry(uuid,uuid), private.can_customer(uuid,uuid) from public;
grant execute on function private.member_role(uuid), private.can_inquiry(uuid,uuid), private.can_customer(uuid,uuid) to authenticated;

do $$ declare t text; begin
 foreach t in array array['organizations','profiles','memberships','customers','contact_channels','inquiries','inquiry_items','quotes','quote_versions','tasks','activity_events','private_files','saved_views','user_preferences','business_hours','calendar_exceptions','response_cycles','intake_submissions','rate_limit_buckets'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('revoke all on public.%I from anon, authenticated',t);
  execute format('grant select on public.%I to authenticated',t);
 end loop;
end $$;
create policy org_read on public.organizations for select to authenticated using(private.member_role(id) is not null);
create policy profile_read on public.profiles for select to authenticated using(exists(select 1 from public.memberships m where m.user_id=profiles.id and private.member_role(m.organization_id) is not null));
create policy member_read on public.memberships for select to authenticated using(private.member_role(organization_id) is not null);
create policy inquiry_read on public.inquiries for select to authenticated using(private.can_inquiry(organization_id,id));
create policy customer_read on public.customers for select to authenticated using(private.can_customer(organization_id,id));
create policy channel_read on public.contact_channels for select to authenticated using(case when inquiry_id is not null then private.can_inquiry(organization_id,inquiry_id) else private.can_customer(organization_id,customer_id) end);
do $$ declare t text; begin
 foreach t in array array['inquiry_items','tasks','quotes','activity_events','private_files','response_cycles'] loop
  execute format('create policy record_read on public.%I for select to authenticated using(private.can_inquiry(organization_id,inquiry_id))',t);
 end loop;
 foreach t in array array['business_hours','calendar_exceptions'] loop
  execute format('create policy calendar_read on public.%I for select to authenticated using(private.member_role(organization_id) is not null)',t);
 end loop;
end $$;
create policy quote_version_read on public.quote_versions for select to authenticated using(exists(select 1 from public.quotes q where q.organization_id=quote_versions.organization_id and q.id=quote_versions.quote_id and private.can_inquiry(q.organization_id,q.inquiry_id)));
create policy views_read on public.saved_views for select to authenticated using(private.member_role(organization_id) is not null and (owner_id=auth.uid() or shared));
create policy preferences_read on public.user_preferences for select to authenticated using(private.member_role(organization_id) is not null and user_id=auth.uid());
-- Intake snapshots and limiter: zero authenticated/anonymous read policies.

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('occidental-private','occidental-private',false,10485760,array['application/pdf','image/png','image/jpeg']);
create policy occidental_file_read on storage.objects for select to authenticated using(bucket_id='occidental-private' and exists(select 1 from public.private_files f where f.object_path=name and private.can_inquiry(f.organization_id,f.inquiry_id)));
-- No upload/update grants or policies until an authorized file-registration RPC is implemented.
commit;
