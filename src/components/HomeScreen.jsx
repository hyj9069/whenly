import { useState, useEffect, useRef } from 'react'
import Face from './Face'

// ── 헬퍼 ────────────────────────────────────────
function monthKey(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`
}
function dayMonthKey(date) {
  return monthKey(date.getFullYear(), date.getMonth() + 1)
}
function getRoomsForDate(myRooms, date) {
  const key = dayMonthKey(date)
  const d   = date.getDate()
  return myRooms.filter(r => r.month === key && r.confirmed_day === d)
}

// ── 방 아이템 (공통) ─────────────────────────────
function RoomItem({ room, onEnterRoom, selectionMode, selected, onSelect, onLongPress }) {
  const pressTimer = useRef(null)
  const didLongPress = useRef(false)
  const [yr, mo] = room.month.split('-')

  function startPress() {
    didLongPress.current = false
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true
      onLongPress?.(room.id)
    }, 500)
  }
  function cancelPress() { clearTimeout(pressTimer.current) }
  function handleClick() {
    if (didLongPress.current) return
    if (selectionMode) onSelect?.(room.id)
    else onEnterRoom(room)
  }

  return (
    <button
      onClick={handleClick}
      onMouseDown={startPress} onMouseUp={cancelPress} onMouseLeave={cancelPress}
      onTouchStart={startPress} onTouchEnd={cancelPress} onTouchMove={cancelPress}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px',
        background: selected ? 'rgba(91,141,184,.1)' : '#fff',
        border: `2px solid ${selected ? 'var(--calm)' : 'rgba(0,0,0,.07)'}`,
        borderRadius: 16, cursor: 'pointer', textAlign: 'left',
        boxShadow: '0 2px 8px var(--shadow)', fontFamily: 'inherit', width: '100%',
        transition: 'background .15s, border-color .15s',
        userSelect: 'none', WebkitUserSelect: 'none',
      }}>
      {selectionMode ? (
        <div style={{
          width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${selected ? 'var(--calm)' : 'var(--mid)'}`,
          background: selected ? 'var(--calm)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background .15s, border-color .15s',
        }}>
          {selected && <span style={{ color: '#fff', fontSize: '.7rem', fontWeight: 800 }}>✓</span>}
        </div>
      ) : (
        <Face type="calm" size={36} style={{ flexShrink: 0 }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: '.93rem' }}>{room.name}</div>
        <div style={{ fontSize: '.72rem', color: 'var(--mid)', marginTop: 2 }}>{yr}년 {parseInt(mo)}월 · {room.id}</div>
      </div>
      {!selectionMode && <span style={{ color: 'var(--mid)' }}>→</span>}
    </button>
  )
}

// ── 주간 달력 (인터랙티브) ───────────────────────
function WeekCalendar({ selected, onSelect }) {
  const today = new Date()
  const dow = today.getDay()
  const offset = dow === 0 ? -6 : 1 - dow
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() + offset + i)
    return d
  })
  const LABELS = ['월','화','수','목','금','토','일']

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--mid)', marginBottom: 12 }}>
        {today.getFullYear()}년 {today.getMonth() + 1}월
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {week.map((d, i) => {
          const isToday    = d.toDateString() === today.toDateString()
          const isSelected = d.toDateString() === selected.toDateString()
          const labelColor = i === 6 ? '#D05055' : i === 5 ? '#5060CC' : 'var(--mid)'
          const numColor   = i === 6 ? '#D05055' : i === 5 ? '#5060CC' : 'var(--dark)'
          return (
            <div key={i} onClick={() => onSelect(d)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer' }}>
              <span style={{ fontSize: '.62rem', fontWeight: 700, color: labelColor }}>{LABELS[i]}</span>
              <div style={{
                width: 33, height: 33, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isSelected ? 'var(--calm)' : isToday ? 'rgba(112,152,192,.12)' : 'transparent',
                border: isToday && !isSelected ? '1.5px solid var(--calm)' : '1.5px solid transparent',
                color: isSelected ? '#fff' : numColor,
                fontSize: '.85rem', fontWeight: 800, transition: 'all .15s',
              }}>
                {d.getDate()}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── 홈 탭 ───────────────────────────────────────
function HomeTab({ myName, myRooms, onEnterRoom }) {
  const [selected, setSelected] = useState(new Date())
  const rooms = getRoomsForDate(myRooms, selected)

  return (
    <>
      <div style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 16 }}>
        안녕하세요, {myName}님 👋
      </div>

      <WeekCalendar selected={selected} onSelect={setSelected} />

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
        <span style={{ fontSize: '.78rem', fontWeight: 800, color: 'var(--mid)' }}>일정</span>
        <span style={{ fontSize: '.72rem', color: 'var(--mid)' }}>
          {selected.getMonth() + 1}월 {selected.getDate()}일
        </span>
      </div>

      {rooms.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '22px 0', color: 'var(--mid)' }}>
          <Face type="bored" size={50} />
          <div style={{ fontSize: '.84rem', textAlign: 'center', lineHeight: 1.6 }}>
            이 달 예정된 모임이 없어요
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {rooms.map(r => <RoomItem key={r.id} room={r} onEnterRoom={onEnterRoom} />)}
        </div>
      )}
    </>
  )
}

