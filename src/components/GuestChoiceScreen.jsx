import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { icon4 } from '../assets/icons'

export default function GuestChoiceScreen({ roomCode, onLogin, onGuestJoin, loading }) {
  const [step, setStep] = useState('choice')
  const [nickname, setNickname] = useState('')

  async function handleJoin() {
    if (!nickname.trim()) return
    await onGuestJoin(nickname.trim())
  }

  if (step === 'nickname') {
    return (
      <div className="screen" style={{ justifyContent: 'center', padding: '0 28px' }}>
        <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => setStep('choice')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--mid)', fontSize: '1.4rem', alignSelf: 'flex-start', padding: '0 0 4px' }}
          >
            ← 뒤로
          </button>
          <h2 style={{ fontWeight: 700, fontSize: '1.92rem', marginBottom: 2 }}>어떻게 불러드릴까요?</h2>
          <p style={{ color: 'var(--mid)', fontSize: '1.36rem', marginBottom: 4 }}>방에서 표시될 이름이에요 (최대 10자)</p>
          <input
            className="inp"
            placeholder="예: 김철수"
            maxLength={10}
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && nickname.trim() && handleJoin()}
            autoFocus
          />
          <button className="btn btn-blue" onClick={handleJoin} disabled={loading || !nickname.trim()}>
            {loading ? '참가 중...' : '방 입장하기 👋'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="screen" style={{ justifyContent: 'center', padding: '0 28px' }}>
      <div style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src={icon4} alt="" style={{ height: 80, marginBottom: 20 }} />
        <h2 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: 8, textAlign: 'center' }}>모임에 초대받았어요!</h2>
        <div style={{ color: 'var(--mid)', fontSize: '1.4rem', marginBottom: 32, textAlign: 'center' }}>
          방 코드 <strong style={{ color: 'var(--dark)', letterSpacing: 2 }}>{roomCode}</strong>
        </div>
        <button className="btn btn-blue" style={{ width: '100%', marginBottom: 12 }} onClick={() => setStep('nickname')}>
          비로그인으로 참가하기
        </button>
        <button className="btn btn-ghost" style={{ width: '100%' }} onClick={onLogin}>
          <LogIn size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          로그인하고 참가하기
        </button>
        <p style={{ color: 'var(--mid)', fontSize: '1.25rem', marginTop: 20, textAlign: 'center', lineHeight: 1.6 }}>
          로그인하면 내 방 목록 관리, 개인 일정 통합 등을<br />이용할 수 있어요
        </p>
      </div>
    </div>
  )
}
