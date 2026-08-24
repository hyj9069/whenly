-- Supabase SQL Editor에 붙여넣고 실행하세요

create table if not exists rooms (
  id text primary key,
  name text not null,
  month text not null,
  created_at timestamptz default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references rooms(id) on delete cascade,
  name text not null,
  unavailable_days int[] not null default '{}',
  created_at timestamptz default now(),
  unique(room_id, name)
);

-- RLS 활성화 (인증 없이 모두 허용)
alter table rooms enable row level security;
alter table members enable row level security;

create policy "allow all rooms"   on rooms   for all using (true) with check (true);
create policy "allow all members" on members for all using (true) with check (true);