// ── 캘린더 탭 ────────────────────────────────────
function CalendarTab({ myRooms, onEnterRoom }) {
  const today = new Date()
  const [vy, setVy] = useState(today.getFullYear())
  const [vm, setVm] = useState(today.getMonth() + 1)
  const [selDay, setSelDay] = useState(null)

  const curKey    = monthKey(vy, vm)
  const roomsThisMonth = myRooms.filter(r => r.month === curKey)
  const hasRooms  = roomsThisMonth.length > 0
  const firstDay  = new Date(vy, vm - 1, 1).getDay() // 0=Sun
  const totalDays = new Date(vy, vm, 0).getDate()

  const selRooms  = selDay ? myRooms.filter(r => r.month === dayMonthKey(selDay)) : []

  function prev() {
    if (vm === 1) { setVy(y => y - 1); setVm(12) } else setVm(m => m - 1)
    setSelDay(null)
  }
  function next() {
    if (vm === 12) { setVy(y => y + 1); setVm(1) } else setVm(m => m + 1)
    setSelDay(null)
  }

  return (
    <>
      {/* 월 탐색 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={prev}
          style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--mid)', padding: '4px 8px', fontFamily: 'inherit' }}>
          ‹
        </button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: '1rem' }}>
          {vy}년 {vm}월
        </div>
        <button onClick={next}
          style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--mid)', padding: '4px 8px', fontFamily: 'inherit' }}>
          ›
        </button>
      </div>

      {hasRooms && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '8px 12px', background: 'rgba(112,152,192,.1)', borderRadius: 12 }}>
          <Face type="excited" size={22} />
          <span style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--calm)' }}>
            이번 달 모임 {roomsThisMonth.length}개
          </span>
        </div>
      )}

      {/* 달력 그리드 */}
      <div className="card" style={{ marginBottom: 12 }}>
        {/* 요일 헤더 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
          {['일','월','화','수','목','금','토'].map((d, i) => (
            <div key={d} style={{ textAlign: 'center', fontSize: '.65rem', fontWeight: 800, color: i === 0 ? '#D05055' : i === 6 ? '#5060CC' : 'var(--mid)', padding: '4px 0' }}>{d}</div>
          ))}
        </div>

        {/* 날짜 셀 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 0' }}>
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: totalDays }, (_, i) => {
            const d  = i + 1
            const dow = (firstDay + d - 1) % 7
            const date = new Date(vy, vm - 1, d)
            const isToday      = date.toDateString() === today.toDateString()
            const isSelected   = selDay && date.toDateString() === selDay.toDateString()
            const textColor    = dow === 0 ? '#D05055' : dow === 6 ? '#5060CC' : 'var(--dark)'
            const hasConfirmed = roomsThisMonth.some(r => r.confirmed_day === d)

            return (
              <div key={d} onClick={() => setSelDay(date)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: hasConfirmed ? 'pointer' : 'default', padding: '2px 0' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isSelected ? 'var(--calm)' : isToday ? 'rgba(112,152,192,.12)' : 'transparent',
                  border: isToday && !isSelected ? '1.5px solid var(--calm)' : '1.5px solid transparent',
                  color: isSelected ? '#fff' : textColor,
                  fontSize: '.84rem', fontWeight: 800, transition: 'all .15s',
                }}>
                  {d}
                </div>
                <div style={{ height: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {hasConfirmed && (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? 'var(--mid)' : 'var(--calm)', opacity: isSelected ? 0.5 : 0.7 }} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 선택 날짜의 모임 목록 */}
      {selDay && (
        <div>
          <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--mid)', marginBottom: 8 }}>
            {selDay.getMonth() + 1}월 {selDay.getDate()}일 일정
          </div>
          {selRooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--mid)', fontSize: '.84rem' }}>
              이 달 모임 없음
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selRooms.map(r => <RoomItem key={r.id} room={r} onEnterRoom={onEnterRoom} />)}
            </div>
          )}
        </div>
      )}

      {!hasRooms && !selDay && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 0', color: 'var(--mid)' }}>
          <Face type="bored" size={50} />
          <div style={{ fontSize: '.84rem' }}>이 달 예정된 모임이 없어요</div>
        </div>
      )}
    </>
  )
}

