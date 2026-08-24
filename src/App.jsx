import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from './supabase.js'

// ─────────────────────────────────────────────
// SVG FACE COMPONENT
// ─────────────────────────────────────────────
const FACE_CONFIGS = {
  happy:   { fill: '#F2B8B8', eyes: 'arc-up',   mouth: 'smile-big' },
  upset:   { fill: '#C46468', eyes: 'arc-down',  mouth: 'frown' },
  angry:   { fill: '#C48758', eyes: 'angry',     mouth: 'frown' },
  silly:   { fill: '#D4B890', eyes: 'arc-up',    mouth: 'frown-sm' },
  sad:     { fill: '#E5D268', eyes: 'arc-up',    mouth: 'frown',   tear: true },
  bored:   { fill: '#C8D5A8', eyes: 'flat',      mouth: 'flat' },
  excited: { fill: '#5A8868', eyes: 'x-left',    mouth: 'smile-big' },
  scared:  { fill: '#467878', eyes: 'swirl',     mouth: 'wave' },
  calm:    { fill: '#7098C0', eyes: 'half-open', mouth: 'smile' },
  worried: { fill: '#9885A8', eyes: 'flat',      mouth: 'frown-sm' },
}

const MEMBER_COLORS = ['#F2B8B8','#C48758','#E5D268','#C8D5A8','#9885A8','#A07888','#C46468','#7098C0']

function Face({ type = 'happy', size = 100, className, style, fill: fillOverride }) {
  const cfg = FACE_CONFIGS[type] || FACE_CONFIGS.happy
  const fill = fillOverride || cfg.fill

  const Eyes = () => {
    switch (cfg.eyes) {
      case 'arc-up': return <>
        <path d="M34 42 Q36 37 39 42" stroke="#3D3530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M61 42 Q64 37 67 42" stroke="#3D3530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
      case 'arc-down': return <>
        <path d="M34 39 Q36 44 39 39" stroke="#3D3530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M61 39 Q64 44 67 39" stroke="#3D3530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
      case 'angry': return <>
        <path d="M29 36 L41 43" stroke="#3D3530" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M59 43 L71 36" stroke="#3D3530" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="33" y1="43" x2="41" y2="43" stroke="#3D3530" strokeWidth="2" strokeLinecap="round"/>
        <line x1="59" y1="43" x2="67" y2="43" stroke="#3D3530" strokeWidth="2" strokeLinecap="round"/>
      </>
      case 'flat': return <>
        <line x1="33" y1="42" x2="41" y2="42" stroke="#3D3530" strokeWidth="2" strokeLinecap="round"/>
        <line x1="59" y1="42" x2="67" y2="42" stroke="#3D3530" strokeWidth="2" strokeLinecap="round"/>
      </>
      case 'x-left': return <>
        <line x1="29" y1="37" x2="40" y2="46" stroke="#3D3530" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="40" y1="37" x2="29" y2="46" stroke="#3D3530" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M61 42 Q64 37 67 42" stroke="#3D3530" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </>
      case 'half-open': return <>
        <path d="M32 43 Q36 48 40 43" stroke="#3D3530" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M60 43 Q64 48 68 43" stroke="#3D3530" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </>
      case 'swirl': return <>
        <path d="M33 38 Q37 34 37 38 Q37 42 33 42" stroke="#3D3530" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <path d="M63 38 Q67 34 67 38 Q67 42 63 42" stroke="#3D3530" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
      </>
      default: return null
    }
  }

  const Mouth = () => {
    switch (cfg.mouth) {
      case 'smile-big': return <path d="M31 58 Q50 75 69 58" stroke="#3D3530" strokeWidth="3" fill="none" strokeLinecap="round"/>
      case 'smile':     return <path d="M33 60 Q50 70 67 60" stroke="#3D3530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      case 'frown':     return <path d="M33 66 Q50 56 67 66" stroke="#3D3530" strokeWidth="3" fill="none" strokeLinecap="round"/>
      case 'frown-sm':  return <path d="M35 63 Q50 56 65 63" stroke="#3D3530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      case 'flat':      return <line x1="33" y1="60" x2="67" y2="60" stroke="#3D3530" strokeWidth="2.5" strokeLinecap="round"/>
      case 'wave':      return <path d="M33 62 Q42 54 50 62 Q58 70 67 62" stroke="#3D3530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      default: return null
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
      <ellipse cx="50" cy="50" rx="45" ry="46" fill={fill} stroke="#3D3530" strokeWidth="2.5"/>
      <Eyes />
      <Mouth />
      {cfg.tear && <path d="M27 51 Q23 58 24 63" stroke="#3D3530" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>}
    </svg>
  )
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function genId() {
  const ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => ch[Math.floor(Math.random() * ch.length)]).join('')
}

function getDayFaceType(unavailCount, total, isMine) {
  if (total <= 1) return isMine ? 'upset' : 'happy'
  const r = unavailCount / total
  if (unavailCount === 0) return 'excited'
  if (r <= 0.33) return 'sad'
  if (r <= 0.66) return 'silly'
  return 'upset'
}

function getMemberColor(name, myName) {
  if (name === myName) return '#7098C0'
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) | 0
  return MEMBER_COLORS[Math.abs(h) % MEMBER_COLORS.length]
}

