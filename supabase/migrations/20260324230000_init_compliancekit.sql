create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

create or replace function public.storage_org_id(object_name text)
returns uuid
language plpgsql
stable
as $$
declare
  path_parts text[];
begin
  path_parts := storage.foldername(object_name);

  if array_length(path_parts, 1) >= 2 and path_parts[1] = 'org' then
    return path_parts[2]::uuid;
  end if;

  return null;
exception
  when others then
    return null;
end;
$$;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  last_organization_id uuid null,
  created_at timestamptz not null default now()
);

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country_code text,
  sector text,
  employee_band text,
  nis2_applicable boolean,
  entity_class text not null default 'unknown' check (
    entity_class in ('essential', 'important', 'out_of_scope', 'unknown')
  ),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

alter table public.profiles
  add constraint profiles_last_organization_id_fkey
  foreign key (last_organization_id) references public.organizations(id) on delete set null;

create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_org_id
      and om.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members om
    where om.organization_id = target_org_id
      and om.user_id = auth.uid()
      and om.role in ('owner', 'admin')
  );
$$;

create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('admin', 'member')),
  token_hash text not null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  price_eur integer not null,
  max_members integer,
  features_json jsonb not null default '{}'::jsonb
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null unique references public.organizations(id) on delete cascade,
  plan_id uuid references public.plans(id),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.onboarding_responses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  answers_json jsonb not null,
  derived_result_json jsonb not null,
  completed_by uuid references auth.users(id) on delete set null,
  completed_at timestamptz not null default now()
);

create table if not exists public.control_catalog (
  id uuid primary key default gen_random_uuid(),
  framework text not null default 'nis2',
  control_code text not null unique,
  article_ref text not null,
  title text not null,
  description text not null,
  guidance text not null,
  weight numeric(5,2) not null default 1.0,
  sort_order integer not null,
  iso27001_refs text[] not null default '{}'::text[]
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'completed')),
  score_pct numeric(5,2) not null default 0,
  started_by uuid references auth.users(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.assessment_answers (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  control_id uuid not null references public.control_catalog(id) on delete cascade,
  answer text not null check (answer in ('yes', 'partial', 'no')),
  note text,
  answered_by uuid references auth.users(id) on delete set null,
  answered_at timestamptz not null default now(),
  unique (assessment_id, control_id)
);

create table if not exists public.assessment_control_statuses (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  control_id uuid not null references public.control_catalog(id) on delete cascade,
  score numeric(5,2) not null,
  rag text not null check (rag in ('red', 'amber', 'green')),
  priority_rank integer not null,
  remediation_summary text not null,
  unique (assessment_id, control_id)
);

create table if not exists public.remediation_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assessment_id uuid not null references public.assessments(id) on delete cascade,
  control_id uuid not null references public.control_catalog(id) on delete cascade,
  title text not null,
  description text not null,
  priority text not null check (priority in ('high', 'medium', 'low')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'done')),
  owner_user_id uuid references auth.users(id) on delete set null,
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  owner_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'valid' check (status in ('valid', 'expiring', 'expired')),
  expires_at date,
  last_reviewed_at date,
  created_at timestamptz not null default now()
);

create table if not exists public.evidence_item_controls (
  evidence_item_id uuid not null references public.evidence_items(id) on delete cascade,
  control_id uuid not null references public.control_catalog(id) on delete cascade,
  primary key (evidence_item_id, control_id)
);

create table if not exists public.evidence_files (
  id uuid primary key default gen_random_uuid(),
  evidence_item_id uuid not null references public.evidence_items(id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  mime_type text not null,
  byte_size bigint not null,
  checksum_sha256 text,
  uploaded_by uuid references auth.users(id) on delete set null,
  uploaded_at timestamptz not null default now()
);

create table if not exists public.email_notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  evidence_item_id uuid not null references public.evidence_items(id) on delete cascade,
  template_code text not null,
  reminder_day integer not null,
  recipient_email text not null,
  provider_message_id text,
  sent_at timestamptz not null default now(),
  unique (evidence_item_id, template_code, reminder_day, recipient_email)
);

