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

export default function App() {
  const { user, loading, myName, loginWithGoogle, logout, updateName } = useAuth()
  const { myRooms, roomsError, loadMyRooms, createRoom, joinRoom, leaveRoom, leaveRoomById, confirmDay } = useRooms(user, myName)
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

  async function handleCreate(name, month) {
    const created = await createRoom(name, month)
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
    const msg = isHost
      ? '방을 삭제하면 모든 데이터가 사라져요.\n정말 삭제할까요?'
      : '방에서 나갈까요?'
    if (!window.confirm(msg)) return
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
      {!user && <LoginScreen onLogin={loginWithGoogle} />}

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
