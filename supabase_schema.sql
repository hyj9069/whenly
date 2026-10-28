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
-- 월 제거 / 날짜 문자열 마이그레이션
-- (Supabase SQL Editor에서 실행)
-- ══════════════════════════════════════════════

-- rooms: month 컬럼 제거, confirmed_day를 text로 변경
alter table rooms drop column if exists month;
alter table rooms drop column if exists confirmed_day;
alter table rooms add column confirmed_day text;

-- members: unavailable_days를 text[] 로 변경 (YYYY-MM-DD 문자열 저장)
alter table members drop column if exists unavailable_days;
alter table members add column unavailable_days text[] not null default '{}';

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


-- ══════════════════════════════════════════════
-- 게스트 모드 마이그레이션
-- Supabase SQL Editor에서 실행
-- ══════════════════════════════════════════════

-- 게스트 UUID는 auth.users에 없으므로 FK 제거
alter table members drop constraint if exists members_user_id_fkey;

-- 게스트 방 만료 컬럼 추가 (게스트 방만 30일 설정, 로그인 방은 null)
alter table rooms add column if not exists expires_at timestamptz;

-- 만료된 방은 RLS에서 자동 필터
drop policy if exists "read rooms" on rooms;
create policy "read rooms" on rooms for select using (expires_at is null or expires_at > now());

-- 게스트 방 만들기 (SECURITY DEFINER로 RLS 우회)
create or replace function guest_create_room(
  p_room_id   text,
  p_room_name text,
  p_guest_id  text,
  p_guest_name text
)
returns json
language plpgsql
security definer
as $$
begin
  insert into rooms (id, name, expires_at)
  values (p_room_id, p_room_name, now() + interval '30 days');

  insert into members (room_id, user_id, name, unavailable_days)
  values (p_room_id, p_guest_id::uuid, p_guest_name, '{}');

  return json_build_object('id', p_room_id, 'name', p_room_name);
exception
  when others then raise;
end;
$$;

-- 만료된 방 정리 (앱 실행 시 호출)
create or replace function cleanup_expired_rooms()
returns void
language plpgsql
security definer
as $$
begin
  delete from rooms where expires_at < now();
end;
$$;

-- 게스트 방 참가
create or replace function guest_join_room(
  p_room_code  text,
  p_guest_id   text,
  p_guest_name text
)
returns json
language plpgsql
security definer
as $$
declare
  v_room record;
begin
  select id, name, confirmed_day into v_room
  from rooms where id = p_room_code;

  if not found then return null; end if;

  if not exists (
    select 1 from members
    where room_id = p_room_code and user_id = p_guest_id::uuid
  ) then
    insert into members (room_id, user_id, name, unavailable_days)
    values (p_room_code, p_guest_id::uuid, p_guest_name, '{}');
  end if;

  return json_build_object(
    'id', v_room.id,
    'name', v_room.name,
    'confirmed_day', v_room.confirmed_day
  );
end;
$$;

-- 게스트 방 나가기
create or replace function guest_leave_room(
  p_room_id  text,
  p_guest_id text
)
returns void
language plpgsql
security definer
as $$
begin
  delete from members
  where room_id = p_room_id and user_id = p_guest_id::uuid;
end;
$$;

-- 게스트 → 로그인 계정 병합
-- 같은 방에 이미 계정이 있으면 게스트 row 삭제, 없으면 user_id를 계정으로 교체
create or replace function merge_guest_to_user(
  p_guest_id text,
  p_user_id  uuid
)
returns void
language plpgsql
security definer
as $$
begin
  delete from members
  where user_id = p_guest_id::uuid
    and room_id in (
      select room_id from members where user_id = p_user_id
    );

  update members
  set user_id = p_user_id
  where user_id = p_guest_id::uuid;

  -- 병합된 방은 만료 해제 (로그인 계정 소유가 됐으므로)
  update rooms set expires_at = null
  where id in (select room_id from members where user_id = p_user_id)
    and expires_at is not null;
end;
$$;