// ── 모임 탭 ─────────────────────────────────────
function RoomsTab({ myRooms, onCreate, onJoinCode, onEnterRoom, onLeaveRoom }) {
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showConfirm, setShowConfirm] = useState(false)

  function handleLongPress(id) {
    setSelectionMode(true)
    setSelectedIds(new Set([id]))
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function cancelSelection() {
    setSelectionMode(false)
    setSelectedIds(new Set())
  }

  async function confirmLeave() {
    for (const id of selectedIds) await onLeaveRoom(id)
    setShowConfirm(false)
    cancelSelection()
  }

  return (
    <>
      {selectionMode && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <button className="btn btn-ghost btn-sm" onClick={cancelSelection}>취소</button>
          <span style={{ fontSize: '.83rem', fontWeight: 700, color: 'var(--mid)' }}>{selectedIds.size}개 선택됨</span>
          <button
            className="btn btn-sm"
            style={{ background: 'var(--upset)', color: '#fff', opacity: selectedIds.size === 0 ? 0.5 : 1 }}
            disabled={selectedIds.size === 0}
            onClick={() => setShowConfirm(true)}
          >
            방 나가기
          </button>
        </div>
      )}

      {myRooms.length > 0 ? (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--mid)', marginBottom: 10 }}>참여 중인 방</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myRooms.map(r => (
              <RoomItem
                key={r.id} room={r} onEnterRoom={onEnterRoom}
                selectionMode={selectionMode}
                selected={selectedIds.has(r.id)}
                onSelect={toggleSelect}
                onLongPress={handleLongPress}
              />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--mid)', padding: '32px 0' }}>
          <Face type="bored" size={64} />
          <div style={{ fontSize: '.9rem', textAlign: 'center', lineHeight: 1.6 }}>
            아직 참여 중인 방이 없어요<br />방을 만들거나 초대 링크로 참여해봐요!
          </div>
        </div>
      )}

      {!selectionMode && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <button className="btn btn-blue" onClick={onCreate}>✨ 새로운 방 만들기</button>
          <button className="btn btn-ghost" onClick={onJoinCode}>🔢 방 코드로 참여하기</button>
        </div>
      )}

      {showConfirm && (
        <div className="overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>방을 나가겠어요?</div>
            <div style={{ fontSize: '.85rem', color: 'var(--mid)', marginBottom: 20, lineHeight: 1.6 }}>
              선택한 {selectedIds.size}개의 방에서 나갑니다.<br />내가 만든 방은 삭제됩니다.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>취소</button>
              <button className="btn" style={{ flex: 1, background: 'var(--upset)', color: '#fff' }} onClick={confirmLeave}>확인</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── 내 정보 탭 ──────────────────────────────────
function ProfileTab({ user, myName, onLogout, onUpdateName }) {
  const [editing, setEditing] = useState(false)
  const [name, setName]       = useState(myName)
  const [saving, setSaving]   = useState(false)

  useEffect(() => { setName(myName) }, [myName])

  async function save() {
    if (!name.trim()) return
    setSaving(true)
    await onUpdateName(name.trim())
    setSaving(false)
    setEditing(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '24px 0 16px' }}>
        {user?.user_metadata?.avatar_url
          ? <img src={user.user_metadata.avatar_url} alt="" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(0,0,0,.08)' }} />
          : <Face type="calm" size={72} />
        }
        <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{myName}</div>
        <div style={{ fontSize: '.75rem', color: 'var(--mid)' }}>{user?.email}</div>
      </div>

      <div className="card">
        <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--mid)', marginBottom: 12 }}>표시 이름</div>
        {editing ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input className="inp" value={name} onChange={e => setName(e.target.value)}
              maxLength={20} placeholder="표시 이름 입력" autoFocus />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-blue" style={{ flex: 1, padding: 11 }} onClick={save} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
              <button className="btn btn-ghost btn-sm"
                onClick={() => { setEditing(false); setName(myName) }}>취소</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, fontSize: '.9rem', fontWeight: 700 }}>{myName}</div>
            <button onClick={() => setEditing(true)}
              style={{ background: 'rgba(0,0,0,.05)', border: 'none', borderRadius: 10, padding: '6px 14px', fontSize: '.8rem', fontWeight: 700, cursor: 'pointer', color: 'var(--mid)', fontFamily: 'inherit' }}>
              수정
            </button>
          </div>
        )}
      </div>

      <button className="btn btn-ghost" onClick={onLogout}
        style={{ color: 'var(--upset)', borderColor: 'rgba(196,100,104,.3)' }}>
        로그아웃
      </button>
    </div>
  )
}

