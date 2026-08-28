-- ══════════════════════════════════════════════
-- 처음 설치 (새 프로젝트)
-- ══════════════════════════════════════════════

create table if not exists rooms (
  id text primary key,
  name text not null,
  month text not null,
  created_at timestamptz default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  room_id text not null references rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  unavailable_days int[] not null default '{}',
  created_at timestamptz default now(),
  unique(room_id, user_id)
);

alter table rooms enable row level security;
alter table members enable row level security;

-- Rooms: 누구나 읽기, 로그인 유저만 생성/삭제
create policy "read rooms"        on rooms for select using (true);
create policy "auth insert rooms" on rooms for insert with check (auth.role() = 'authenticated');
create policy "auth delete rooms" on rooms for delete using (auth.role() = 'authenticated');

-- Members: 누구나 읽기, 본인 레코드만 수정
create policy "read members"         on members for select using (true);
create policy "manage own membership" on members for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ══════════════════════════════════════════════
-- 기존 테이블 마이그레이션 (이미 만들어진 경우)
-- ══════════════════════════════════════════════

-- 날짜 확정 기능 추가
-- alter table rooms add column if not exists confirmed_day int;
-- create policy "auth update rooms" on rooms for update using (auth.role() = 'authenticated');

-- alter table members add column if not exists user_id uuid references auth.users(id) on delete cascade;
-- alter table members drop constraint if exists members_room_id_name_key;
-- alter table members add constraint members_room_id_user_id_key unique(room_id, user_id);

-- drop policy if exists "allow all rooms"   on rooms;
-- drop policy if exists "allow all members" on members;

-- create policy "read rooms"        on rooms for select using (true);
-- create policy "auth insert rooms" on rooms for insert with check (auth.role() = 'authenticated');
-- create policy "auth delete rooms" on rooms for delete using (auth.role() = 'authenticated');

-- create policy "read members"          on members for select using (true);
-- create policy "manage own membership" on members for all
--   using (auth.uid() = user_id) with check (auth.uid() = user_id);
