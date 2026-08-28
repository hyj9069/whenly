import { useState } from 'react'
import Face from './Face'
import TopBar from './TopBar'

export default function CreateScreen({ onBack, onCreate, defaultName }) {
  const [roomName, setRoomName] = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleCreate() {
    if (!roomName.trim()) return
    setLoading(true)
    await onCreate(roomName.trim())
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
        <input className="inp" placeholder="예: 여름 번개 모임 🌻" maxLength={25}
          value={roomName} onChange={e => setRoomName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && roomName.trim() && handleCreate()} />
      </div>

      <div className="spacer" />
      <button className="btn btn-blue" style={{ marginTop: 16 }} onClick={handleCreate}
        disabled={loading || !roomName.trim()}>
        {loading ? '생성 중...' : '방 만들기 ✨'}
      </button>
    </div>
  )
}