function formatMonth(y, m) {
  return `${y}년 ${m}월`
}

function monthStr(y, m) {
  return `${y}-${String(m).padStart(2, '0')}`
}

// ─────────────────────────────────────────────
// SHARED UI PIECES
// ─────────────────────────────────────────────
function TopBar({ onBack, title }) {
  return (
    <div className="top-bar">
      <button className="back-btn" onClick={onBack}>←</button>
      <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>{title}</span>
    </div>
  )
}

function Toast({ msg, visible }) {
  return <div className={`toast${visible ? ' show' : ''}`}>{msg}</div>
}

// ─────────────────────────────────────────────
// SHARE MODAL
// ─────────────────────────────────────────────
function ShareModal({ roomId, onClose, onToast }) {
  const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const t = document.createElement('textarea')
      t.value = url
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      document.body.removeChild(t)
    }
    onToast('링크 복사됐어요! 카톡에 붙여넣어요 🎉')
    onClose()
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 4 }}>친구한테 공유하기 🔗</div>
        <div style={{ fontSize: '.82rem', color: 'var(--mid)', marginBottom: 14 }}>링크 또는 방 코드로 초대해요!</div>

        <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--mid)', marginBottom: 5 }}>방 코드</div>
        <div className="code-box">
          <div style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: 8, color: 'var(--calm)' }}>{roomId}</div>
          <div style={{ fontSize: '.73rem', color: 'var(--mid)', marginTop: 5 }}>친구에게 이 코드를 알려주세요</div>
        </div>

        <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--mid)', marginBottom: 5 }}>공유 링크</div>
        <div className="url-box">
          <a href={url} target="_blank" rel="noreferrer" style={{ color: 'var(--calm)', wordBreak: 'break-all' }}>{url}</a>
        </div>

        <div style={{ display: 'flex', gap: 9 }}>
          <button className="btn btn-blue" style={{ flex: 1, padding: 12 }} onClick={copy}>링크 복사 📋</button>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>닫기</button>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// SCREENS
