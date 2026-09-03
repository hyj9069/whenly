import { useState, useEffect, useRef } from 'react'
import { useAuth } from './hooks/useAuth'
import { useRooms } from './hooks/useRooms'
import { useMembers } from './hooks/useMembers'
import Face from './components/Face'
import Toast from './components/Toast'
import LoginScreen from './components/LoginScreen'
import HomeScreen from './components/HomeScreen'
import CreateScreen from './components/CreateScreen'
import JoinCodeScreen from './components/JoinCodeScreen'
import CalendarScreen from './components/CalendarScreen'
import ShareModal from './components/ShareModal'

function PasswordResetScreen({ onSubmit }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 8) { setError('8자 이상 입력해주세요.'); return }
    if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) { setError('영문+숫자 조합으로 입력해주세요.'); return }
    if (password !== confirm) { setError('비밀번호가 일치하지 않아요.'); return }
    setLoading(true)
    const err = await onSubmit(password)
    setLoading(false)
    if (err) setError('오류가 발생했어요. 다시 시도해주세요.')
  }

  const inputSt = { width: '100%', padding: '13px 14px', borderRadius: 12, border: '1.5px solid rgba(0,0,0,.13)', fontSize: '.95rem', fontFamily: 'inherit', outline: 'none', background: '#fff', boxSizing: 'border-box' }

  return (
    <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', padding: '0 28px' }}>
      <div style={{ width: '100%', maxWidth: 340 }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: 20 }}>새 비밀번호 설정</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input style={inputSt} type="password" placeholder="새 비밀번호 (영문+숫자 조합 8자 이상)" value={password} onChange={e => setPassword(e.target.value)} />
          <input style={inputSt} type="password" placeholder="비밀번호 확인" value={confirm} onChange={e => setConfirm(e.target.value)} />
          {error && <div style={{ fontSize: '.83rem', color: '#C85050', fontWeight: 600 }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: 14, border: 'none', background: '#7098C0', color: '#fff', fontWeight: 800, fontSize: '.97rem', cursor: 'pointer', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
            {loading ? '잠시만요...' : '비밀번호 변경'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  const { user, loading, recovering, myName, loginWithGoogle, signInWithId, signUpWithId, resetPassword, updatePassword, logout, updateName } = useAuth()
  const { myRooms, loadMyRooms, createRoom, joinRoom, leaveRoom, leaveRoomById, confirmDay, renameRoom } = useRooms(user, myName)
  const [screen, setScreen] = useState('home')
  const [room, setRoom] = useState(null)
  const { members, toggleDay } = useMembers(room)
  const [showShare, setShowShare] = useState(false)
  const [toast, setToast] = useState({ msg: '', vis: false })
  const toastTimer = useRef(null)

  function showToast(msg) {
    setToast({ msg, vis: true })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, vis: false })), 2600)
  }

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
    setTimeout(() => setShowShare(true), 500)
  }

  async function handleJoinByCode(code) {
    const roomData = await joinRoom(code)
    if (!roomData) { showToast('방을 찾을 수 없어요 😢'); return }
    setRoom(roomData)
    setScreen('cal')
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

  async function goHome(tab = 'home') {
    setHomeInitialTab(tab)
    setRoom(null)
    setScreen('home')
    await loadMyRooms()
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', flexDirection: 'column', gap: 16 }}>
      <Face type="bored" size={60} />
      <div style={{ fontSize: '.85rem', color: 'var(--mid)' }}>로딩 중...</div>
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
          user={user} myName={myName} myRooms={myRooms}
          initialTab={homeInitialTab}
          onCreate={() => setScreen('create')}
          onJoinCode={() => setScreen('join')}
          onEnterRoom={r => { setRoom(r); setScreen('cal') }}
          onLogout={handleLogout}
          onUpdateName={updateName}
          onLeaveRoom={leaveRoomById}
        />
      )}

      {user && screen === 'create' && (
        <CreateScreen onBack={() => goHome('rooms')} onCreate={handleCreate} defaultName={myName} />
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
          onHome={() => goHome('rooms')}
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
