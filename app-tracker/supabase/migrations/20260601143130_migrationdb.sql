-- ============================================================
-- JobLedger — Supabase Schema
-- Run this in your Supabase project's SQL editor
-- ============================================================

-- Applications table
create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  company_name text not null,
  job_title text not null,
  status text check (
    status in ('wishlist', 'applied', 'interview', 'offer', 'rejected')
  ) not null default 'wishlist',
  job_url text,
  location text,
  salary_range text,
  notes text,
  applied_date date,
  followup_date date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row Level Security
alter table applications enable row level security;

-- Policy: users can only access their own rows
create policy "Users can only access their own applications"
  on applications
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger: auto-update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on applications
  for each row
  execute procedure update_updated_at_column();

-- Optional: index for fast user lookups
create index if not exists applications_user_id_idx on applications(user_id);
create index if not exists applications_status_idx on applications(user_id, status);
