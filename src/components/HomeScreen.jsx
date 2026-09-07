import { useState, useEffect, useRef } from 'react'
import { Home, Users, User, CalendarDays, Check, ChevronLeft, ChevronRight, Smile, Plus } from 'lucide-react'
import Face from './Face'
import icon1 from '../assets/icon1.svg'
import icon2 from '../assets/icon2.svg'
import icon4 from '../assets/icon4.svg'
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <button
        onClick={handleClick}
        onMouseDown={startPress} onMouseUp={cancelPress} onMouseLeave={cancelPress}
        onTouchStart={startPress} onTouchEnd={cancelPress} onTouchMove={cancelPress}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px',
          background: '#fff',
          border: selected ? '2px solid var(--calm)' : 'none',
          borderRadius: 16, cursor: 'pointer', textAlign: 'left',
          boxShadow: '0 2px 8px var(--shadow)', fontFamily: 'inherit',
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
            {selected && <Check size={13} color="#fff" strokeWidth={3} />}
          </div>
        ) : cdParsed ? (
          <img src={icon1} alt="" style={{ height: 30, flexShrink: 0 }} />
        ) : (
          <img src={icon4} alt="" style={{ height: 30, flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '.85rem' }}>{room.name}</div>
          <div style={{ fontSize: '.72rem', color: 'var(--mid)', marginTop: 3 }}>{room.id}</div>
          {cdParsed && (
            <div style={{ fontSize: '.7rem', color: 'var(--calm)', marginTop: 5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
              <CalendarDays size={11} />{cdParsed[1]}월 {cdParsed[2]}일 확정
            </div>
          )}
        </div>
      </button>
      {!selectionMode && onLongPress && (
        <button
          onClick={() => onLongPress(room.id)}
          style={{
            width: 35, height: 35, flexShrink: 0,
            background: 'rgba(0,0,0,.06)', border: 'none', borderRadius: '50%',
            cursor: 'pointer', color: 'var(--mid)',
            fontSize: '.85rem', fontWeight: 700, lineHeight: 1,
            fontFamily: 'inherit', display: 'flex', justifyContent: 'center', alignItems: 'center',
          }}
        >···</button>
      )}
    </div>
  )
}

// ── 날짜 바텀시트 ────────────────────────────────
function DaySheet({ selDay, holiday, rooms, onClose, onEnterRoom }) {
  const [sheetTab, setSheetTab] = useState('일정')

  if (!selDay) return null

  const dow   = ['일','월','화','수','목','금','토'][selDay.getDay()]
  const isRed = selDay.getDay() === 0 || !!holiday

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.18)',
        backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        zIndex: 60,
      }} />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, margin: '0 auto',
        width: '100%', maxWidth: 480,
        height: '88dvh',
        background: 'rgba(245,247,250,0.88)',
        backdropFilter: 'blur(32px)', WebkitBackdropFilter: 'blur(32px)',
        borderRadius: '24px 24px 0 0',
        border: '1.5px solid rgba(255,255,255,0.72)',
        boxShadow: '0 -4px 48px rgba(0,0,0,0.13)',
        zIndex: 61,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideUp .32s cubic-bezier(.32,.72,0,1)',
      }}>
        {/* 드래그 핸들 */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0 6px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.12)' }} />
        </div>

        {/* 날짜 헤더 */}
        <div style={{ padding: '8px 24px 4px' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: isRed ? '#D05055' : 'var(--dark)', display: 'flex', alignItems: 'baseline', gap: 10 }}>
            {selDay.getMonth() + 1}월 {selDay.getDate()}일 ({dow})
            {holiday && <span style={{ fontSize: '.95rem', fontWeight: 700 }}>{holiday}</span>}
          </div>
        </div>

        {/* 탭 */}
        <div style={{ display: 'flex', gap: 8, padding: '14px 24px 10px' }}>
          {['일정', '모임'].map(t => (
            <button key={t} onClick={() => setSheetTab(t)} style={{
              padding: '8px 22px', borderRadius: 20, fontFamily: 'inherit',
              background: sheetTab === t ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.055)',
              border: sheetTab === t ? '1.5px solid rgba(91,141,184,0.32)' : '1.5px solid transparent',
              color: sheetTab === t ? 'var(--calm)' : 'var(--mid)',
              fontWeight: 700, fontSize: '.88rem', cursor: 'pointer',
              boxShadow: sheetTab === t ? '0 2px 10px rgba(0,0,0,0.07)' : 'none',
              transition: 'all .15s',
            }}>{t}</button>
          ))}
        </div>

        {/* 구분선 */}
        <div style={{ height: 1, background: 'rgba(0,0,0,0.06)', margin: '0 24px' }} />

        {/* 콘텐츠 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 32px' }}>
          {sheetTab === '일정' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0', color: 'var(--mid)' }}>
              <img src={icon2} alt="" style={{ height: 52 }} />
              <div style={{ fontSize: '.85rem' }}>일정 기능은 준비 중이에요</div>
            </div>
          )}
          {sheetTab === '모임' && (
            rooms.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '48px 0', color: 'var(--mid)' }}>
                <Face type="bored" size={52} />
                <div style={{ fontSize: '.85rem' }}>이 날 확정된 모임이 없어요</div>
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
      {/* 인사말 */}
      <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 30 }}>
        안녕하세요, {myName}님 <Smile size={16} style={{ verticalAlign: 'middle' }} />
      </div>

      {/* 월 탐색 */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <button onClick={prev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mid)', padding: '4px 8px', display: 'flex' }}><ChevronLeft size={18} /></button>
        <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '1rem' }}>{vy}년 {vm}월</div>
        <button onClick={next} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mid)', padding: '4px 8px', display: 'flex' }}><ChevronRight size={18} /></button>
      </div>

      {allConfirmed.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '8px 12px', background: 'rgba(112,152,192,.1)', borderRadius: 12 }}>
          <span style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--calm)' }}>총 확정 모임 {allConfirmed.length}개</span>
        </div>
      )}

      {/* 달력 그리드 */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: 6 }}>
          {['일','월','화','수','목','금','토'].map((d, i) => (
            <div key={d} style={{ textAlign: 'center', fontSize: '.65rem', fontWeight: 700, color: i === 0 ? '#D05055' : i === 6 ? '#5060CC' : 'var(--mid)', padding: '4px 0' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px 0' }}>
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
              <div key={d} onClick={() => setSelDay(prev => prev && date.toDateString() === prev.toDateString() ? null : date)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, cursor: 'pointer', padding: '2px 0' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isSelected ? 'var(--calm)' : isToday ? 'rgba(112,152,192,.12)' : 'transparent',
                  border: isToday && !isSelected ? '1.5px solid var(--calm)' : '1.5px solid transparent',
                  color: isSelected ? '#fff' : textColor,
                  fontSize: '.84rem', fontWeight: 700, transition: 'all .15s',
                }}>{d}</div>
                <div style={{ height: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {confirmedCnt === 1 && (
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: isSelected ? 'var(--mid)' : 'var(--calm)', opacity: isSelected ? 0.5 : 0.9 }} />
                  )}
                  {confirmedCnt > 1 && (
                    <div style={{ fontSize: '.42rem', fontWeight: 700, color: isSelected ? 'rgba(255,255,255,.7)' : 'var(--calm)', lineHeight: 1 }}>{confirmedCnt}</div>
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
          <img src={icon4} alt="" style={{ height: 125 }} />
          <div style={{ fontSize: '.9rem', textAlign: 'center', lineHeight: 1.6 }}>
            아직 참여 중인 방이 없어요<br />방을 만들거나 초대 링크로 참여해봐요!
          </div>
        </div>
      )}

      {!selectionMode && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <button className="btn btn-blue" onClick={onCreate}>새로운 방 만들기</button>
          <button className="btn btn-ghost" onClick={onJoinCode}>방 코드로 참여하기</button>
        </div>
      )}

      {showConfirm && (
        <div className="overlay" onClick={() => setShowConfirm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>방을 나가겠어요?</div>
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
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{myName}</div>
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

// ── 메인 ────────────────────────────────────────
const IC = { color: (a) => a ? 'var(--calm)' : 'var(--mid)', size: 21, strokeWidth: 2.2 }
const TABS = [
  { key: 'home',    label: '홈',      Icon: ({ active }) => <Home      size={IC.size} strokeWidth={IC.strokeWidth} color={IC.color(active)} /> },
  { key: 'rooms',   label: '모임',    Icon: ({ active }) => <Users     size={IC.size} strokeWidth={IC.strokeWidth} color={IC.color(active)} /> },
  { key: 'profile', label: '내 정보', Icon: ({ active }) => <User      size={IC.size} strokeWidth={IC.strokeWidth} color={IC.color(active)} /> },
]

export default function HomeScreen({ user, myName, myRooms, initialTab = 'home', onCreate, onJoinCode, onEnterRoom, onLogout, onUpdateName, onLeaveRoom }) {
  const [tab, setTab] = useState(initialTab === 'cal' ? 'home' : initialTab)

  return (
    <div className="screen" style={{ paddingTop: 24, paddingBottom: 94 }}>
      {tab === 'home'    && <HomeCalendarTab myName={myName} myRooms={myRooms} onEnterRoom={onEnterRoom} />}
      {tab === 'rooms'   && <RoomsTab   myRooms={myRooms} onCreate={onCreate} onJoinCode={onJoinCode} onEnterRoom={onEnterRoom} onLeaveRoom={onLeaveRoom} />}
      {tab === 'profile' && <ProfileTab user={user} myName={myName} onLogout={onLogout} onUpdateName={onUpdateName} />}

      <div style={{
        position: 'fixed',
        bottom: 'calc(14px + env(safe-area-inset-bottom))',
        left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)', maxWidth: 440,
        display: 'flex', alignItems: 'center', gap: 10,
        zIndex: 50,
      }}>
        {/* Pill nav */}
        <div style={{
          flex: 1, position: 'relative',
          display: 'flex', alignItems: 'center', padding: '5px',
          background: 'rgba(255,255,255,0.76)',
          backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
          borderRadius: 100,
          border: '1.5px solid rgba(255,255,255,0.94)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
        }}>
          {/* 슬라이딩 타원 */}
          <div style={{
            position: 'absolute',
            top: 5, bottom: 5, left: 5,
            width: `calc((100% - 10px) / ${TABS.length})`,
            borderRadius: 100,
            background: '#fff',
            boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
            transform: `translateX(calc(${TABS.findIndex(t => t.key === tab)} * 100%))`,
            transition: 'transform .32s cubic-bezier(.32,.72,0,1)',
            pointerEvents: 'none',
          }} />

          {TABS.map(({ key, label, Icon }) => {
            const active = tab === key
            return (
              <button key={key} onClick={() => setTab(key)} style={{
                flex: 1, position: 'relative', zIndex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '8px 0',
                background: 'transparent', border: 'none', borderRadius: 100,
                cursor: active ? 'default' : 'pointer',
                fontFamily: 'inherit',
              }}>
                <Icon active={active} />
                <span style={{ fontSize: '.6rem', fontWeight: 700, color: active ? 'var(--calm)' : 'var(--mid)', transition: 'color .25s' }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>

        {/* FAB */}
        <button onClick={() => onCreate('home')} style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, #8BBDE8 0%, #5B8DB8 55%, #7C6ED6 100%)',
          border: 'none', color: '#fff',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(91,141,184,.50), 0 2px 8px rgba(0,0,0,.12)',
          transition: 'transform .15s',
        }}><Plus size={24} strokeWidth={2.5} /></button>
      </div>
    </div>
  )
}