create table if not exists public.policy_templates (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text not null,
  default_sections_json jsonb not null,
  prompt_version text not null,
  is_active boolean not null default true
);

create table if not exists public.policy_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  template_id uuid not null references public.policy_templates(id) on delete cascade,
  requested_by uuid references auth.users(id) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'generating', 'completed', 'failed')),
  model text not null,
  input_context_json jsonb not null,
  input_hash text not null,
  structured_content_json jsonb,
  docx_path text,
  pdf_path text,
  error_message text,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (organization_id, template_id, input_hash)
);

create index if not exists idx_organization_members_user_id
  on public.organization_members (user_id);

create index if not exists idx_organization_invites_org_id
  on public.organization_invites (organization_id);

create index if not exists idx_subscriptions_plan_id
  on public.subscriptions (plan_id);

create index if not exists idx_onboarding_responses_org_id
  on public.onboarding_responses (organization_id);

create index if not exists idx_control_catalog_sort_order
  on public.control_catalog (sort_order);

create index if not exists idx_assessments_org_id
  on public.assessments (organization_id);

create index if not exists idx_assessment_answers_assessment_id
  on public.assessment_answers (assessment_id);

create index if not exists idx_assessment_control_statuses_assessment_id
  on public.assessment_control_statuses (assessment_id);

create index if not exists idx_remediation_actions_org_id
  on public.remediation_actions (organization_id);

create index if not exists idx_remediation_actions_assessment_id
  on public.remediation_actions (assessment_id);

create index if not exists idx_evidence_items_org_id
  on public.evidence_items (organization_id);

create index if not exists idx_evidence_item_controls_control_id
  on public.evidence_item_controls (control_id);

create index if not exists idx_evidence_files_evidence_item_id
  on public.evidence_files (evidence_item_id);

create index if not exists idx_email_notifications_org_id
  on public.email_notifications (organization_id);

create index if not exists idx_email_notifications_evidence_item_id
  on public.email_notifications (evidence_item_id);

create index if not exists idx_policy_documents_org_id
  on public.policy_documents (organization_id);

create index if not exists idx_policy_documents_template_id
  on public.policy_documents (template_id);

create index if not exists idx_policy_documents_status
  on public.policy_documents (status);

create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

insert into storage.buckets (id, name, public)
values
  ('evidence', 'evidence', false),
  ('generated-documents', 'generated-documents', false)
on conflict (id) do update
set public = excluded.public;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_invites enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.onboarding_responses enable row level security;
alter table public.control_catalog enable row level security;
alter table public.assessments enable row level security;
alter table public.assessment_answers enable row level security;
alter table public.assessment_control_statuses enable row level security;
alter table public.remediation_actions enable row level security;
alter table public.evidence_items enable row level security;
alter table public.evidence_item_controls enable row level security;
alter table public.evidence_files enable row level security;
alter table public.email_notifications enable row level security;
alter table public.policy_templates enable row level security;
alter table public.policy_documents enable row level security;

create policy "profiles_select_self"
on public.profiles
for select
to authenticated
using (user_id = auth.uid());

create policy "profiles_insert_self"
on public.profiles
for insert
to authenticated
with check (user_id = auth.uid());

create policy "profiles_update_self"
on public.profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "organizations_select_member"
on public.organizations
for select
to authenticated
using (public.is_org_member(id));

create policy "organizations_insert_authenticated"
on public.organizations
for insert
to authenticated
with check (true);

create policy "organizations_update_admin"
on public.organizations
for update
to authenticated
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

create policy "organization_members_select_member"
on public.organization_members
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "organization_members_insert_owner_bootstrap_or_admin"
on public.organization_members
for insert
to authenticated
with check (
  (
    user_id = auth.uid()
    and role = 'owner'
    and not exists (
      select 1
      from public.organization_members existing
      where existing.organization_id = organization_members.organization_id
    )
  )
  or public.is_org_admin(organization_id)
);