// ─────────────────────────────────────────────
function HomeScreen({ onCreate, onJoin, onEnterRoom }) {
  const myRooms = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith('me_')) {
      const roomId = key.slice(3)
      const roomData = localStorage.getItem('room_' + roomId)
      const myName = localStorage.getItem(key)
      if (roomData) {
        try {
          const r = JSON.parse(roomData)
          myRooms.push({ ...r, myName })
        } catch {}
      }
    }
  }

  return (
    <div className="screen">
      <div style={{ marginTop: 36 }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, lineHeight: 1.15 }}>모여모여 ✨</h1>
        <p style={{ color: 'var(--mid)', marginTop: 6, fontSize: '.9rem', lineHeight: 1.6 }}>
          안되는 날 체크하면<br />같이 만날 수 있는 날을 찾아줘요!
        </p>
      </div>

      <div className="emoji-row">
        {['happy', 'upset', 'angry', 'sad', 'excited', 'calm', 'bored', 'worried'].map(t => (
          <Face key={t} type={t} size={56} className="face-icon" />
        ))}
      </div>

      {myRooms.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--mid)', marginBottom: 8 }}>참여 중인 방</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {myRooms.map(r => {
              const [yr, mo] = r.month.split('-')
              return (
                <button key={r.id} onClick={() => onEnterRoom(r, r.myName)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: '#fff', border: '2px solid rgba(0,0,0,.07)', borderRadius: 14, cursor: 'pointer', textAlign: 'left', boxShadow: '0 2px 8px var(--shadow)' }}>
                  <Face type="calm" size={36} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, fontSize: '.9rem' }}>{r.name}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--mid)', marginTop: 2 }}>{yr}년 {parseInt(mo)}월 · {r.myName}</div>
                  </div>
                  <span style={{ fontSize: '1rem', color: 'var(--mid)' }}>→</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="spacer" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
        <button className="btn btn-blue" onClick={onCreate}>✨ 방 만들기</button>
        <button className="btn btn-pink" onClick={onJoin}>👋 방 코드로 참여하기</button>
      </div>
    </div>
  )
}

function CreateScreen({ onBack, onCreate }) {
  const now = new Date()
  const [y, setY] = useState(now.getFullYear())
  const [m, setM] = useState(now.getMonth() + 1)
  const [roomName, setRoomName] = useState('')
  const [hostName, setHostName] = useState('')
  const [loading, setLoading] = useState(false)

  function changeMonth(delta) {
    let nm = m + delta, ny = y
    if (nm > 12) { nm = 1; ny++ }
    if (nm < 1)  { nm = 12; ny-- }
    setM(nm); setY(ny)
  }

  async function handleCreate() {
    if (!roomName.trim() || !hostName.trim()) return
    setLoading(true)
    await onCreate(roomName.trim(), hostName.trim(), monthStr(y, m))
    setLoading(false)
  }

  return (
    <div className="screen">
      <TopBar onBack={onBack} title="방 만들기" />

      <div className="form-group">
        <label className="form-label">모임 이름</label>
        <input className="inp" placeholder="예: 7월 번개 모임 🌻" maxLength={25}
          value={roomName} onChange={e => setRoomName(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="form-label">어느 달에 만날까요?</label>
        <div className="month-picker">
          <button className="month-nav" onClick={() => changeMonth(-1)}>◀</button>
          <span style={{ fontWeight: 800, fontSize: '1.05rem', minWidth: 110, textAlign: 'center' }}>
            {formatMonth(y, m)}
          </span>
          <button className="month-nav" onClick={() => changeMonth(1)}>▶</button>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">내 이름 (방장)</label>
        <input className="inp" placeholder="예: 민지" maxLength={10}
          value={hostName} onChange={e => setHostName(e.target.value)} />
      </div>

      <div className="spacer" />
      <button className="btn btn-blue" style={{ marginTop: 16 }} onClick={handleCreate}
        disabled={loading || !roomName.trim() || !hostName.trim()}>
        {loading ? '생성 중...' : '방 만들고 초대 링크 받기 ✨'}
      </button>
    </div>
  )
}

function JoinScreen({ onBack, onJoin, prefillCode = '' }) {
  const [code, setCode] = useState(prefillCode)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    if (!code.trim() || !name.trim()) return
    setLoading(true)
    await onJoin(code.trim().toUpperCase(), name.trim())
    setLoading(false)
  }

  return (
    <div className="screen">
      <TopBar onBack={onBack} title="방 참여하기" />

      <div style={{ textAlign: 'center', padding: '20px 0 24px' }}>
        <Face type="calm" size={68} />
        <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: 12 }}>
          {prefillCode ? `방 코드: ${prefillCode}` : '친구의 방에 참여해요!'}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">방 코드 (6자리)</label>
        <input className="inp" placeholder="예: AB1C2D" maxLength={6}
          style={{ textTransform: 'uppercase', letterSpacing: 5, fontSize: '1.5rem', textAlign: 'center', fontWeight: 800 }}
          value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
      </div>

      <div className="form-group">
        <label className="form-label">내 이름</label>
        <input className="inp" placeholder="예: 수호" maxLength={10}
          value={name} onChange={e => setName(e.target.value)} />
      </div>

      <div className="spacer" />
      <button className="btn btn-blue" style={{ marginTop: 16 }} onClick={handleJoin}
        disabled={loading || !code.trim() || !name.trim()}>
        {loading ? '참여 중...' : '참여하기 👋'}
      </button>
    </div>
  )
}