// ── 탭바 아이콘 SVG ──────────────────────────────
function HomeIcon({ active }) {
  const c = active ? 'var(--calm)' : 'var(--mid)'
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
    </svg>
  )
}
function CalIcon({ active }) {
  const c = active ? 'var(--calm)' : 'var(--mid)'
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="8" y1="15" x2="8" y2="15" strokeWidth="3" strokeLinecap="round"/>
      <line x1="12" y1="15" x2="12" y2="15" strokeWidth="3" strokeLinecap="round"/>
      <line x1="16" y1="15" x2="16" y2="15" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}
function RoomsIcon({ active }) {
  const c = active ? 'var(--calm)' : 'var(--mid)'
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="7" r="4"/><circle cx="17" cy="9" r="3"/>
      <path d="M1 21v-1a7 7 0 0114 0v1"/><path d="M21 21v-1a5 5 0 00-4-4.9"/>
    </svg>
  )
}
function ProfileIcon({ active }) {
  const c = active ? 'var(--calm)' : 'var(--mid)'
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20a8 8 0 0116 0"/>
    </svg>
  )
}

// ── 메인 ────────────────────────────────────────
const TABS = [
  { key: 'home',    label: '홈',      Icon: HomeIcon },
  { key: 'cal',     label: '캘린더',  Icon: CalIcon },
  { key: 'rooms',   label: '모임',    Icon: RoomsIcon },
  { key: 'profile', label: '내 정보', Icon: ProfileIcon },
]

export default function HomeScreen({ user, myName, myRooms, initialTab = 'home', onCreate, onJoinCode, onEnterRoom, onLogout, onUpdateName, onLeaveRoom }) {
  const [tab, setTab] = useState(initialTab)

  return (
    <div className="screen" style={{ paddingTop: 24, paddingBottom: 86 }}>
      {tab === 'home'    && <HomeTab    myName={myName} myRooms={myRooms} onEnterRoom={onEnterRoom} />}
      {tab === 'cal'     && <CalendarTab myRooms={myRooms} onEnterRoom={onEnterRoom} />}
      {tab === 'rooms'   && <RoomsTab   myRooms={myRooms} onCreate={onCreate} onJoinCode={onJoinCode} onEnterRoom={onEnterRoom} onLeaveRoom={onLeaveRoom} />}
      {tab === 'profile' && <ProfileTab user={user} myName={myName} onLogout={onLogout} onUpdateName={onUpdateName} />}

      <nav style={{
        position: 'fixed', bottom: 0,
        left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: '#fff', borderTop: '1px solid rgba(0,0,0,.08)',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 50, boxShadow: '0 -2px 16px rgba(0,0,0,.06)',
      }}>
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Icon active={tab === key} />
            <span style={{ fontSize: '.6rem', fontWeight: 700, color: tab === key ? 'var(--calm)' : 'var(--mid)' }}>
              {label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  )
}
