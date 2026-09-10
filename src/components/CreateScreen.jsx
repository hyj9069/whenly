import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import TopBar from './TopBar'
import { icon4 } from '../assets/icons'
import { useAnimatedIcon } from '../hooks/useAnimatedIcon'

export default function CreateScreen({ onBack, onCreate, defaultName }) {
  const [roomName, setRoomName] = useState('')
  const [loading, setLoading]   = useState(false)
  const loadingIcon = useAnimatedIcon(loading)

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
        <img src={icon4} alt="" style={{ height: 28, flexShrink: 0 }} />
        <div style={{ fontSize: '1.36rem' }}>
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
        {loading
          ? <img src={loadingIcon} alt="" style={{ height: 22 }} />
          : <><Sparkles size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />방 만들기</>}
      </button>
    </div>
  )
}
