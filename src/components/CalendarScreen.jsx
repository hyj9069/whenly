import { useState } from 'react'
import { Home, Users, CalendarDays, User, Pencil, Heart, Sparkles, Link, CheckCheck, Smile, Copy, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { icon1, icon2, icon3 } from '../assets/icons'
import { toDateStr, getDayFaceType, getMemberColor } from '../utils'
import { useHolidays } from '../hooks/useHolidays'
import { supabase } from '../supabase'

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
  const [importModal, setImportModal]         = useState(false)
  const [importOptions, setImportOptions]     = useState([])
  const [importLoading, setImportLoading]     = useState(false)
  const [importRoomSel, setImportRoomSel]     = useState(null)

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

  function closeImportModal() { setImportModal(false); setImportRoomSel(null) }

  async function openImportModal() {
    setImportModal(true)
    setImportRoomSel(null)
    setImportLoading(true)
    const { data: memberRows } = await supabase
      .from('members')
      .select('room_id, unavailable_days')
      .eq('user_id', myUserId)
      .neq('room_id', room.id)
    if (!memberRows?.length) { setImportOptions([]); setImportLoading(false); return }
    const { data: roomRows } = await supabase
      .from('rooms').select('id, name').in('id', memberRows.map(m => m.room_id))
    const opts = memberRows
      .filter(m => m.unavailable_days?.length)
      .map(m => ({ roomName: roomRows?.find(r => r.id === m.room_id)?.name || m.room_id, days: m.unavailable_days }))
    setImportOptions(opts)
    setImportLoading(false)
  }

  async function handleImport(days) {
    if (!me) return
    const merged = [...new Set([...mySet, ...days])].sort()
    await supabase.from('members').update({ unavailable_days: merged }).eq('id', me.id)
    closeImportModal()
  }

  function handleCellClick(d, past) {
    if (past) return
    const ds = toDateStr(yr, mo, d)
    if (editMode) onToggleDay(ds)
    else setSelectedDay(prev => prev === d ? null : d)
  }

  const cdStr    = room.confirmed_day
  const cdParsed = cdStr ? cdStr.split('-').map(Number) : null

  return (
    <div className="screen" style={{ paddingTop: 20, paddingBottom: 94 }}>
      {/* 헤더 */}
      <div className="cal-header">
        <div style={{ flex: 1 }}>
          <div className="cal-room-name-row">
            <div className="cal-room-name">{room.name}</div>
            {isHost && (
              <button onClick={() => { setRenameValue(room.name); setShowRenameModal(true) }} className="cal-rename-btn">
                <Pencil size={14} />
              </button>
            )}
          </div>
          <div className="cal-member-count">{total}명 참여</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowLeaveModal(true)}
          style={{ whiteSpace: 'nowrap', color: 'var(--upset)', borderColor: 'rgba(192,86,90,.3)' }}>
          방 나가기
        </button>
      </div>

      <div className="scroll">
        {/* 확정 배너 */}
        {cdParsed && (
          <div className="cal-confirm-banner">
            <CalendarDays size={22} color="var(--calm)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div className="cal-confirm-label">확정된 날짜</div>
              <div className="cal-confirm-date">
                {cdParsed[0]}년 {cdParsed[1]}월 {cdParsed[2]}일
              </div>
            </div>
            {isHost && (
              <button onClick={() => onConfirmDay(null)} className="cal-confirm-cancel">취소</button>
            )}
          </div>
        )}

        {/* 내 안되는 날 카드 */}
        <div className={`cal-my-card${editMode ? ' edit' : ''}`}>
          <div style={{ flex: 1 }}>
            <div className="cal-my-name">{myName}의 안되는 날</div>
            <div className={`cal-my-hint${editMode ? ' edit' : ''}`}>
              {editMode ? '날짜를 눌러 선택 · 다시 누르면 취소'
                : mySet.size === 0 ? <><Smile size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />안되는 날 없음</> : <span style={{ fontWeight: 500 }}>{mySet.size}일 표시됨</span>}
            </div>
            {editMode && (
              <button onClick={openImportModal} className="cal-import-btn">
                <ArrowRight size={12} style={{ verticalAlign: 'middle', marginRight: 3 }} />다른 방 일정 불러오기
              </button>
            )}
          </div>
          {editMode ? (
            <button onClick={exitEdit} className="cal-edit-done">완료</button>
          ) : (
            <button onClick={enterEdit} className="cal-edit-start">{mySet.size === 0 ? '선택하기' : '수정하기'}</button>
          )}
        </div>

        {/* 달력 */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="cal-month-nav">
            <button onClick={prevMonth} className="cal-month-btn"><ChevronLeft size={18} /></button>
            <div className="cal-month-label">{yr}년 {mo}월</div>
            <button onClick={nextMonth} className="cal-month-btn"><ChevronRight size={18} /></button>
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
              const holiday = getHoliday(d)
              const faceType   = getDayFaceType(uCnt, total, isMine)
              const isSelected  = !editMode && selectedDay === d
              const isConfirmed = ds === cdStr

              let statusIcon = null
              if (!past && total >= 2) {
                if (uCnt === total)  statusIcon = icon3
                else if (uCnt === 0) statusIcon = icon1
                else                 statusIcon = icon2
              }

              const allAvail = !past && total >= 2 && uCnt === 0

              return (
                <div key={d}
                  className={`day-cell${past ? ' past' : ''}`}
                  style={{
                    outline: isSelected ? '2px solid var(--calm)' : undefined,
                    background: isConfirmed ? 'rgb(255 241 248 / 83%)' : allAvail ? 'rgb(230 238 255 / 83%)' : undefined,
                  }}
                  onClick={() => handleCellClick(d, past)}
                >
                  <div className={`day-num${isToday?' today':(dow===0||holiday)?' sun':dow===6?' sat':''}`}>{d}</div>
                  {!past && (statusIcon
                    ? <img src={statusIcon} className="day-face" alt="" />
                    : <img src={isMine ? icon3 : icon1} className="day-face" alt="" />
                  )}
                  {isConfirmed && (
                    <Heart size={10} fill="#E05070" color="#E05070" style={{ position: 'absolute', top: -3, right: -3 }} />
                  )}
                  {!past && isMine && (
                    <div className="badge badge-red" style={{ top: 'auto', bottom: -3, right: 'auto', left: -6, fontSize: '.45rem', width: 13, height: 13 }}>나</div>
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
            <div className="card" style={{ marginBottom: 12 }}>
              <div className="detail-header">
                <div className="detail-date">{mo}월 {selectedDay}일</div>
                {holiday && <span className="holiday-badge">{holiday}</span>}
              </div>
              {unavailNames.length === 0 ? (
                <div className="all-avail">모두 가능한 날 <Sparkles size={14} /></div>
              ) : (
                <>
                  <div className="section-label">안되는 사람</div>
                  <div className="pill-row" style={{ marginBottom: availNames.length ? 10 : 0 }}>
                    {unavailNames.map(n => (
                      <span key={n} className="pill-unavail">{n}</span>
                    ))}
                  </div>
                  {availNames.length > 0 && <>
                    <div className="section-label">가능한 사람</div>
                    <div className="pill-row">
                      {availNames.map(n => (
                        <span key={n} className="pill-avail">{n}</span>
                      ))}
                    </div>
                  </>}
                </>
              )}
              {isHost && (
                <div className="detail-confirm">
                  {isConfirmed ? (
                    <button className="btn btn-ghost" style={{ fontSize: '.82rem', padding: 10 }} onClick={() => onConfirmDay(null)}>
                      확정 취소하기
                    </button>
                  ) : (
                    <button className="btn btn-blue" style={{ fontSize: '.82rem', padding: 10 }} onClick={() => onConfirmDay(ds)}>
                      <CalendarDays size={15} style={{ verticalAlign: 'middle'}} />이 날로 확정하기
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })()}

        {/* 범례 */}
        <div className="legend">
          <div className="leg-item"><img src={icon1} alt="" />모두 가능</div>
          <div className="leg-item"><img src={icon2} alt="" />일부 불가</div>
          <div className="leg-item"><img src={icon3} alt="" />모두 불가</div>
        </div>

        {/* 참여자 현황 */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="member-section-header">참여자 현황 <Users size={15} /></div>
          <div className="member-list">
            {members.map(mb => {
              const displayName = mb.user_id === myUserId ? myName : mb.name
              return (
                <div key={mb.id} className="member-item">
                  <div style={{ flex: 1 }}>
                    <div className="member-name" style={{ color: mb.user_id === myUserId ? 'var(--calm)' : undefined }}>
                      {displayName}{mb.user_id === myUserId ? ' (나)' : ''}
                    </div>
                  </div>
                  <div className="member-status">
                    {(mb.unavailable_days?.length ?? 0) === 0 ? <><CheckCheck size={13} color="var(--excited)" style={{ verticalAlign: 'middle', marginRight: 2 }} />없음</> : `${mb.unavailable_days.length}일 안됨`}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="divider" />
          <button className="btn btn-ghost" style={{ fontSize: '.82rem', padding: 10 }} onClick={onOpenShare}>
            <Link size={14} style={{ verticalAlign: 'middle', marginRight: 5 }} />링크로 친구 더 초대하기
          </button>
        </div>

        <div className="realtime-notice">
          변경사항은 실시간으로 반영돼요 <Sparkles size={12} style={{ verticalAlign: 'middle' }} />
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <nav className="cal-nav">
        <div className="cal-nav-indicator" />
        {[
          { key: 'home',    label: '홈',      active: false, Icon: Home },
          { key: 'rooms',   label: '모임',    active: false, Icon: Users },
          { key: 'cal',     label: '달력',    active: true,  Icon: CalendarDays },
          { key: 'profile', label: '내 정보', active: false, Icon: User },
        ].map(({ key, label, active, Icon }) => (
          <button key={key} onClick={() => !active && onHome(key)} className="cal-nav-btn"
            style={{ cursor: active ? 'default' : undefined }}>
            <Icon size={21} strokeWidth={2.2} color={active ? 'var(--calm)' : 'var(--mid)'} />
            <span className="cal-nav-label" style={{ color: active ? 'var(--calm)' : 'var(--mid)' }}>{label}</span>
          </button>
        ))}
      </nav>

      {/* 일정 불러오기 모달 */}
      {importModal && (
        <div className="overlay" onClick={closeImportModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="import-header">
              {importRoomSel && (
                <button onClick={() => setImportRoomSel(null)} className="cal-back-btn">
                  <ChevronLeft size={18} />
                </button>
              )}
              <div className="import-title">
                {importRoomSel ? importRoomSel.roomName : '다른 방 일정 불러오기'}
              </div>
            </div>
            <div className="import-hint">
              {importRoomSel ? '가져올 월을 선택하세요' : '방을 선택하세요'}
            </div>

            {importLoading ? (
              <div className="import-loading">불러오는 중...</div>
            ) : !importRoomSel ? (
              importOptions.length === 0 ? (
                <div className="import-loading">다른 방에 입력한 일정이 없어요</div>
              ) : (
                <div className="import-btn-list">
                  {importOptions.map((opt, i) => (
                    <button key={i} onClick={() => setImportRoomSel(opt)} className="import-room-btn">
                      <div className="import-btn-name">{opt.roomName}</div>
                      <div className="import-btn-sub">안되는 날 {opt.days.length}일</div>
                    </button>
                  ))}
                </div>
              )
            ) : (
              (() => {
                const months = [...new Set(importRoomSel.days.map(d => d.slice(0, 7)))].sort()
                return (
                  <div className="import-btn-list">
                    {months.map(ym => {
                      const [y, m] = ym.split('-')
                      const filtered = importRoomSel.days.filter(d => d.startsWith(ym))
                      return (
                        <button key={ym} onClick={() => handleImport(filtered)} className="import-room-btn">
                          <div className="import-btn-name">{y}년 {+m}월</div>
                          <div className="import-btn-sub">{filtered.length}일 선택됨</div>
                        </button>
                      )
                    })}
                    <button onClick={() => handleImport(importRoomSel.days)} className="import-all-btn">
                      <div className="import-all-name">전체 가져오기</div>
                      <div className="import-all-sub">{importRoomSel.days.length}일 전체</div>
                    </button>
                  </div>
                )
              })()
            )}

            <button className="btn btn-ghost" style={{ width: '100%', marginTop: 10 }}
              onClick={closeImportModal}>닫기</button>
          </div>
        </div>
      )}

      {/* 방 이름 수정 모달 */}
      {showRenameModal && (
        <div className="overlay" onClick={() => setShowRenameModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">방 이름 수정</div>
            <input className="inp" value={renameValue} onChange={e => setRenameValue(e.target.value)}
              maxLength={30} autoFocus style={{ marginBottom: 16 }}
              onKeyDown={e => { if (e.key === 'Enter' && renameValue.trim()) { onRenameRoom(renameValue.trim()); setShowRenameModal(false) } }}
            />
            <div className="modal-btns">
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
            <div className="modal-title" style={{ marginBottom: 8 }}>
              {isHost ? '방을 삭제할까요?' : '방을 나갈까요?'}
            </div>
            <div className="modal-desc">
              {isHost ? '방장이 나가면 방이 삭제되고\n모든 데이터가 사라져요.'
                : '방에서 나가면 다시 초대 링크로만\n참여할 수 있어요.'}
            </div>
            <div className="modal-btns">
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
