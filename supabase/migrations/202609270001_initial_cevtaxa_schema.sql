-- CEVTEXA initial Supabase schema
-- Safe baseline for public site + future admin/CMS.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  role text not null default 'staff' check (role in ('owner','admin','editor','staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  company text,
  email text not null,
  phone text,
  whatsapp text,
  country text,
  city text,
  website text,
  service_required text,
  industry text,
  project_description text,
  budget_range text,
  expected_timeline text,
  current_website text,
  preferred_contact_method text,
  lead_source text,
  utm_source text,
  utm_campaign text,
  status text not null default 'new' check (status in ('new','contacted','qualified','proposal_sent','negotiation','won','lost')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  assigned_to uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  activity_type text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  icon text,
  featured boolean not null default false,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  client_name text,
  industry text,
  services text[] default '{}',
  cover_image text,
  project_url text,
  featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_studies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  slug text not null unique,
  challenge text,
  solution text,
  results text,
  content text,
  cover_image text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blog_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image text,
  category_id uuid references public.blog_categories(id) on delete set null,
  author_id uuid references public.profiles(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  company text,
  role text,
  content text not null,
  avatar_url text,
  rating integer check (rating between 1 and 5),
  featured boolean not null default false,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  bio text,
  photo_url text,
  linkedin_url text,
  sort_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.job_openings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  department text,
  location text,
  employment_type text,
  description text,
  requirements text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.job_openings(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  resume_url text,
  portfolio_url text,
  cover_letter text,
  status text not null default 'new' check (status in ('new','reviewing','shortlisted','rejected','hired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  alt_text text,
  uploaded_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.seo_settings (
  id uuid primary key default gen_random_uuid(),
  page_slug text not null unique,
  title text,
  description text,
  keywords text,
  og_image text,
  canonical_url text,
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new' check (status in ('new','read','replied','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  description text,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_assigned_to_idx on public.leads(assigned_to);
create index if not exists lead_notes_lead_id_idx on public.lead_notes(lead_id);
create index if not exists lead_activities_lead_id_idx on public.lead_activities(lead_id);
create index if not exists projects_published_idx on public.projects(is_published);
create index if not exists case_studies_project_id_idx on public.case_studies(project_id);
create index if not exists blog_posts_status_idx on public.blog_posts(status);
create index if not exists blog_posts_published_at_idx on public.blog_posts(published_at desc);
create index if not exists job_openings_active_idx on public.job_openings(is_active);
create index if not exists job_applications_job_id_idx on public.job_applications(job_id);
create index if not exists activity_logs_created_at_idx on public.activity_logs(created_at desc);

-- Updated-at trigger helper
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Apply to mutable content tables
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles','leads','services','projects','case_studies','blog_posts','job_openings','job_applications','pages','site_settings','seo_settings']
  LOOP
    EXECUTE format('drop trigger if exists %I_updated_at on public.%I', t, t);
    EXECUTE format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  END LOOP;
END $$;

-- Profile row is created automatically when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Admin helper avoids recursive RLS checks against profiles.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('owner','admin')
  );
$$;

-- Grants: outer PostgreSQL privilege gate before RLS.
grant usage on schema public to anon, authenticated;

grant select on public.services, public.projects, public.case_studies, public.blog_categories, public.blog_posts,
  public.testimonials, public.team_members, public.job_openings, public.pages, public.seo_settings to anon, authenticated;

grant insert on public.leads, public.contact_messages, public.job_applications to anon, authenticated;

grant select, insert, update, delete on public.profiles, public.leads, public.lead_notes, public.lead_activities,
  public.services, public.projects, public.case_studies, public.blog_categories, public.blog_posts,
  public.testimonials, public.team_members, public.job_openings, public.job_applications, public.media,
  public.pages, public.site_settings, public.seo_settings, public.contact_messages, public.activity_logs to authenticated;

grant usage, select on all sequences in schema public to anon, authenticated;

-- RLS everywhere
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['profiles','leads','lead_notes','lead_activities','services','projects','case_studies','blog_categories','blog_posts','testimonials','team_members','job_openings','job_applications','media','pages','site_settings','seo_settings','contact_messages','activity_logs']
  LOOP
    EXECUTE format('alter table public.%I enable row level security', t);
  END LOOP;
END $$;

-- Public content read policies
create policy "public read published services" on public.services for select to anon, authenticated using (is_published);
create policy "public read published projects" on public.projects for select to anon, authenticated using (is_published);
create policy "public read published case studies" on public.case_studies for select to anon, authenticated using (is_published);
create policy "public read blog categories" on public.blog_categories for select to anon, authenticated using (true);
create policy "public read published blog posts" on public.blog_posts for select to anon, authenticated using (status = 'published');
create policy "public read published testimonials" on public.testimonials for select to anon, authenticated using (is_published);
create policy "public read published team" on public.team_members for select to anon, authenticated using (is_published);
create policy "public read active jobs" on public.job_openings for select to anon, authenticated using (is_active);
create policy "public read published pages" on public.pages for select to anon, authenticated using (status = 'published');
create policy "public read seo settings" on public.seo_settings for select to anon, authenticated using (true);

-- Public submission policies. No public SELECT access to these records.
create policy "public submit leads" on public.leads for insert to anon, authenticated with check (true);
create policy "public submit contact messages" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "public submit job applications" on public.job_applications for insert to anon, authenticated with check (true);

-- Admin/team policies. Owner/admin have full access; authenticated staff can read operational records.
create policy "admins manage profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "users read own profile" on public.profiles for select to authenticated using (id = auth.uid());

create policy "admins manage leads" on public.leads for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage lead notes" on public.lead_notes for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage lead activities" on public.lead_activities for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "admins manage services" on public.services for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage projects" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage case studies" on public.case_studies for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage blog categories" on public.blog_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage blog posts" on public.blog_posts for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage testimonials" on public.testimonials for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage team" on public.team_members for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage jobs" on public.job_openings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage applications" on public.job_applications for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage media" on public.media for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage pages" on public.pages for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage site settings" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage seo settings" on public.seo_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage contact messages" on public.contact_messages for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admins manage activity logs" on public.activity_logs for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Storage buckets for future CMS/media work.
insert into storage.buckets (id, name, public) values
  ('site-media','site-media',true),
  ('blog','blog',true),
  ('projects','projects',true),
  ('team','team',true),
  ('careers','careers',false)
on conflict (id) do nothing;

-- Public read for public media buckets.
create policy "public read site media" on storage.objects for select to anon, authenticated using (bucket_id in ('site-media','blog','projects','team'));

-- Admin uploads/updates/deletes.
create policy "admins manage storage" on storage.objects for all to authenticated
using (public.is_admin()) with check (public.is_admin());
