import { useState } from 'react'
import { Home, Users, CalendarDays, User, Pencil, Heart, Sparkles, Link, CheckCheck, Smile, Copy } from 'lucide-react'
import icon1 from '../assets/icon1.svg'
import icon2 from '../assets/icon2.svg'
import icon3 from '../assets/icon3.svg'
import Face from './Face'
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

  const cdStr    = room.confirmed_day  // "YYYY-MM-DD" or null
  const cdParsed = cdStr ? cdStr.split('-').map(Number) : null

  return (
    <div className="screen" style={{ paddingTop: 20, paddingBottom: 94 }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
<div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2 }}>{room.name}</div>
            {isHost && (
              <button onClick={() => { setRenameValue(room.name); setShowRenameModal(true) }} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                fontSize: '.8rem', color: 'var(--mid)', lineHeight: 1,
              }}><Pencil size={14} /></button>
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
            <CalendarDays size={22} color="var(--calm)" style={{ flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--calm)' }}>확정된 날짜</div>
              <div style={{ fontSize: '.95rem', fontWeight: 700, marginTop: 2 }}>
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
            <div style={{ fontSize: '.83rem', fontWeight: 700 }}>{myName}의 안되는 날</div>
            <div style={{ fontSize: '.72rem', color: 'var(--mid)', marginTop: 2 }}>
              {editMode ? '날짜를 눌러 선택 · 다시 누르면 취소'
                : mySet.size === 0 ? <><Smile size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />안되는 날 없음</> : `${mySet.size}일 표시됨`}
            </div>
            {editMode && (
              <button onClick={openImportModal} style={{
                marginTop: 5, background: 'none', border: 'none', padding: 0,
                fontSize: '.7rem', color: 'var(--calm)', fontWeight: 700,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>다른 방 일정 불러오기 →</button>
            )}
          </div>
          {editMode ? (
            <button onClick={exitEdit} style={{
              background: 'var(--calm)', border: 'none', borderRadius: 9, padding: '6px 13px',
              fontSize: '.78rem', fontWeight: 700, cursor: 'pointer', color: '#fff',
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
            <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '.95rem' }}>{yr}년 {mo}월</div>
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
                    outlineOffset: isSelected ? 1 : undefined,
                    background: isConfirmed ? 'rgb(255 241 248 / 83%)' : allAvail ? 'rgb(240 245 255 / 83%)' : undefined,
                  }}
                  onClick={() => handleCellClick(d, past)}
                >
                  <div className={`day-num${isToday?' today':(dow===0||holiday)?' sun':dow===6?' sat':''}`}>{d}</div>
                  {!past && (statusIcon
                    ? <img src={statusIcon} className="day-face" alt="" />
                    : <Face type={faceType} size={25} className="day-face" />
                  )}
                  {isConfirmed && (
                    <Heart size={10} fill="#E05070" color="#E05070" style={{ position: 'absolute', top: -3, right: -3 }} />
                  )}
                  {!past && isMine && (
                    <div className="badge badge-red" style={{ top: 'auto', bottom: -3, right: 'auto', left: -3 }}>나</div>
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
                <div style={{ fontWeight: 700, fontSize: '.9rem' }}>{mo}월 {selectedDay}일</div>
                {holiday && (
                  <span style={{ fontSize: '.72rem', fontWeight: 700, color: '#C85050', background: 'rgba(200,85,85,.1)', borderRadius: 8, padding: '2px 8px' }}>
                    {holiday}
                  </span>
                )}
              </div>
              {unavailNames.length === 0 ? (
                <div style={{ fontSize: '.83rem', color: 'var(--excited)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>모두 가능한 날 <Sparkles size={14} /></div>
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
                      <CalendarDays size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />이 날로 확정하기
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })()}

        {/* 범례 */}
        <div className="legend">
          <div className="leg-item"><img src={icon1} style={{ height: 20, flexShrink: 0 }} alt="" />모두 가능</div>
          <div className="leg-item"><img src={icon2} style={{ height: 20, flexShrink: 0 }} alt="" />일부 불가</div>
          <div className="leg-item"><img src={icon3} style={{ height: 20, flexShrink: 0 }} alt="" />모두 불가</div>
        </div>

        {/* 참여자 현황 */}
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: '.85rem', fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 5 }}>참여자 현황 <Users size={15} /></div>
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

        <div style={{ textAlign: 'center', fontSize: '.72rem', color: 'var(--mid)', paddingBottom: 8 }}>
          변경사항은 실시간으로 반영돼요 <Sparkles size={12} style={{ verticalAlign: 'middle' }} />
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <nav style={{
        position: 'fixed',
        bottom: 'calc(14px + env(safe-area-inset-bottom))',
        left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 32px)', maxWidth: 440,
        display: 'flex', alignItems: 'center', padding: '5px',
        background: 'rgba(255,255,255,0.76)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderRadius: 100,
        border: '1.5px solid rgba(255,255,255,0.94)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)',
        zIndex: 50,
      }}>
        {/* 슬라이딩 인디케이터 — 달력(index 2) 고정 */}
        <div style={{
          position: 'absolute',
          top: 5, bottom: 5, left: 5,
          width: 'calc((100% - 10px) / 4)',
          borderRadius: 100,
          background: '#fff',
          boxShadow: '0 2px 12px rgba(0,0,0,0.09)',
          transform: 'translateX(calc(2 * 100%))',
          pointerEvents: 'none',
        }} />
        {[
          { key: 'home',    label: '홈',      active: false, Icon: Home },
          { key: 'rooms',   label: '모임',    active: false, Icon: Users },
          { key: 'cal',     label: '달력',    active: true,  Icon: CalendarDays },
          { key: 'profile', label: '내 정보', active: false, Icon: User },
        ].map(({ key, label, active, Icon }) => (
          <button key={key} onClick={() => !active && onHome(key)} style={{
            flex: 1, position: 'relative', zIndex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '8px 0',
            background: 'transparent', border: 'none', borderRadius: 100,
            cursor: active ? 'default' : 'pointer',
            fontFamily: 'inherit',
          }}>
            <Icon size={21} strokeWidth={2.2} color={active ? 'var(--calm)' : 'var(--mid)'} />
            <span style={{ fontSize: '.6rem', fontWeight: 700, color: active ? 'var(--calm)' : 'var(--mid)', transition: 'color .25s' }}>{label}</span>
          </button>
        ))}
      </nav>

      {/* 일정 불러오기 모달 */}
      {importModal && (
        <div className="overlay" onClick={closeImportModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            {/* 헤더 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {importRoomSel && (
                <button onClick={() => setImportRoomSel(null)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '0 4px 0 0',
                  fontSize: '1rem', color: 'var(--mid)', lineHeight: 1, fontFamily: 'inherit',
                }}>‹</button>
              )}
              <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {importRoomSel ? importRoomSel.roomName : '다른 방 일정 불러오기'}
              </div>
            </div>
            <div style={{ fontSize: '.78rem', color: 'var(--mid)', marginBottom: 14 }}>
              {importRoomSel ? '가져올 월을 선택하세요' : '방을 선택하세요'}
            </div>

            {importLoading ? (
              <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--mid)', fontSize: '.85rem' }}>불러오는 중...</div>
            ) : !importRoomSel ? (
              /* 1단계: 방 목록 */
              importOptions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--mid)', fontSize: '.85rem' }}>
                  다른 방에 입력한 일정이 없어요
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
                  {importOptions.map((opt, i) => (
                    <button key={i} onClick={() => setImportRoomSel(opt)} style={{
                      background: 'rgba(91,141,184,.07)', border: '1.5px solid rgba(91,141,184,.22)',
                      borderRadius: 12, padding: '11px 14px', cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'inherit', width: '100%',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{opt.roomName}</div>
                      <div style={{ fontSize: '.72rem', color: 'var(--mid)', marginTop: 3 }}>
                        안되는 날 {opt.days.length}일
                      </div>
                    </button>
                  ))}
                </div>
              )
            ) : (
              /* 2단계: 월 선택 */
              (() => {
                const months = [...new Set(importRoomSel.days.map(d => d.slice(0, 7)))].sort()
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}>
                    {months.map(ym => {
                      const [y, m] = ym.split('-')
                      const filtered = importRoomSel.days.filter(d => d.startsWith(ym))
                      return (
                        <button key={ym} onClick={() => handleImport(filtered)} style={{
                          background: 'rgba(91,141,184,.07)', border: '1.5px solid rgba(91,141,184,.22)',
                          borderRadius: 12, padding: '11px 14px', cursor: 'pointer', textAlign: 'left',
                          fontFamily: 'inherit', width: '100%',
                        }}>
                          <div style={{ fontWeight: 700, fontSize: '.88rem' }}>{y}년 {+m}월</div>
                          <div style={{ fontSize: '.72rem', color: 'var(--mid)', marginTop: 3 }}>
                            {filtered.length}일 선택됨
                          </div>
                        </button>
                      )
                    })}
                    <button onClick={() => handleImport(importRoomSel.days)} style={{
                      background: 'rgba(80,80,80,.11)', border: '1.5px solid rgba(80,80,80,.22)',
                      borderRadius: 12, padding: '11px 14px', cursor: 'pointer', textAlign: 'left',
                      fontFamily: 'inherit', width: '100%',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '.88rem', color: '#555' }}>전체 가져오기</div>
                      <div style={{ fontSize: '.72rem', color: '#888', marginTop: 3 }}>
                        {importRoomSel.days.length}일 전체
                      </div>
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
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>방 이름 수정</div>
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
            <div style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>
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
