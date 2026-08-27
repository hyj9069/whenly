import { useState } from 'react'
import Face from './Face'
import TopBar from './TopBar'
import { formatMonth, monthStr } from '../utils'

export default function CreateScreen({ onBack, onCreate, defaultName }) {
  const now = new Date()
  const [y, setY] = useState(now.getFullYear())
  const [m, setM] = useState(now.getMonth() + 1)
  const [roomName, setRoomName] = useState('')
  const [loading, setLoading] = useState(false)

  function changeMonth(delta) {
    let nm = m + delta, ny = y
    if (nm > 12) { nm = 1; ny++ }
    if (nm < 1)  { nm = 12; ny-- }
    setM(nm); setY(ny)
  }

  async function handleCreate() {
    if (!roomName.trim()) return
    setLoading(true)
    await onCreate(roomName.trim(), monthStr(y, m))
    setLoading(false)
  }

  return (
    <div className="screen">
      <TopBar onBack={onBack} title="새 방 만들기" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(112,152,192,.1)', borderRadius: 13, marginBottom: 20 }}>
        <Face type="happy" size={28} style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '.85rem' }}>
          <span style={{ fontWeight: 700 }}>{defaultName}</span>
          <span style={{ color: 'var(--mid)' }}>으로 방장이 돼요</span>
        </div>
      </div>

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

      <div className="spacer" />
      <button className="btn btn-blue" style={{ marginTop: 16 }} onClick={handleCreate}
        disabled={loading || !roomName.trim()}>
        {loading ? '생성 중...' : '방 만들기 ✨'}
      </button>
    </div>
  )
}
