import { useState } from 'react'
import Face from './Face'
import { toDateStr, getDayFaceType, getMemberColor } from '../utils'
import { useHolidays } from '../hooks/useHolidays'

export default function CalendarScreen({ room, myUserId, myName, members, onToggleDay, onConfirmDay, onRenameRoom, onOpenShare, onHome, onLeave }) {
  const today     = new Date()
  const todayY    = today.getFullYear()
  const todayM    = today.getMonth() + 1
  const todayD    = today.getDate()
  const todayDate = new Date(todayY, todayM - 1, todayD)

  const [yr, setYr] = useState(todayY)
  const [mo, setMo] = useState(todayM)
  const getHoliday  = useHolidays(yr, mo)
  const [selectedDay, setSelectedDay]         = useState(null)
  const [editMode, setEditMode]               = useState(false)
  const [showLeaveModal, setShowLeaveModal]   = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [renameValue, setRenameValue]         = useState('')

  const firstDay  = new Date(yr, mo - 1, 1).getDay()
  const totalDays = new Date(yr, mo, 0).getDate()
  const total     = members.length
  const isHost    = members[0]?.user_id === myUserId

  // umap: "YYYY-MM-DD" → [name, ...]
  const umap = {}
  for (const mb of members)
    for (const ds of mb.unavailable_days || []) {
      if (!umap[ds]) umap[ds] = []
      umap[ds].push(mb.user_id === myUserId ? myName : mb.name)
    }

  const me    = members.find(m => m.user_id === myUserId)
  const mySet = new Set(me?.unavailable_days || [])

  function prevMonth() {
    setSelectedDay(null)
    if (mo === 1) { setYr(y => y - 1); setMo(12) } else setMo(m => m - 1)
  }
  function nextMonth() {
    setSelectedDay(null)
    if (mo === 12) { setYr(y => y + 1); setMo(1) } else setMo(m => m + 1)
  }

  function enterEdit() { setEditMode(true); setSelectedDay(null) }
  function exitEdit()  { setEditMode(false) }

  function handleCellClick(d, past) {
    if (past) return
    const ds = toDateStr(yr, mo, d)
    if (editMode) onToggleDay(ds)
    else setSelectedDay(prev => prev === d ? null : d)
  }

  const cdStr    = room.confirmed_day  // "YYYY-MM-DD" or null
  const cdParsed = cdStr ? cdStr.split('-').map(Number) : null

  return (
    <div className="screen" style={{ paddingTop: 20, paddingBottom: 88 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button className="back-btn" onClick={onHome}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.2 }}>{room.name}</div>
            {isHost && (
              <button onClick={() => { setRenameValue(room.name); setShowRenameModal(true) }} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                fontSize: '.8rem', color: 'var(--mid)', lineHeight: 1,
              }}>✏️</button>
            )}
          </div>
          <div style={{ fontSize: '.75rem', color: 'var(--mid)', marginTop: 1 }}>{total}명 참여</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowLeaveModal(true)}
          style={{ whiteSpace: 'nowrap', color: 'var(--upset)', borderColor: 'rgba(192,86,90,.3)' }}>
          나가기
        </button>
      </div>

      <div className="scroll">
        {/* 확정 배너 */}
        {cdParsed && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(91,141,184,.12)', border: '1.5px solid rgba(91,141,184,.45)',
            borderRadius: 14, padding: '13px 15px', marginBottom: 12,
          }}>
            <span style={{ fontSize: '1.3rem' }}>📅</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--calm)' }}>확정된 날짜</div>
              <div style={{ fontSize: '.95rem', fontWeight: 800, marginTop: 2 }}>
                {cdParsed[0]}년 {cdParsed[1]}월 {cdParsed[2]}일
              </div>
            </div>
            {isHost && (
              <button onClick={() => onConfirmDay(null)} style={{
                background: 'none', border: '1px solid rgba(91,141,184,.4)', borderRadius: 8,
                padding: '4px 10px', fontSize: '.72rem', fontWeight: 700,
                cursor: 'pointer', color: 'var(--calm)', fontFamily: 'inherit',
              }}>취소</button>
            )}
          </div>
        )}

        {/* 내 안되는 날 카드 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: editMode ? 'rgba(91,141,184,.1)' : 'rgba(91,141,184,.06)',
          border: `1.5px solid ${editMode ? 'rgba(91,141,184,.45)' : 'transparent'}`,
          borderRadius: 14, padding: '11px 13px', marginBottom: 12, transition: 'all .2s',
        }}>
          <Face type={editMode ? 'worried' : 'happy'} size={26} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.83rem', fontWeight: 800 }}>{myName}의 안되는 날</div>
            <div style={{ fontSize: '.72rem', color: 'var(--mid)', marginTop: 2 }}>
              {editMode ? '날짜를 눌러 선택 · 다시 누르면 취소'
                : mySet.size === 0 ? '안되는 날 없음 😊' : `${mySet.size}일 표시됨`}
            </div>
          </div>
          {editMode ? (
            <button onClick={exitEdit} style={{
              background: 'var(--calm)', border: 'none', borderRadius: 9, padding: '6px 13px',
              fontSize: '.78rem', fontWeight: 800, cursor: 'pointer', color: '#fff',
              fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>완료</button>
          ) : (
            <button onClick={enterEdit} style={{
              background: 'rgba(0,0,0,.07)', border: 'none', borderRadius: 9, padding: '6px 13px',
              fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', color: 'var(--mid)',
              fontFamily: 'inherit', whiteSpace: 'nowrap',
            }}>{mySet.size === 0 ? '선택하기' : '수정하기'}</button>
          )}
        </div>

        {/* 달력 */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <button onClick={prevMonth} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--mid)', padding: '4px 8px', fontFamily: 'inherit' }}>‹</button>
            <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: '.95rem' }}>{yr}년 {mo}월</div>
            <button onClick={nextMonth} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--mid)', padding: '4px 8px', fontFamily: 'inherit' }}>›</button>
          </div>
          <div className="wday-row">
            {['일','월','화','수','목','금','토'].map((d, i) => (
              <div key={d} className={`wday${i===0?' sun':i===6?' sat':''}`}>{d}</div>
            ))}
          </div>
          <div className="cal-grid">
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`e${i}`} className="day-cell empty" />
            ))}
            {Array.from({ length: totalDays }, (_, i) => {
              const d   = i + 1
              const ds  = toDateStr(yr, mo, d)
              const dow = (firstDay + d - 1) % 7
              const date = new Date(yr, mo - 1, d)
              const past = date < todayDate
              const isToday    = yr === todayY && mo === todayM && d === todayD
              const uNames  = umap[ds] || []
              const uCnt    = uNames.length
              const aCnt    = total - uCnt
              const isMine  = mySet.has(ds)
              const holiday = getHoliday(yr, mo, d)
              const faceType   = getDayFaceType(uCnt, total, isMine)
              const isSelected = !editMode && selectedDay === d

              let stClass = ''
              if (!past) {
                if (total >= 2 && uCnt === total)              stClass = 'st-most'
                else if (total >= 2 && uCnt === 0)             stClass = 'st-all'
                else if (total >= 2 && uCnt > 0 && aCnt > 0)  stClass = 'st-some'
              }

              return (
                <div key={d}
                  className={`day-cell${past ? ' past' : ''}${stClass ? ` ${stClass}` : ''}`}
                  style={{
                    outline: isSelected ? '2px solid var(--calm)' : undefined,
                    outlineOffset: isSelected ? 1 : undefined,
                  }}
                  onClick={() => handleCellClick(d, past)}
                >
                  <div className={`day-num${isToday?' today':(dow===0||holiday)?' sun':dow===6?' sat':''}`}>{d}</div>
                  {!past && <Face type={faceType} size={19} className="day-face" fill={stClass === 'st-most' ? '#909090' : stClass === 'st-some' ? '#C46468' : undefined} />}
                  {!past && isMine && (
                    <div className="badge badge-red" style={{ top: 'auto', bottom: -3, right: 'auto', left: -3 }}>나</div>
                  )}
                  {!past && total >= 2 && uCnt > 0 && (
                    <div className="badge badge-red">{uCnt}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 날짜 상세 */}
        {!editMode && selectedDay && (() => {
          const ds = toDateStr(yr, mo, selectedDay)
          const unavailNames = umap[ds] || []
          const availNames   = members
            .map(m => m.user_id === myUserId ? myName : m.name)
            .filter(n => !unavailNames.includes(n))
          const isConfirmed = cdStr === ds
          const holiday = getHoliday(yr, mo, selectedDay)
          return (
            <div className="card" style={{ marginBottom: 12, borderLeft: `3px solid ${unavailNames.length === 0 ? 'var(--excited)' : 'var(--upset)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ fontWeight: 800, fontSize: '.9rem' }}>{mo}월 {selectedDay}일</div>
                {holiday && (
                  <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#C85050', background: 'rgba(200,85,85,.1)', borderRadius: 8, padding: '2px 8px' }}>
                    {holiday}
                  </span>
                )}
              </div>
              {unavailNames.length === 0 ? (
                <div style={{ fontSize: '.83rem', color: 'var(--excited)', fontWeight: 700 }}>모두 가능한 날 🎉</div>
              ) : (
                <>
                  <div style={{ fontSize: '.73rem', color: 'var(--mid)', marginBottom: 5 }}>안되는 사람</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: availNames.length ? 10 : 0 }}>
                    {unavailNames.map(n => (
                      <span key={n} style={{ padding: '3px 10px', background: 'rgba(192,86,90,.1)', color: 'var(--upset)', borderRadius: 20, fontSize: '.77rem', fontWeight: 700 }}>{n}</span>
                    ))}
                  </div>
                  {availNames.length > 0 && <>
                    <div style={{ fontSize: '.73rem', color: 'var(--mid)', marginBottom: 5 }}>가능한 사람</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                      {availNames.map(n => (
                        <span key={n} style={{ padding: '3px 10px', background: 'rgba(78,128,102,.1)', color: 'var(--excited)', borderRadius: 20, fontSize: '.77rem', fontWeight: 700 }}>{n}</span>
                      ))}
                    </div>
                  </>}
                </>
              )}
              {isHost && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                  {isConfirmed ? (
                    <button className="btn btn-ghost" style={{ fontSize: '.82rem', padding: 10 }} onClick={() => onConfirmDay(null)}>
                      확정 취소하기
                    </button>
                  ) : (
                    <button className="btn btn-blue" style={{ fontSize: '.82rem', padding: 10 }} onClick={() => onConfirmDay(ds)}>
                      📅 이 날로 확정하기
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })()}

        {/* 범례 */}
        <div className="legend">
          <div className="leg-item"><div className="leg-dot" style={{ background: 'rgba(78,128,102,.22)', border: '1.5px solid var(--excited)' }} />모두 가능</div>
          <div className="leg-item"><div className="leg-dot" style={{ background: 'rgba(192,86,90,.18)', border: '1.5px solid var(--upset)' }} />일부 불가</div>
          <div className="leg-item"><div className="leg-dot" style={{ background: 'rgba(80,80,80,.12)', border: '1.5px solid rgba(80,80,80,.5)' }} />모두 불가</div>
        </div>

        {/* 참여자 현황 */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '.85rem', fontWeight: 800, marginBottom: 10 }}>참여자 현황 👥</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {members.map(mb => {
              const displayName = mb.user_id === myUserId ? myName : mb.name
              return (
                <div key={mb.id} className="member-item">
                  <Face type="happy" size={32} fill={getMemberColor(mb.user_id, myUserId, displayName)} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '.85rem', color: mb.user_id === myUserId ? 'var(--calm)' : 'inherit' }}>
                      {displayName}{mb.user_id === myUserId ? ' (나)' : ''}
                    </div>
                  </div>
                  <div style={{ fontSize: '.74rem', color: 'var(--mid)' }}>
                    {(mb.unavailable_days?.length ?? 0) === 0 ? '없음 🙆' : `${mb.unavailable_days.length}일 안됨`}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="divider" />
          <button className="btn btn-ghost" style={{ fontSize: '.82rem', padding: 10 }} onClick={onOpenShare}>
            링크로 친구 더 초대하기 🔗
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: '.72rem', color: 'var(--mid)', paddingBottom: 8 }}>
          변경사항은 실시간으로 반영돼요 ✨
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <nav style={{
        position: 'fixed', bottom: 0,
        left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 480,
        background: '#fff', borderTop: '1px solid rgba(0,0,0,.08)',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 50, boxShadow: '0 -2px 16px rgba(0,0,0,.06)',
      }}>
        {[
          { key: 'home',    label: '홈',     active: false,
            icon: (a) => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={a?'var(--calm)':'var(--mid)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg> },
          { key: 'rooms',   label: '모임',   active: true,
            icon: (a) => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={a?'var(--calm)':'var(--mid)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="4"/><circle cx="17" cy="9" r="3"/><path d="M1 21v-1a7 7 0 0114 0v1"/><path d="M21 21v-1a5 5 0 00-4-4.9"/></svg> },
          { key: 'profile', label: '내 정보', active: false,
            icon: (a) => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke={a?'var(--calm)':'var(--mid)'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0116 0"/></svg> },
        ].map(({ key, label, active, icon }) => (
          <button key={key} onClick={() => onHome(key)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '10px 0', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            {icon(active)}
            <span style={{ fontSize: '.6rem', fontWeight: 700, color: active ? 'var(--calm)' : 'var(--mid)' }}>{label}</span>
          </button>
        ))}
      </nav>

      {/* 방 이름 수정 모달 */}
      {showRenameModal && (
        <div className="overlay" onClick={() => setShowRenameModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>방 이름 수정</div>
            <input className="inp" value={renameValue} onChange={e => setRenameValue(e.target.value)}
              maxLength={30} autoFocus style={{ marginBottom: 16 }}
              onKeyDown={e => { if (e.key === 'Enter' && renameValue.trim()) { onRenameRoom(renameValue.trim()); setShowRenameModal(false) } }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowRenameModal(false)}>취소</button>
              <button className="btn btn-blue" style={{ flex: 1 }} disabled={!renameValue.trim()}
                onClick={() => { onRenameRoom(renameValue.trim()); setShowRenameModal(false) }}>저장</button>
            </div>
          </div>
        </div>
      )}

      {/* 방 나가기 모달 */}
      {showLeaveModal && (
        <div className="overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>
              {isHost ? '방을 삭제할까요?' : '방을 나갈까요?'}
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--mid)', marginBottom: 20, lineHeight: 1.6 }}>
              {isHost ? '방장이 나가면 방이 삭제되고\n모든 데이터가 사라져요.'
                : '방에서 나가면 다시 초대 링크로만\n참여할 수 있어요.'}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowLeaveModal(false)}>취소</button>
              <button className="btn" style={{ flex: 1, background: 'var(--upset)', color: '#fff' }}
                onClick={() => { setShowLeaveModal(false); onLeave() }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