function CalendarScreen({ room, myName, members, onToggleDay, onOpenShare, onHome, onLeave }) {
  const [yr, mo] = room.month.split('-').map(Number)
  const today = new Date()
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const firstDay = new Date(yr, mo - 1, 1).getDay()
  const daysInMonth = new Date(yr, mo, 0).getDate()
  const total = members.length

  // Build unavail map: day → Set of names
  const umap = {}
  for (const mb of members) {
    for (const d of mb.unavailable_days || []) {
      if (!umap[d]) umap[d] = new Set()
      umap[d].add(mb.name)
    }
  }

  const me = members.find(m => m.name === myName)
  const mySet = new Set(me?.unavailable_days || [])

  // Best days: all members available, not in the past
  const bestDays = []
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(yr, mo - 1, d)
    if (date >= todayDate && (!umap[d] || umap[d].size === 0)) bestDays.push(d)
  }

  return (
    <div className="screen" style={{ paddingTop: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 14 }}>
        <button className="back-btn" onClick={onHome} style={{ marginTop: 2 }}>←</button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, lineHeight: 1.2 }}>{room.name}</div>
          <div style={{ fontSize: '.8rem', color: 'var(--mid)', marginTop: 2 }}>
            {yr}년 {mo}월&nbsp;·&nbsp;{total}명 참여
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={onOpenShare}>공유 🔗</button>
      </div>

      <div className="scroll">

        {/* Best day banner */}
        {bestDays.length > 0 && total >= 2 && (
          <div className="best-banner">
            <Face type="excited" size={44} style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: '.78rem', fontWeight: 800, color: 'var(--excited)' }}>모두 가능한 날 🎉</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, marginTop: 3 }}>
                {bestDays.map(d => `${d}일`).join(', ')}
              </div>
            </div>
          </div>
        )}

        {/* My status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(112,152,192,.08)', borderRadius: 14, padding: '11px 14px', marginBottom: 12 }}>
          <Face type="happy" size={28} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.85rem', fontWeight: 800 }}>{myName}의 안되는 날</div>
            <div style={{ fontSize: '.75rem', color: 'var(--mid)', marginTop: 2 }}>
              {mySet.size === 0 ? '안되는 날 없음 😊 달력에서 눌러서 표시해요' : `${mySet.size}일 안됨 · 달력에서 다시 누르면 취소돼요`}
            </div>
          </div>
        </div>

        {/* Calendar */}
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
            {Array.from({ length: daysInMonth }, (_, i) => {
              const d = i + 1
              const dow = (firstDay + d - 1) % 7
              const date = new Date(yr, mo - 1, d)
              const past = date < todayDate
              const isToday = date.getTime() === todayDate.getTime()
              const uCnt = umap[d]?.size ?? 0
              const aCnt = total - uCnt
              const isMine = mySet.has(d)
              const faceType = getDayFaceType(uCnt, total, isMine)

              let stClass = ''
              if (!past) {
                if (isMine) stClass = 'st-mine'
                else if (total >= 2 && uCnt === 0) stClass = 'st-all'
                else if (total >= 2 && uCnt > 0 && aCnt > 0) stClass = 'st-some'
                else if (total >= 2 && uCnt === total) stClass = 'st-most'
              }

              return (
                <div key={d}
                  className={`day-cell${past ? ' past' : ''}${stClass ? ` ${stClass}` : ''}`}
                  onClick={() => !past && onToggleDay(d)}
                >
                  <div className={`day-num${isToday ? ' today' : dow===0 ? ' sun' : dow===6 ? ' sat' : ''}`}>{d}</div>
                  {!past && <Face type={faceType} size={20} className="day-face" />}
                  {!past && total >= 2 && uCnt === 0 && (
                    <div className="badge badge-green">{total}</div>
                  )}
                  {!past && total >= 2 && uCnt > 0 && aCnt > 0 && (
                    <div className="badge badge-red">{uCnt}</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="legend">
          <div className="leg-item">
            <div className="leg-dot" style={{ background: 'rgba(90,136,104,.25)', border: '1.5px solid #5A8868' }} />
            모두 가능
          </div>
          <div className="leg-item">
            <div className="leg-dot" style={{ background: 'rgba(229,210,104,.3)', border: '1.5px solid #C8A830' }} />
            일부 불가
          </div>
          <div className="leg-item">
            <div className="leg-dot" style={{ background: 'rgba(196,100,104,.15)', border: '1.5px solid #C46468' }} />
            내가 불가
          </div>
        </div>

        {/* Members */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '.9rem', fontWeight: 800, marginBottom: 10 }}>참여자 현황 👥</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {members.map(mb => (
              <div key={mb.id} className="member-item">
                <Face type="happy" size={34} fill={getMemberColor(mb.name, myName)} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '.88rem', color: mb.name === myName ? 'var(--calm)' : 'inherit' }}>
                    {mb.name}{mb.name === myName ? ' (나)' : ''}
                  </div>
                </div>
                <div style={{ fontSize: '.78rem', color: 'var(--mid)' }}>
                  {(mb.unavailable_days?.length ?? 0) === 0 ? '안되는 날 없음 🙆' : `${mb.unavailable_days.length}일 안됨`}
                </div>
              </div>
            ))}
          </div>
          <div className="divider" />
          <button className="btn btn-ghost" style={{ fontSize: '.85rem', padding: 10 }} onClick={onOpenShare}>
            링크로 친구 더 초대하기 🔗
          </button>
        </div>

        <div style={{ textAlign: 'center', fontSize: '.75rem', color: 'var(--mid)', paddingBottom: 8 }}>
          변경사항은 실시간으로 반영돼요 ✨
        </div>

        <button onClick={onLeave}
          style={{ width: '100%', padding: '12px', background: 'none', border: '1.5px solid rgba(196,100,104,.3)', borderRadius: 13, color: 'var(--upset)', fontSize: '.85rem', fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>
          방 나가기
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('home')
  const [room, setRoom] = useState(null)
  const [myName, setMyName] = useState('')
  const [members, setMembers] = useState([])
  const [showShare, setShowShare] = useState(false)
  const [prefillCode, setPrefillCode] = useState('')
  const [toast, setToast] = useState({ msg: '', vis: false })
  const toastTimer = useRef(null)

  function showToast(msg) {
    setToast({ msg, vis: true })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, vis: false })), 2600)
  }

  // Check URL for room code on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('room')
    if (code) {
      setPrefillCode(code.toUpperCase())
      setScreen('join')
    }
  }, [])

  // Fetch members
  const fetchMembers = useCallback(async (roomId) => {
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at')
    if (data) setMembers(data)
  }, [])

  // Real-time subscription
  useEffect(() => {
    if (!room) return
    fetchMembers(room.id)

    const channel = supabase
      .channel('room:' + room.id)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'members',
        filter: `room_id=eq.${room.id}`,
      }, () => fetchMembers(room.id))
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [room, fetchMembers])

  // Create room
  async function handleCreate(name, hostName, month) {
    let id, re
    for (let i = 0; i < 5; i++) {
      id = genId()
      ;({ error: re } = await supabase.from('rooms').insert({ id, name, month }))
      if (!re) break
    }
    if (re) { showToast('오류가 발생했어요 😢'); return }

    const { error: me } = await supabase.from('members').insert({
      room_id: id, name: hostName, unavailable_days: []
    })
    if (me) { showToast('오류가 발생했어요 😢'); return }

    localStorage.setItem('me_' + id, hostName)
    setRoom({ id, name, month })
    setMyName(hostName)
    setScreen('cal')
    setTimeout(() => setShowShare(true), 500)
  }

  // Join room
  async function handleJoin(code, name) {
    const { data: roomData, error } = await supabase
      .from('rooms').select('*').eq('id', code).single()

    if (error || !roomData) {
      showToast('방을 찾을 수 없어요 😢 코드를 확인해봐요!')
      return
    }

    // Check existing member
    const { data: existing } = await supabase
      .from('members').select('id').eq('room_id', code).eq('name', name).single()

    if (!existing) {
      const { error: me } = await supabase.from('members').insert({
        room_id: code, name, unavailable_days: []
      })
      if (me) { showToast('참여 중 오류가 발생했어요 😢'); return }
    }

    localStorage.setItem('me_' + code, name)
    setRoom(roomData)
    setMyName(name)
    setScreen('cal')
  }

  // Leave room
  async function handleLeave() {
    const isHost = members[0]?.name === myName
    const label = isHost ? '방을 삭제하면 모든 참여자 데이터가 사라져요.\n정말 나갈까요?' : '방에서 나갈까요?'
    if (!window.confirm(label)) return

    if (isHost) {
      await supabase.from('rooms').delete().eq('id', room.id)
    } else {
      await supabase.from('members').delete().eq('room_id', room.id).eq('name', myName)
    }

    localStorage.removeItem('me_' + room.id)
    localStorage.removeItem('room_' + room.id)
    setRoom(null)
    setMyName('')
    setMembers([])
    setScreen('home')
  }

  // Toggle unavailable day
  async function handleToggleDay(day) {
    const me = members.find(m => m.name === myName)
    if (!me) return

    const days = [...(me.unavailable_days || [])]
    const idx = days.indexOf(day)
    if (idx === -1) days.push(day)
    else days.splice(idx, 1)
    days.sort((a, b) => a - b)

    // Optimistic update
    setMembers(prev => prev.map(m =>
      m.name === myName ? { ...m, unavailable_days: days } : m
    ))

    const { error } = await supabase
      .from('members')
      .update({ unavailable_days: days })
      .eq('room_id', room.id)
      .eq('name', myName)

    if (error) {
      showToast('저장 중 오류가 발생했어요 😢')
      fetchMembers(room.id) // revert
    }
  }

  // ── RENDER ──
  return (
    <>
      {screen === 'home' && (
        <HomeScreen
          onCreate={() => setScreen('create')}
          onJoin={() => setScreen('join')}
          onEnterRoom={(r, name) => { setRoom(r); setMyName(name); setScreen('cal') }}
        />
      )}
      {screen === 'create' && (
        <CreateScreen
          onBack={() => setScreen('home')}
          onCreate={handleCreate}
        />
      )}
      {screen === 'join' && (
        <JoinScreen
          onBack={() => setScreen('home')}
          onJoin={handleJoin}
          prefillCode={prefillCode}
        />
      )}
      {screen === 'cal' && room && (
        <CalendarScreen
          room={room}
          myName={myName}
          members={members}
          onToggleDay={handleToggleDay}
          onOpenShare={() => setShowShare(true)}
          onHome={() => { setRoom(null); setMyName(''); setScreen('home') }}
          onLeave={handleLeave}
        />
      )}
      {showShare && room && (
        <ShareModal
          roomId={room.id}
          onClose={() => setShowShare(false)}
          onToast={showToast}
        />
      )}
      <Toast msg={toast.msg} visible={toast.vis} />
    </>
  )
}
