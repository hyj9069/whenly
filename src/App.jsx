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

export default function App() {
  const { user, loading, recovering, myName, loginWithGoogle, signInWithId, signUpWithId, resetPassword, updatePassword, logout, updateName } = useAuth()
  const { myRooms, roomsLoading, loadMyRooms, createRoom, joinRoom, leaveRoom, leaveRoomById, confirmDay, renameRoom } = useRooms(user, myName)
  const [assetsReady, setAssetsReady] = useState(false)

  useEffect(() => {
    const srcs = [icon1, icon2, icon3, icon4, profileIcon]
    Promise.all(srcs.map(src => new Promise(res => {
      const img = new Image(); img.onload = img.onerror = res; img.src = src
    }))).then(() => setAssetsReady(true))
  }, [])
  const [screen, setScreen] = useState('home')
  const [room, setRoom] = useState(null)
  const { members, toggleDay } = useMembers(room)
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

  useEffect(() => {
    if (loading || !user) return
    const params = new URLSearchParams(window.location.search)
    const code = params.get('room')
    if (!code) return
    window.history.replaceState({}, '', window.location.pathname)
    handleJoinByCode(code.toUpperCase())
  }, [user, loading]) // eslint-disable-line react-hooks/exhaustive-deps

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

  async function handleJoinByCode(code) {
    const roomData = await joinRoom(code)
    if (!roomData) { showToast('방을 찾을 수 없어요 😢'); return }
    setRoom(roomData)
    setScreen('cal')
    history.pushState({ room: true }, '')
  }

  async function handleLeave() {
    const isHost = members[0]?.user_id === user.id
    await leaveRoom(room.id, isHost)
    setRoom(null)
    setScreen('home')
  }

  function handleLogout() {
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

  if (loading || !assetsReady) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 10 }}>
      <img src={icon4} alt="" style={{ height: 80 }} />
      <div style={{ fontFamily: 'HakgyoansimSaekyeonpil', fontSize: '3.2rem', color: 'var(--dark)' }}>언제보꼬</div>
      <div style={{ fontSize: '1.28rem', color: 'var(--mid)', marginTop: 4 }}>친구들과 날짜 맞춰봐요</div>
    </div>
  )

  return (
    <>
      {!user && !recovering && (
        <LoginScreen
          onGoogle={loginWithGoogle}
          onIdLogin={signInWithId}
          onIdSignup={signUpWithId}
          onResetPassword={resetPassword}
        />
      )}

      {recovering && (
        <PasswordResetScreen onSubmit={updatePassword} />
      )}

      {user && screen === 'home' && (
        <HomeScreen
          user={user} myName={myName} myRooms={myRooms} roomsLoading={roomsLoading}
          initialTab={homeInitialTab}
          onCreate={(fromTab = 'rooms') => { setCreateFromTab(fromTab); setScreen('create') }}
          onJoinCode={() => setScreen('join')}
          onEnterRoom={r => { setRoom(r); setScreen('cal') }}
          onLogout={handleLogout}
          onUpdateName={updateName}
          onLeaveRoom={leaveRoomById}
        />
      )}

      {user && screen === 'create' && (
        <CreateScreen onBack={() => goHome(createFromTab)} onCreate={handleCreate} defaultName={myName} />
      )}

      {user && screen === 'join' && (
        <JoinCodeScreen onBack={() => goHome('rooms')} onJoin={handleJoinByCode} />
      )}

      {user && screen === 'cal' && room && (
        <CalendarScreen
          room={room} myUserId={user.id} myName={myName} members={members}
          onToggleDay={async day => {
            const ok = await toggleDay(room.id, user.id, day)
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
