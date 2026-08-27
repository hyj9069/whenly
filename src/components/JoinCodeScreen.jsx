import { useState } from 'react'
import Face from './Face'
import TopBar from './TopBar'

export default function JoinCodeScreen({ onBack, onJoin }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)

  async function handle() {
    if (code.trim().length !== 6) return
    setLoading(true)
    await onJoin(code.trim().toUpperCase())
    setLoading(false)
  }

  return (
    <div className="screen">
      <TopBar onBack={onBack} title="방 코드로 참여" />
      <div style={{ textAlign: 'center', padding: '16px 0 24px' }}>
        <Face type="calm" size={64} />
        <p style={{ fontSize: '.85rem', color: 'var(--mid)', marginTop: 10 }}>친구에게 받은 6자리 코드를 입력해요</p>
      </div>
      <div className="form-group">
        <input className="inp" placeholder="예: AB1C2D" maxLength={6}
          style={{ textTransform: 'uppercase', letterSpacing: 5, fontSize: '1.5rem', textAlign: 'center', fontWeight: 800 }}
          value={code} onChange={e => setCode(e.target.value.toUpperCase())} />
      </div>
      <div className="spacer" />
      <button className="btn btn-blue" style={{ marginTop: 16 }} onClick={handle}
        disabled={loading || code.trim().length !== 6}>
        {loading ? '참여 중...' : '참여하기 👋'}
      </button>
    </div>
  )
}