create policy "organization_members_update_admin"
on public.organization_members
for update
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create policy "organization_members_delete_admin"
on public.organization_members
for delete
to authenticated
using (public.is_org_admin(organization_id));

create policy "organization_invites_admin_all"
on public.organization_invites
for all
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create policy "plans_read_authenticated"
on public.plans
for select
to authenticated
using (true);

create policy "subscriptions_select_member"
on public.subscriptions
for select
to authenticated
using (public.is_org_member(organization_id));

create policy "subscriptions_insert_admin"
on public.subscriptions
for insert
to authenticated
with check (public.is_org_admin(organization_id));

create policy "subscriptions_update_admin"
on public.subscriptions
for update
to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

create policy "onboarding_responses_member_all"
on public.onboarding_responses
for all
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "control_catalog_read_authenticated"
on public.control_catalog
for select
to authenticated
using (true);

create policy "assessments_member_all"
on public.assessments
for all
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "assessment_answers_member_all"
on public.assessment_answers
for all
to authenticated
using (
  exists (
    select 1
    from public.assessments a
    where a.id = assessment_answers.assessment_id
      and public.is_org_member(a.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.assessments a
    where a.id = assessment_answers.assessment_id
      and public.is_org_member(a.organization_id)
  )
);

create policy "assessment_control_statuses_member_all"
on public.assessment_control_statuses
for all
to authenticated
using (
  exists (
    select 1
    from public.assessments a
    where a.id = assessment_control_statuses.assessment_id
      and public.is_org_member(a.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.assessments a
    where a.id = assessment_control_statuses.assessment_id
      and public.is_org_member(a.organization_id)
  )
);

create policy "remediation_actions_member_all"
on public.remediation_actions
for all
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "evidence_items_member_all"
on public.evidence_items
for all
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "evidence_item_controls_member_all"
on public.evidence_item_controls
for all
to authenticated
using (
  exists (
    select 1
    from public.evidence_items ei
    where ei.id = evidence_item_controls.evidence_item_id
      and public.is_org_member(ei.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.evidence_items ei
    where ei.id = evidence_item_controls.evidence_item_id
      and public.is_org_member(ei.organization_id)
  )
);

create policy "evidence_files_member_all"
on public.evidence_files
for all
to authenticated
using (
  exists (
    select 1
    from public.evidence_items ei
    where ei.id = evidence_files.evidence_item_id
      and public.is_org_member(ei.organization_id)
  )
)
with check (
  exists (
    select 1
    from public.evidence_items ei
    where ei.id = evidence_files.evidence_item_id
      and public.is_org_member(ei.organization_id)
  )
);

create policy "email_notifications_member_all"
on public.email_notifications
for all
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "policy_templates_read_authenticated"
on public.policy_templates
for select
to authenticated
using (true);

create policy "policy_documents_member_all"
on public.policy_documents
for all
to authenticated
using (public.is_org_member(organization_id))
with check (public.is_org_member(organization_id));

create policy "storage_evidence_read_member"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'evidence'
  and public.is_org_member(public.storage_org_id(name))
);

create policy "storage_evidence_insert_member"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'evidence'
  and public.is_org_member(public.storage_org_id(name))
);

create policy "storage_evidence_update_member"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'evidence'
  and public.is_org_member(public.storage_org_id(name))
)
with check (
  bucket_id = 'evidence'
  and public.is_org_member(public.storage_org_id(name))
);

create policy "storage_evidence_delete_member"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'evidence'
  and public.is_org_member(public.storage_org_id(name))
);

create policy "storage_generated_docs_read_member"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'generated-documents'
  and public.is_org_member(public.storage_org_id(name))
);

create policy "storage_generated_docs_insert_member"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'generated-documents'
  and public.is_org_member(public.storage_org_id(name))
);

create policy "storage_generated_docs_update_member"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'generated-documents'
  and public.is_org_member(public.storage_org_id(name))
)
with check (
  bucket_id = 'generated-documents'
  and public.is_org_member(public.storage_org_id(name))
);

create policy "storage_generated_docs_delete_member"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'generated-documents'
  and public.is_org_member(public.storage_org_id(name))
);
