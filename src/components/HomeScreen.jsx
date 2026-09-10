import { useState, useEffect, useRef } from 'react'
import { Home, Users, User, CalendarDays, Check, ChevronLeft, ChevronRight, Smile, Plus } from 'lucide-react'
import Face from './Face'
import { icon1, icon2, icon4 } from '../assets/icons'
import { toDateStr } from '../utils'
import { useHolidays } from '../hooks/useHolidays'

// ── 방 아이템 (공통) ─────────────────────────────
function RoomItem({ room, onEnterRoom, selectionMode, selected, onSelect, onLongPress }) {
  const pressTimer = useRef(null)
  const didLongPress = useRef(false)
  const cdParsed = room.confirmed_day ? room.confirmed_day.split('-').map(Number) : null

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
    <div className="room-item">
      <button
        onClick={handleClick}
        onMouseDown={startPress} onMouseUp={cancelPress} onMouseLeave={cancelPress}
        onTouchStart={startPress} onTouchEnd={cancelPress} onTouchMove={cancelPress}
        className={`room-item-btn${selected ? ' selected' : ''}`}>
        {selectionMode ? (
          <div className={`room-item-check${selected ? ' selected' : ''}`}>
            {selected && <Check size={13} color="#fff" strokeWidth={3} />}
          </div>
        ) : cdParsed ? (
          <img src={icon1} alt="" style={{ height: 30, flexShrink: 0 }} />
        ) : (
          <img src={icon4} alt="" style={{ height: 30, flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <div className="room-item-name">{room.name}</div>
          <div className="room-item-id">{room.id}</div>
          {cdParsed && (
            <div className="room-item-confirmed">
              <CalendarDays size={11} />{cdParsed[1]}월 {cdParsed[2]}일 확정
            </div>
          )}
        </div>
      </button>
      {!selectionMode && onLongPress && (
        <button onClick={() => onLongPress(room.id)} className="room-item-more">···</button>
      )}
    </div>
  )
}

// ── 날짜 바텀시트 ────────────────────────────────
function DaySheet({ selDay, holiday, rooms, onClose, onEnterRoom }) {
  const [sheetTab, setSheetTab] = useState('일정')
  const [dragY, setDragY]       = useState(0)
  const startYRef               = useRef(null)
  const draggingRef             = useRef(false)

  if (!selDay) return null

  const dow   = ['일','월','화','수','목','금','토'][selDay.getDay()]
  const isRed = selDay.getDay() === 0 || !!holiday

  function onTouchStart(e) {
    startYRef.current = e.touches[0].clientY
    draggingRef.current = true
  }
  function onTouchMove(e) {
    if (!draggingRef.current) return
    const dy = e.touches[0].clientY - startYRef.current
    if (dy > 0) setDragY(dy)
  }
  function onTouchEnd() {
    draggingRef.current = false
    if (dragY > 80) { setDragY(0); onClose() }
    else setDragY(0)
  }

  return (
    <>
      <div onClick={onClose} className="day-sheet-overlay" style={{
        opacity: Math.max(0, 1 - dragY / 250),
        transition: dragY === 0 ? 'opacity .3s' : 'none',
      }} />
      <div
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        className="day-sheet"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragY === 0 ? 'transform .3s cubic-bezier(.32,.72,0,1)' : 'none',
          animation: dragY === 0 ? 'slideUp .32s cubic-bezier(.32,.72,0,1)' : 'none',
        }}>
        {/* 드래그 핸들 */}
        <div className="day-sheet-handle">
          <div className="day-sheet-handle-bar" />
        </div>

        {/* 날짜 헤더 */}
        <div className="day-sheet-header">
          <div className="day-sheet-date" style={{ color: isRed ? '#D05055' : 'var(--dark)' }}>
            {selDay.getMonth() + 1}월 {selDay.getDate()}일 ({dow})
            {holiday && <span className="day-sheet-holiday">{holiday}</span>}
          </div>
        </div>

        {/* 탭 */}
        <div className="day-sheet-tabs">
          {['일정', '모임'].map(t => (
            <button key={t} onClick={() => setSheetTab(t)}
              className={`day-sheet-tab${sheetTab === t ? ' active' : ''}`}>{t}</button>
          ))}
        </div>

        {/* 구분선 */}
        <div className="day-sheet-divider" />

        {/* 콘텐츠 */}
        <div className="day-sheet-content">
          {sheetTab === '일정' && (
            <div className="day-sheet-empty">
              <img src={icon2} alt="" style={{ height: 52 }} />
              <div>일정 기능은 준비 중이에요</div>
            </div>
          )}
          {sheetTab === '모임' && (
            rooms.length === 0 ? (
              <div className="day-sheet-empty">
                <Face type="bored" size={52} />
                <div>이 날 확정된 모임이 없어요</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {rooms.map(r => <RoomItem key={r.id} room={r} onEnterRoom={onEnterRoom} />)}
              </div>
            )
          )}
        </div>
      </div>
    </>
  )
}

// ── 홈+캘린더 탭 (통합) ─────────────────────────
function HomeCalendarTab({ myName, myRooms, onEnterRoom }) {
  const today = new Date()
  const [vy, setVy] = useState(today.getFullYear())
  const [vm, setVm] = useState(today.getMonth() + 1)
  const [selDay, setSelDay] = useState(null)
  const getHoliday = useHolidays(vy, vm)

  const allConfirmed = myRooms.filter(r => r.confirmed_day)
  const firstDay     = new Date(vy, vm - 1, 1).getDay()
  const totalDays    = new Date(vy, vm, 0).getDate()

  const selDateStr   = selDay ? toDateStr(selDay.getFullYear(), selDay.getMonth() + 1, selDay.getDate()) : null
  const displayRooms = selDateStr ? myRooms.filter(r => r.confirmed_day === selDateStr) : []

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
      <div className="home-greeting">
        안녕하세요, {myName}님 <Smile size={16} style={{ verticalAlign: 'middle' }} />
      </div>

      {/* 월 탐색 */}
      <div className="home-month-nav">
        <button onClick={prev} className="cal-month-btn"><ChevronLeft size={18} /></button>
        <div className="home-month-label">{vy}년 {vm}월</div>
        <button onClick={next} className="cal-month-btn"><ChevronRight size={18} /></button>
      </div>

      {allConfirmed.length > 0 && (
        <div className="home-confirmed-banner">
          <span className="home-confirmed-text">총 확정 모임 {allConfirmed.length}개</span>
        </div>
      )}

      {/* 달력 그리드 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="home-cal-wday">
          {['일','월','화','수','목','금','토'].map((d, i) => (
            <div key={d} className="home-cal-wday-cell" style={{ color: i === 0 ? '#D05055' : i === 6 ? '#5060CC' : 'var(--mid)' }}>{d}</div>
          ))}
        </div>
        <div className="home-cal-grid">
          {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: totalDays }, (_, i) => {
            const d            = i + 1
            const dow          = (firstDay + d - 1) % 7
            const date         = new Date(vy, vm - 1, d)
            const isToday      = date.toDateString() === today.toDateString()
            const isSelected   = selDay && date.toDateString() === selDay.toDateString()
            const holiday      = getHoliday(d)
            const isRed        = dow === 0 || !!holiday
            const textColor    = isRed ? '#D05055' : dow === 6 ? '#5060CC' : 'var(--dark)'
            const confirmedCnt = myRooms.filter(r => r.confirmed_day === toDateStr(vy, vm, d)).length
            return (
              <div key={d} className="home-cal-cell"
                onClick={() => setSelDay(prev => prev && date.toDateString() === prev.toDateString() ? null : date)}>
                <div className="home-cal-day-num" style={{
                  background: isSelected ? 'var(--calm)' : isToday ? 'rgba(112,152,192,.12)' : 'transparent',
                  border: isToday && !isSelected ? '1.5px solid var(--calm)' : '1.5px solid transparent',
                  color: isSelected ? '#fff' : textColor,
                }}>{d}</div>
                <div className="home-cal-dot-row">
                  {confirmedCnt === 1 && (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? 'var(--mid)' : 'var(--calm)', opacity: isSelected ? 0.5 : 0.9 }} />
                  )}
                  {confirmedCnt > 1 && (
                    <div className="home-cal-dot-num" style={{ color: isSelected ? 'rgba(255,255,255,.7)' : 'var(--calm)' }}>{confirmedCnt}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <DaySheet
        selDay={selDay}
        holiday={selDay ? getHoliday(selDay.getDate()) : null}
        rooms={displayRooms}
        onClose={() => setSelDay(null)}
        onEnterRoom={onEnterRoom}
      />
    </>
  )
}

// ── 모임 탭 ─────────────────────────────────────
function RoomsTab({ myRooms, roomsLoading, onCreate, onJoinCode, onEnterRoom, onLeaveRoom }) {
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

  if (roomsLoading) return (
    <div className="rooms-list">
      <RoomItemSkeleton />
      <RoomItemSkeleton />
      <RoomItemSkeleton />
    </div>
  )

  return (
    <>
      {selectionMode && (
        <div className="rooms-sel-header">
          <button className="btn btn-ghost btn-sm" onClick={cancelSelection}>취소</button>
          <span className="rooms-sel-count">{selectedIds.size}개 선택됨</span>
          <button
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--upset)', borderColor: 'rgba(192,86,90,.3)', opacity: selectedIds.size === 0 ? 0.5 : 1 }}
            disabled={selectedIds.size === 0}
            onClick={() => setShowConfirm(true)}
          >
            방 나가기
          </button>
        </div>
      )}

      {myRooms.length > 0 ? (
        <div className="rooms-section">
          <div className="rooms-section-label">참여 중인 방</div>
          <div className="rooms-list">
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
        <div className="rooms-empty">
          <img src={icon4} alt="" style={{ height: 125 }} />
          <div className="rooms-empty-text">
            아직 참여 중인 방이 없어요<br />방을 만들거나 초대 링크로 참여해봐요!
          </div>
        </div>
      )}

      {!selectionMode && (
        <div className="rooms-actions">
          <button className="btn btn-blue" onClick={() => onCreate('rooms')}>새로운 방 만들기</button>
          <button className="btn btn-ghost" onClick={onJoinCode}>방 코드로 참여하기</button>
        </div>
      )}

      {showConfirm && (
        <div className="overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title" style={{ marginBottom: 8 }}>방을 나가겠어요?</div>
            <div className="modal-desc">
              선택한 {selectedIds.size}개의 방에서 나갑니다.<br />내가 만든 방은 삭제됩니다.
            </div>
            <div className="modal-btns">
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
    <div className="profile-tab">
      <div className="profile-avatar-area">
        {user?.user_metadata?.avatar_url
          ? <img src={user.user_metadata.avatar_url} alt="" className="profile-avatar" />
          : <Face type="calm" size={72} />
        }
        <div className="profile-name">{myName}</div>
        <div className="profile-email">{user?.email}</div>
      </div>

      <div className="card">
        <div className="profile-card-label">표시 이름</div>
        {editing ? (
          <div className="profile-edit-form">
            <input className="inp" value={name} onChange={e => setName(e.target.value)}
              maxLength={20} placeholder="표시 이름 입력" autoFocus />
            <div className="profile-edit-btns">
              <button className="btn btn-blue" style={{ flex: 1, padding: 11 }} onClick={save} disabled={saving}>
                {saving ? '저장 중...' : '저장'}
              </button>
              <button className="btn btn-ghost btn-sm"
                onClick={() => { setEditing(false); setName(myName) }}>취소</button>
            </div>
          </div>
        ) : (
          <div className="profile-display">
            <div className="profile-display-name">{myName}</div>
            <button onClick={() => setEditing(true)} className="profile-edit-btn">수정</button>
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

// ── 메인 ────────────────────────────────────────
const IC = { color: (a) => a ? 'var(--calm)' : 'var(--mid)', size: 18, strokeWidth: 2.2 }
const TABS = [
  { key: 'home',    label: '홈',      Icon: ({ active }) => <Home      size={IC.size} strokeWidth={IC.strokeWidth} color={IC.color(active)} /> },
  { key: 'rooms',   label: '모임',    Icon: ({ active }) => <Users     size={IC.size} strokeWidth={IC.strokeWidth} color={IC.color(active)} /> },
  { key: 'profile', label: '내 정보', Icon: ({ active }) => <User      size={IC.size} strokeWidth={IC.strokeWidth} color={IC.color(active)} /> },
]

function RoomItemSkeleton() {
  return (
    <div className="room-item">
      <div className="room-item-btn" style={{ pointerEvents: 'none' }}>
        <div className="skeleton skeleton-icon" />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="skeleton skeleton-line" style={{ width: '55%' }} />
          <div className="skeleton skeleton-line" style={{ width: '35%' }} />
        </div>
      </div>
    </div>
  )
}

export default function HomeScreen({ user, myName, myRooms, roomsLoading, initialTab = 'home', onCreate, onJoinCode, onEnterRoom, onLogout, onUpdateName, onLeaveRoom }) {
  const [tab, setTab] = useState(initialTab === 'cal' ? 'home' : initialTab)

  return (
    <div className="screen" style={{ paddingTop: 24, paddingBottom: 94 }}>
      {tab === 'home'    && <HomeCalendarTab myName={myName} myRooms={myRooms} onEnterRoom={onEnterRoom} />}
      {tab === 'rooms'   && <RoomsTab   myRooms={myRooms} roomsLoading={roomsLoading} onCreate={onCreate} onJoinCode={onJoinCode} onEnterRoom={onEnterRoom} onLeaveRoom={onLeaveRoom} />}
      {tab === 'profile' && <ProfileTab user={user} myName={myName} onLogout={onLogout} onUpdateName={onUpdateName} />}

      <div className="home-nav-wrap">
        <div className="home-nav-pill">
          <div className="home-nav-indicator" style={{
            width: `calc((100% - 10px) / ${TABS.length})`,
            transform: `translateX(calc(${TABS.findIndex(t => t.key === tab)} * 100%))`,
          }} />
          {TABS.map(({ key, label, Icon }) => {
            const active = tab === key
            return (
              <button key={key} onClick={() => setTab(key)} className="home-nav-btn"
                style={{ cursor: active ? 'default' : undefined }}>
                <Icon active={active} />
                <span className="home-nav-label" style={{ color: active ? 'var(--calm)' : 'var(--mid)' }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>

        <button onClick={() => onCreate('home')} className="home-nav-fab">
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
