# 언제보꼬

친구들과 만날 수 있는 날을 함께 찾는 일정 조율 웹앱.

---

## 기능

### 인증
- **Google OAuth / 아이디·비밀번호** 로그인 및 회원가입
- **비밀번호 찾기** — 등록된 이메일로 재설정 링크 발송

### 비로그인 게스트 체험
- **로그인 없이 체험하기** — 닉네임만 입력하면 방 1개 생성 가능
- **비로그인 초대 참여** — 공유 링크 클릭 후 닉네임만 입력하면 바로 참여
- **세션 유지** — `localStorage`에 게스트 ID 저장, 브라우저 재시작 후에도 방 유지
- **게스트 → 로그인 전환** — 로그인 시 게스트로 참여했던 방 이력 자동 병합
- **방 1개 제한** — 게스트는 방 1개만 참여 가능, 추가 참여 시 로그인 유도
- **게스트 방 30일 자동 만료** — 로그인 전환 시 만료 해제되어 영구 보존

### 방 관리
- **방 만들기** — 방 이름 입력 후 6자리 랜덤 코드로 방 생성
- **초대** — 방 코드 또는 URL 링크로 초대. 링크 클릭 시 로그인/비로그인 선택 후 자동 참여
- **방 코드로 참여** — 로그인 유저 전용 (게스트는 초대 링크로만 참여)
- **방 나가기 / 삭제** — 방장이 나가면 방 전체 삭제, 일반 멤버는 본인만 퇴장
- **방 이름 변경** — 방 내에서 이름 수정 가능
- **날짜 확정** — 방장이 최종 날짜를 확정하면 모든 멤버에게 표시

### 캘린더
- **스케줄 입력** — 달력에서 안 되는 날을 탭해서 표시, 다시 탭하면 취소
- **실시간 반영** — Supabase Realtime으로 다른 참여자의 변경이 즉시 반영
- **가능한 날 하이라이트** — 모든 참여자가 가능한 날을 자동 감지해서 배너로 표시
- **참여자 현황** — 멤버별 안 되는 날 수 표시, 멤버마다 고유 색상 지정

### 홈 화면
- **통합 달력** — 확정된 모임 날짜를 개인 달력에서 한눈에 확인
- **방 목록** — 참여 중인 방 목록, 길게 눌러 나가기 가능
- **내 정보** — 표시 이름 수정, 로그아웃

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| UI | React 18, Vite |
| 스타일 | CSS Variables, 인라인 스타일 |
| 인증 | Supabase Auth (Google OAuth, 아이디/비밀번호) |
| DB | Supabase (PostgreSQL + RLS) |
| 실시간 | Supabase Realtime (postgres_changes) |
| 배포 | Vercel / Netlify (정적 빌드) |

---

## 프로젝트 구조

```
src/
├── constants.js           # FACE_CONFIGS, MEMBER_COLORS 등 전역 상수
├── utils.js               # 순수 헬퍼 함수 (genId, toDateStr, getUserName 등)
├── supabase.js            # Supabase 클라이언트 초기화
│
├── hooks/
│   ├── useAuth.js         # 인증 상태, Google/아이디 로그인, 로그아웃, 이름 수정
│   ├── useRooms.js        # 방 목록 조회·생성·참여·나가기, 게스트 RPC 호출
│   ├── useMembers.js      # 멤버 목록, 실시간 구독, 날짜 토글
│   ├── useHolidays.js     # 공휴일 데이터
│   └── useAnimatedIcon.js # 로딩 아이콘 애니메이션
│
├── components/
│   ├── Face.jsx           # SVG 감정 아이콘 (9가지 표정)
│   ├── TopBar.jsx         # 뒤로가기 + 제목 헤더
│   ├── Toast.jsx          # 하단 알림 메시지
│   ├── LandingPage.jsx    # 첫 방문 랜딩 페이지
│   ├── LoginScreen.jsx    # 로그인 / 회원가입 / 비밀번호 찾기
│   ├── GuestChoiceScreen.jsx # 초대 링크 접근 시 로그인·비로그인 선택
│   ├── HomeScreen.jsx     # 홈 달력, 방 목록, 내 정보 탭
│   ├── CreateScreen.jsx   # 방 이름 입력 후 방 생성
│   ├── JoinCodeScreen.jsx # 6자리 코드 입력으로 방 참여 (로그인 전용)
│   ├── CalendarScreen.jsx # 달력, 날짜 선택, 참여자 현황
│   └── ShareModal.jsx     # 방 코드 + 링크 공유 모달
│
├── App.jsx                # 화면 전환 라우터, 게스트 세션 관리
├── index.css              # 전역 스타일 (CSS Variables 기반)
└── main.jsx               # React 진입점
```

---

## 환경 변수

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## DB 스키마

```sql
-- 방
rooms (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  confirmed_day TEXT,                        -- 확정 날짜 (YYYY-MM-DD)
  expires_at   TIMESTAMPTZ,                  -- 게스트 방 만료일 (로그인 방은 NULL)
  created_at   TIMESTAMPTZ DEFAULT now()
)

-- 참여자
members (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id          TEXT REFERENCES rooms(id) ON DELETE CASCADE,
  user_id          UUID,                     -- 로그인 유저 ID 또는 게스트 UUID
  name             TEXT NOT NULL,
  unavailable_days TEXT[] NOT NULL DEFAULT '{}', -- 안 되는 날 (YYYY-MM-DD)
  created_at       TIMESTAMPTZ DEFAULT now()
)
```

### Supabase RPC 함수

| 함수 | 설명 |
|------|------|
| `guest_create_room` | 게스트 방 생성 (RLS 우회, 30일 만료 설정) |
| `guest_join_room` | 게스트 방 참여 (중복 참여 방지) |
| `guest_leave_room` | 게스트 방 나가기 |
| `merge_guest_to_user` | 게스트 이력을 로그인 계정으로 병합, 만료 해제 |
| `cleanup_expired_rooms` | 만료된 게스트 방 삭제 |
