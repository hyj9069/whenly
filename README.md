# 언제보꼬

친구들과 만날 수 있는 날을 함께 찾는 일정 조율 웹앱.

---

## 기능

- **로그인** — Google OAuth 또는 아이디/비밀번호로 인증. 초대 링크로 진입 시 로그인 후 자동으로 해당 방에 참여.
- **방 만들기** — 방 이름과 대상 월을 설정하면 6자리 랜덤 코드로 방이 생성됨.
- **초대** — 방 코드 또는 URL 링크로 친구를 초대. 링크 클릭 시 로그인 후 자동 참여.
- **스케줄 캘린더** — 달력에서 안 되는 날을 탭해서 표시. 다시 탭하면 취소.
- **실시간 반영** — Supabase Realtime으로 다른 참여자의 변경이 즉시 반영됨.
- **가능한 날 하이라이트** — 모든 참여자가 가능한 날을 자동으로 감지해서 배너로 표시.
- **참여자 현황** — 각 멤버별 안 되는 날 수 표시. 멤버마다 고유 색상 지정.
- **방 나가기 / 삭제** — 방장이 나가면 방 전체 삭제, 일반 멤버는 본인만 퇴장.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| UI | React 18, Vite |
| 스타일 | CSS Variables, 인라인 스타일 (Tailwind 없음) |
| 인증 | Supabase Auth (Google OAuth, 아이디/비밀번호) |
| DB | Supabase (PostgreSQL) |
| 실시간 | Supabase Realtime (postgres_changes) |
| 배포 | Vercel / Netlify (정적 빌드) |

---

## 프로젝트 구조

```
src/
├── constants.js          # FACE_CONFIGS, MEMBER_COLORS 등 전역 상수
├── utils.js              # 순수 헬퍼 함수 (genId, formatMonth, getUserName 등)
├── supabase.js           # Supabase 클라이언트 초기화
│
├── hooks/
│   ├── useAuth.js        # 인증 상태, 카카오 로그인, 로그아웃
│   ├── useRooms.js       # 방 목록 조회, 방 생성/참여/나가기
│   └── useMembers.js     # 멤버 목록, 실시간 구독, 날짜 토글
│
├── components/
│   ├── Face.jsx          # SVG 감정 아이콘 (9가지 표정)
│   ├── TopBar.jsx        # 뒤로가기 + 제목 헤더
│   ├── Toast.jsx         # 하단 알림 메시지
│   ├── LoginScreen.jsx   # 카카오 로그인 화면
│   ├── HomeScreen.jsx    # 방 목록 + 방 만들기/참여 버튼
│   ├── CreateScreen.jsx  # 방 이름, 대상 월 입력 후 방 생성
│   ├── JoinCodeScreen.jsx# 6자리 코드 입력으로 방 참여
│   ├── CalendarScreen.jsx# 달력, 날짜 선택, 참여자 현황
│   └── ShareModal.jsx    # 방 코드 + 링크 공유 모달
│
├── App.jsx               # 화면 전환 라우터 (screen 상태만 관리)
├── index.css             # 전역 스타일 (CSS Variables 기반)
└── main.jsx              # React 진입점
```

---

## 설계 원칙

**Custom Hook으로 로직 분리**
- 컴포넌트는 UI만 담당하고, Supabase 호출과 상태 관리는 `hooks/`에 위치.
- `useAuth` → `useRooms` → `useMembers` 순으로 의존성이 단방향으로 흐름.

**App.jsx는 라우터 역할만**
- `screen` 상태(`home` / `create` / `join` / `cal`)로 화면 전환.
- 각 화면에 필요한 핸들러를 props로 내려주는 역할만 함.

**상수와 유틸 분리**
- `constants.js`: 변경 빈도가 낮은 설정값 (색상, 표정 설정).
- `utils.js`: 부수효과 없는 순수 함수들. 테스트하기 쉬운 형태로 분리.

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
rooms (id TEXT PK, name TEXT, month TEXT)

-- 참여자
members (id UUID PK, room_id TEXT FK, user_id UUID, name TEXT, unavailable_days INT[], created_at TIMESTAMP)
```
