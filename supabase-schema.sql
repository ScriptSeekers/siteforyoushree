-- Run this entire script in Supabase Dashboard > SQL Editor.
create table if not exists public.study_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  progress jsonb not null default '{"done":{}}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.study_progress enable row level security;

drop policy if exists "Users can read their own study progress" on public.study_progress;
create policy "Users can read their own study progress"
on public.study_progress for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own study progress" on public.study_progress;
create policy "Users can insert their own study progress"
on public.study_progress for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own study progress" on public.study_progress;
create policy "Users can update their own study progress"
on public.study_progress for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Enable Realtime for cross-device updates.
alter publication supabase_realtime add table public.study_progress;
