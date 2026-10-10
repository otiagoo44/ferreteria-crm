-- Run ONLY with `supabase test db` in occidental-crm-local.
-- These tests have NOT been executed in this delivery (Docker/Supabase unavailable).
begin;
create extension if not exists pgtap with schema extensions;
select plan(10);
insert into auth.users(id,email) values
 ('10000000-0000-4000-8000-000000000001','a@example.invalid'),
 ('10000000-0000-4000-8000-000000000002','b@example.invalid'),
 ('10000000-0000-4000-8000-000000000003','supervisor@example.invalid');
insert into public.profiles(id,display_name) values
 ('10000000-0000-4000-8000-000000000001','Vendedor A'),
 ('10000000-0000-4000-8000-000000000002','Vendedor B'),
 ('10000000-0000-4000-8000-000000000003','Supervisora');
insert into public.organizations(id,name) values
 ('20000000-0000-4000-8000-000000000001','Occidental test'),
 ('20000000-0000-4000-8000-000000000002','Otra organización test');
insert into public.memberships(organization_id,user_id,role) values
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','vendedor'),
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','vendedor'),
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','supervisora');
insert into public.customers(id,organization_id,name) values('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Cliente compartido de prueba');
insert into public.inquiries(id,organization_id,customer_id,subject,assigned_to) values
 ('40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','A','10000000-0000-4000-8000-000000000001'),
 ('40000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','B','10000000-0000-4000-8000-000000000002'),
 ('40000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000001',null,'Sin asignar',null),
 ('40000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000002',null,'Otra org',null);
select ok(not has_table_privilege('anon','public.inquiries','select'),'anonymous has no SELECT grant');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","aal":"aal1","role":"authenticated"}',true);
select is((select count(*)::integer from public.inquiries),1,'A only sees assigned record');
select is((select count(*)::integer from public.customers),1,'shared customer can be read');
select is((select count(*)::integer from public.inquiries where subject='B'),0,'shared customer does not expose B');
select ok(not has_table_privilege('authenticated','public.activity_events','update'),'audit log is immutable to client');
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000003","aal":"aal1","role":"authenticated"}',true);
select is((select count(*)::integer from public.inquiries),0,'supervisor requires MFA');
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000003","aal":"aal2","role":"authenticated"}',true);
select is((select count(*)::integer from public.inquiries),3,'MFA supervisor sees organization only');
reset role;
update public.memberships set active=false where user_id='10000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","aal":"aal1","role":"authenticated"}',true);
select is((select count(*)::integer from public.inquiries),0,'old token loses access after membership deactivation');
select is((select count(*)::integer from public.customers),0,'deactivation also blocks customers');
select is((select count(*)::integer from public.intake_submissions),0,'private intake snapshots never exposed');
reset role;
select * from finish();
rollback;
