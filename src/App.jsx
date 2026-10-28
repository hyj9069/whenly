import { useState, useEffect, useRef } from 'react'
import { useAuth } from './hooks/useAuth'
import { useRooms } from './hooks/useRooms'
import { useMembers } from './hooks/useMembers'
import Toast from './components/Toast'
import { useAnimatedIcon } from './hooks/useAnimatedIcon'
import LoginScreen from './components/LoginScreen'
import HomeScreen from './components/HomeScreen'
import CreateScreen from './components/CreateScreen'
import JoinCodeScreen from './components/JoinCodeScreen'
import CalendarScreen from './components/CalendarScreen'
import ShareModal from './components/ShareModal'
import LandingPage from './components/LandingPage'
import GuestChoiceScreen from './components/GuestChoiceScreen'
import { icon1, icon2, icon3, icon4 } from './assets/icons'
import profileIcon from './assets/profileIcon.svg'

function PasswordResetScreen({ onSubmit }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirm) { setError('비밀번호가 일치하지 않아요.'); return }
    setLoading(true)
    const err = await onSubmit(password)
    setLoading(false)
    if (err) setError(err.message || '오류가 발생했어요. 다시 시도해주세요.')
  }

  const inputSt = { width: '100%', padding: '13px 14px', borderRadius: 12, border: '1.5px solid rgba(0,0,0,.13)', fontSize: '1.52rem', fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box' }

  return (
    <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', padding: '0 28px' }}>
      <div style={{ width: '100%', maxWidth: 340 }}>
        <h2 style={{ fontWeight: 700, fontSize: '1.92rem', marginBottom: 20 }}>새 비밀번호 설정</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input style={inputSt} type="password" placeholder="새 비밀번호" value={password} onChange={e => setPassword(e.target.value)} />
          <input style={inputSt} type="password" placeholder="비밀번호 확인" value={confirm} onChange={e => setConfirm(e.target.value)} />
          {error && <div style={{ fontSize: '1.33rem', color: '#C85050', fontWeight: 600 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: 14, border: 'none', background: '#7098C0', color: '#fff', fontWeight: 700, fontSize: '1.55rem', cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
            {loading ? '잠시만요...' : '비밀번호 변경'}
          </button>
        </form>
      </div>
    </div>
  )
}

// 체험하기: 닉네임 입력 화면 (로그인 없이 방 만들기 전 단계)
function GuestTryScreen({ onBack, onSubmit, loading }) {
  const [name, setName] = useState('')

  return (
    <div className="screen" style={{ justifyContent: 'center', padding: '0 28px' }}>
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mid)', fontSize: '1.4rem', alignSelf: 'flex-start', padding: '0 0 4px' }}
        >
          ← 뒤로
        </button>
        <h2 style={{ fontWeight: 700, fontSize: '1.92rem', marginBottom: 2 }}>어떻게 불러드릴까요?</h2>
        <p style={{ color: 'var(--mid)', fontSize: '1.36rem', marginBottom: 4 }}>방에서 표시될 이름이에요 (최대 10자)</p>
        <input
          className="inp"
          placeholder="예: 김철수"
          maxLength={10}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !loading && name.trim() && onSubmit(name.trim())}
          autoFocus
        />
        <button className="btn btn-blue" onClick={() => onSubmit(name.trim())} disabled={loading || !name.trim()}>
          {loading ? '잠시만요...' : '다음 →'}
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading, recovering, myName, loginWithGoogle, signInWithId, signUpWithId, resetPassword, updatePassword, logout, updateName } = useAuth()
  const [guestId, setGuestId] = useState(() => localStorage.getItem('guest_id'))
  const [guestName, setGuestName] = useState(() => localStorage.getItem('guest_name') || '')

  const isGuest         = !user && !!guestId
  const effectiveUserId = user?.id || guestId
  const effectiveName   = isGuest && guestName ? guestName : myName

  const { myRooms, roomsLoading, loadMyRooms, createRoom, joinRoom, joinRoomDirect, leaveRoom, leaveRoomById, confirmDay, renameRoom, mergeGuestToUser } = useRooms(user, effectiveName, guestId)
  const [assetsReady, setAssetsReady] = useState(false)
  const [showLanding, setShowLanding] = useState(() => !localStorage.getItem('lp_seen'))

  // 게스트 상태
  const [pendingRoomCode, setPendingRoomCode] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('room')?.toUpperCase() || null
  })
  const [guestJoinLoading, setGuestJoinLoading]     = useState(false)
  const [showGuestLoginScreen, setShowGuestLoginScreen] = useState(false)
  const [loginInitialMode, setLoginInitialMode]     = useState('login')
  const [showGuestTry, setShowGuestTry]             = useState(false)

  const canCreateRoom = !isGuest || myRooms.length < 1

  useEffect(() => {
    const srcs = [icon1, icon2, icon3, icon4, profileIcon]
    Promise.all(srcs.map(src => new Promise(res => {
      const img = new Image(); img.onload = img.onerror = res; img.src = src
    }))).then(() => setAssetsReady(true))
  }, [])

  const [screen, setScreen] = useState('home')
  const [room, setRoom] = useState(null)
  const { members, toggleDay } = useMembers(room, isGuest)
  const [showShare, setShowShare] = useState(false)
  const [toast, setToast] = useState({ msg: '', vis: false })
  const toastTimer = useRef(null)
  const loadingIcon = useAnimatedIcon(loading)

  function showToast(msg) {
    setToast({ msg, vis: true })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, vis: false })), 2600)
  }

  useEffect(() => {
    function handlePop() { if (screen === 'cal') goHome('rooms') }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [screen]) // eslint-disable-line react-hooks/exhaustive-deps

  // 게스트 상태에서 로그인하면 방 이력 병합
  useEffect(() => {
    if (!user || !guestId) return
    mergeGuestToUser(guestId, user.id).then(() => {
      localStorage.removeItem('guest_id')
      localStorage.removeItem('guest_name')
      setGuestId(null)
      setGuestName('')
    })
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // 공유 링크 재방문 시 이미 멤버인 게스트는 자동 입장
  useEffect(() => {
    if (!guestId || !pendingRoomCode || roomsLoading) return
    const existing = myRooms.find(r => r.id === pendingRoomCode)
    if (!existing) return
    window.history.replaceState({}, '', window.location.pathname)
    setPendingRoomCode(null)
    setRoom(existing)
    setScreen('cal')
    history.pushState({ room: true }, '')
  }, [guestId, pendingRoomCode, roomsLoading, myRooms]) // eslint-disable-line react-hooks/exhaustive-deps

  // 로그인된 일반 회원 전용 URL 자동 참여
  useEffect(() => {
    if (loading || !user || roomsLoading) return
    const params = new URLSearchParams(window.location.search)
    const code = params.get('room')
    if (!code) return
    window.history.replaceState({}, '', window.location.pathname)
    handleJoinByCode(code.toUpperCase(), { silent: true })
  }, [user, loading, roomsLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // 비로그인 공유링크 참여 (GuestChoiceScreen에서 닉네임 입력 후)
  async function handleGuestJoin(name) {
    setGuestJoinLoading(true)
    window.history.replaceState({}, '', window.location.pathname)

    const existingId = localStorage.getItem('guest_id')
    const id = existingId || crypto.randomUUID()
    if (!existingId) localStorage.setItem('guest_id', id)
    localStorage.setItem('guest_name', name)
    setGuestId(id)
    setGuestName(name)

    const roomData = await joinRoomDirect(pendingRoomCode, id, name)
    setGuestJoinLoading(false)

    if (!roomData) {
      showToast('방을 찾을 수 없어요')
      return
    }

    setPendingRoomCode(null)
    setRoom(roomData)
    setScreen('cal')
    history.pushState({ room: true }, '')
  }

  // 비로그인 체험하기: 닉네임 입력 완료 → 방 만들기 화면으로
  function handleGuestTryName(name) {
    const existingId = localStorage.getItem('guest_id')
    const id = existingId || crypto.randomUUID()
    if (!existingId) localStorage.setItem('guest_id', id)
    localStorage.setItem('guest_name', name)
    setGuestId(id)
    setGuestName(name)
    setShowGuestTry(false)
    setScreen('create')
  }

  // GuestChoiceScreen에서 "로그인하고 참가하기" 선택
  function handleGuestLoginChoice() {
    localStorage.setItem('lp_seen', '1')
    setShowLanding(false)
    setShowGuestLoginScreen(true)
  }

  // 게스트 상태에서 로그인/회원가입 화면으로 이동
  function handleGoToLogin(initialMode = 'login') {
    setLoginInitialMode(initialMode)
    setPendingRoomCode(null)
    localStorage.setItem('lp_seen', '1')
    setShowLanding(false)
    setGuestName('')
    setGuestId(null)
    localStorage.removeItem('guest_id')
    localStorage.removeItem('guest_name')
    setRoom(null)
    setScreen('home')
    setShowGuestTry(false)
  }

  async function handleCreate(name) {
    const created = await createRoom(name)
    if (!created) { showToast('오류가 발생했어요 😢'); return }
    if (created.error) {
      showToast(`멤버 등록 실패: ${created.error} — Supabase 마이그레이션을 실행해주세요`)
      return
    }
    setRoom(created)
    setScreen('cal')
    history.pushState({ room: true }, '')
    setTimeout(() => setShowShare(true), 500)
  }

  async function handleJoinByCode(code, { silent = false } = {}) {
    const already = myRooms.find(r => r.id === code)
    if (already) {
      setRoom(already)
      setScreen('cal')
      history.pushState({ room: true }, '')
      return
    }
    const roomData = await joinRoom(code)
    if (!roomData) { if (!silent) showToast('방을 찾을 수 없어요 😢'); return }
    setRoom(roomData)
    setScreen('cal')
    history.pushState({ room: true }, '')
  }

  async function handleLeave() {
    const isHost = members[0]?.user_id === effectiveUserId
    await leaveRoom(room.id, isHost)
    setRoom(null)
    setScreen('home')
  }

  function handleLogout() {
    setGuestId(null)
    localStorage.removeItem('guest_id')
    localStorage.removeItem('guest_name')
    setGuestName('')
    logout()
    setRoom(null)
    setScreen('home')
  }

  const [homeInitialTab, setHomeInitialTab] = useState('home')
  const [createFromTab,  setCreateFromTab]  = useState('home')

  async function goHome(tab = 'home') {
    setHomeInitialTab(tab)
    setRoom(null)
    setScreen('home')
    await loadMyRooms()
  }

  // ── 조기 반환: 랜딩 페이지 (공유링크나 체험 없이 첫 방문)
  if (!loading && assetsReady && !user && !recovering && showLanding && !pendingRoomCode) return (
    <LandingPage onStart={() => {
      localStorage.setItem('lp_seen', '1')
      setShowLanding(false)
    }} />
  )

  if (loading || !assetsReady) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <img src={icon4} alt="" style={{ height: 80 }} />
    </div>
  )

  return (
    <>
      {!user && !isGuest && !recovering && !showGuestTry && !(pendingRoomCode && !showGuestLoginScreen) && (
        <LoginScreen
          onGoogle={loginWithGoogle}
          onIdLogin={signInWithId}
          onIdSignup={signUpWithId}
          onResetPassword={resetPassword}
          initialMode={loginInitialMode}
          onGuestTry={() => {
            localStorage.setItem('lp_seen', '1')
            setShowLanding(false)
            setShowGuestTry(true)
          }}
        />
      )}

      {!user && !recovering && showGuestTry && (
        <GuestTryScreen
          onBack={() => setShowGuestTry(false)}
          onSubmit={handleGuestTryName}
          loading={guestJoinLoading}
        />
      )}

      {!user && !recovering && !showGuestTry && pendingRoomCode && !showGuestLoginScreen && (
        <GuestChoiceScreen
          roomCode={pendingRoomCode}
          onLogin={handleGuestLoginChoice}
          onGuestJoin={handleGuestJoin}
          loading={guestJoinLoading}
        />
      )}

      {recovering && (
        <PasswordResetScreen onSubmit={updatePassword} />
      )}

      {(user || isGuest) && screen === 'home' && (
        <HomeScreen
          user={user} myName={effectiveName} myRooms={myRooms} roomsLoading={roomsLoading}
          initialTab={homeInitialTab}
          isGuest={isGuest}
          canCreateRoom={canCreateRoom}
          onCreate={(fromTab = 'rooms') => { setCreateFromTab(fromTab); setScreen('create') }}
          onJoinCode={() => setScreen('join')}
          onEnterRoom={r => { setRoom(r); setScreen('cal') }}
          onLogout={handleLogout}
          onUpdateName={updateName}
          onLeaveRoom={leaveRoomById}
          onGoToLogin={() => handleGoToLogin('login')}
          onGoToSignup={() => handleGoToLogin('signup')}
        />
      )}

      {(user || isGuest) && screen === 'create' && (
        <CreateScreen onBack={() => goHome(createFromTab)} onCreate={handleCreate} defaultName={effectiveName} />
      )}

      {user && screen === 'join' && (
        <JoinCodeScreen onBack={() => goHome('rooms')} onJoin={handleJoinByCode} />
      )}

      {effectiveUserId && screen === 'cal' && room && (
        <CalendarScreen
          room={room} myUserId={effectiveUserId} myName={effectiveName} members={members} isGuest={isGuest}
          onToggleDay={async day => {
            const ok = await toggleDay(room.id, effectiveUserId, day)
            if (ok === false) showToast('저장 실패 — Supabase 마이그레이션을 먼저 실행해주세요')
          }}
          onConfirmDay={async day => {
            const ok = await confirmDay(room.id, day)
            if (ok) setRoom(prev => ({ ...prev, confirmed_day: day }))
          }}
          onRenameRoom={async name => {
            const ok = await renameRoom(room.id, name)
            if (ok) setRoom(prev => ({ ...prev, name }))
          }}
          onOpenShare={() => setShowShare(true)}
          onHome={(tab) => goHome(tab ?? 'rooms')}
          onLeave={handleLeave}
        />
      )}

      {showShare && room && (
        <ShareModal roomId={room.id} onClose={() => setShowShare(false)} onToast={showToast} />
      )}

      <Toast msg={toast.msg} visible={toast.vis} />
    </>
  )
}
