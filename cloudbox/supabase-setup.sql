-- Run this in Supabase SQL Editor. Create a private Storage bucket named cloudbox-files (no public access).
create table if not exists public.cloudbox_files (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 name text not null,
 storage_path text not null unique,
 mime_type text not null default 'application/octet-stream',
 size bigint not null default 0 check (size >= 0),
 created_at timestamptz not null default now()
);
alter table public.cloudbox_files enable row level security;
create policy "Users read own file records" on public.cloudbox_files for select to authenticated using (auth.uid() = owner_id);
create policy "Users insert own file records" on public.cloudbox_files for insert to authenticated with check (auth.uid() = owner_id);
create policy "Users delete own file records" on public.cloudbox_files for delete to authenticated using (auth.uid() = owner_id);
-- Storage bucket must be private. Object path format: <auth-user-id>/<random>-<filename>
create policy "Users upload to own folder" on storage.objects for insert to authenticated with check (bucket_id = 'cloudbox-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users read own objects" on storage.objects for select to authenticated using (bucket_id = 'cloudbox-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Users delete own objects" on storage.objects for delete to authenticated using (bucket_id = 'cloudbox-files' and (storage.foldername(name))[1] = auth.uid()::text);