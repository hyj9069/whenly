import { useState } from 'react'
import Face from './Face'
import { getDayFaceType, getMemberColor } from '../utils'
import { getHoliday } from '../holidays'

export default function CalendarScreen({ room, myUserId, myName, members, onToggleDay, onConfirmDay, onRenameRoom, onOpenShare, onHome, onLeave, onGoCreate }) {
  const [selectedDay, setSelectedDay]       = useState(null)
  const [editMode, setEditMode]             = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [renameValue, setRenameValue]       = useState('')

  const [yr, mo] = room.month.split('-').map(Number)
  const today     = new Date()
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const firstDay  = new Date(yr, mo - 1, 1).getDay()
  const totalDays = new Date(yr, mo, 0).getDate()
  const total     = members.length
  const isHost    = members[0]?.user_id === myUserId

  const umap = {}
  for (const mb of members)
    for (const d of mb.unavailable_days || []) {
      if (!umap[d]) umap[d] = []
      umap[d].push(mb.name)
    }

  const me    = members.find(m => m.user_id === myUserId)
  const mySet = new Set(me?.unavailable_days || [])

  function enterEdit()  { setEditMode(true);  setSelectedDay(null) }
  function exitEdit()   { setEditMode(false) }

  function handleCellClick(d, past) {
    if (past) return
    if (editMode) {
      onToggleDay(d)   // 수정 모드: 토글만
    } else {
      setSelectedDay(prev => prev === d ? null : d)  // 보기 모드: 상세 패널 토글
    }
  }

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
          <div style={{ fontSize: '.75rem', color: 'var(--mid)', marginTop: 1 }}>
            {yr}년 {mo}월 · {total}명 참여
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onOpenShare} style={{ whiteSpace: 'nowrap' }}>
          공유 🔗
        </button>
      </div>

      <div className="scroll">
        {/* 확정된 날짜 배너 */}
        {room.confirmed_day && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(91,141,184,.12)',
            border: '1.5px solid rgba(91,141,184,.45)',
            borderRadius: 14, padding: '13px 15px', marginBottom: 12,
          }}>
            <span style={{ fontSize: '1.3rem' }}>📅</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '.75rem', fontWeight: 800, color: 'var(--calm)' }}>확정된 날짜</div>
              <div style={{ fontSize: '.95rem', fontWeight: 800, marginTop: 2 }}>{mo}월 {room.confirmed_day}일</div>
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
          borderRadius: 14, padding: '11px 13px', marginBottom: 12,
          transition: 'all .2s',
        }}>
          <Face type={editMode ? 'worried' : 'happy'} size={26} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.83rem', fontWeight: 800 }}>{myName}의 안되는 날</div>
            <div style={{ fontSize: '.72rem', color: 'var(--mid)', marginTop: 2 }}>
              {editMode
                ? '날짜를 눌러 선택 · 다시 누르면 취소'
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
              const d    = i + 1
              const dow  = (firstDay + d - 1) % 7
              const date = new Date(yr, mo - 1, d)
              const past = date < todayDate
              const isToday    = date.getTime() === todayDate.getTime()
              const uNames  = umap[d] || []
              const uCnt    = uNames.length
              const aCnt    = total - uCnt
              const isMine  = mySet.has(d)
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
                    cursor: past ? 'default' : editMode ? 'pointer' : 'pointer',
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

        {/* 날짜 상세 — 보기 모드에서만 */}
        {!editMode && selectedDay && (() => {
          const unavailNames = umap[selectedDay] || []
          const availNames   = members.map(m => m.name).filter(n => !unavailNames.includes(n))
          return (
            <div className="card" style={{ marginBottom: 12, borderLeft: `3px solid ${unavailNames.length === 0 ? 'var(--excited)' : 'var(--upset)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ fontWeight: 800, fontSize: '.9rem' }}>{mo}월 {selectedDay}일</div>
                {getHoliday(yr, mo, selectedDay) && (
                  <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#C85050', background: 'rgba(200,85,85,.1)', borderRadius: 8, padding: '2px 8px' }}>
                    {getHoliday(yr, mo, selectedDay)}
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
                  {room.confirmed_day === selectedDay ? (
                    <button className="btn btn-ghost" style={{ fontSize: '.82rem', padding: 10 }} onClick={() => onConfirmDay(null)}>
                      확정 취소하기
                    </button>
                  ) : (
                    <button className="btn btn-blue" style={{ fontSize: '.82rem', padding: 10 }} onClick={() => onConfirmDay(selectedDay)}>
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
            )})}

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

      {/* 하단 고정바 */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        padding: '10px 18px',
        paddingBottom: 'calc(10px + env(safe-area-inset-bottom))',
        zIndex: 40,
      }}>
        <button onClick={() => setShowLeaveModal(true)} style={{
          width: '100%', padding: '12px',
          background: 'rgba(192,86,90,.07)',
          border: '1.5px solid rgba(192,86,90,.3)',
          borderRadius: 13, color: 'var(--upset)',
          fontSize: '.85rem', fontWeight: 800,
          cursor: 'pointer', fontFamily: 'inherit',
        }}>방 나가기</button>
      </div>

      {/* 방 이름 수정 모달 */}
      {showRenameModal && (
        <div className="overlay" onClick={() => setShowRenameModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>방 이름 수정</div>
            <input
              className="inp"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              maxLength={30}
              autoFocus
              style={{ marginBottom: 16 }}
              onKeyDown={e => {
                if (e.key === 'Enter' && renameValue.trim()) {
                  onRenameRoom(renameValue.trim())
                  setShowRenameModal(false)
                }
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowRenameModal(false)}>취소</button>
              <button className="btn btn-blue" style={{ flex: 1 }}
                disabled={!renameValue.trim()}
                onClick={() => { onRenameRoom(renameValue.trim()); setShowRenameModal(false) }}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 방 나가기 확인 모달 */}
      {showLeaveModal && (
        <div className="overlay" onClick={() => setShowLeaveModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 8 }}>
              {isHost ? '방을 삭제할까요?' : '방을 나갈까요?'}
            </div>
            <div style={{ fontSize: '.85rem', color: 'var(--mid)', marginBottom: 20, lineHeight: 1.6 }}>
              {isHost
                ? '방장이 나가면 방이 삭제되고\n모든 데이터가 사라져요.'
                : '방에서 나가면 다시 초대 링크로만\n참여할 수 있어요.'}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowLeaveModal(false)}>취소</button>
              <button className="btn" style={{ flex: 1, background: 'var(--upset)', color: '#fff' }} onClick={() => { setShowLeaveModal(false); onLeave() }}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
