import { useState } from 'react'
import Face from './Face'

function translateError(msg) {
  if (!msg) return '오류가 발생했어요. 다시 시도해주세요.'
  if (msg.includes('Invalid login credentials')) return '이메일 또는 비밀번호가 틀렸어요.'
  if (msg.includes('Email not confirmed'))       return '이메일 인증을 먼저 완료해주세요.'
  if (msg.includes('already registered'))        return '이미 가입된 이메일이에요.'
  if (msg.includes('Password should be'))        return '비밀번호는 6자 이상이어야 해요.'
  if (msg.includes('Unable to validate'))        return '이메일 형식이 올바르지 않아요.'
  return '오류가 발생했어요. 다시 시도해주세요.'
}

const inputStyle = {
  width: '100%', padding: '13px 14px', borderRadius: 12,
  border: '1.5px solid rgba(0,0,0,.13)', fontSize: '.95rem',
  fontFamily: 'inherit', outline: 'none', background: '#fff',
  boxSizing: 'border-box', color: '#3D3530',
}

const btnStyle = (bg, color, shadow) => ({
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
  width: '100%', padding: '14px 20px', borderRadius: 14,
  border: 'none', fontSize: '.97rem', fontWeight: 800,
  cursor: 'pointer', background: bg, color,
  boxShadow: shadow || '0 2px 0 rgba(0,0,0,.08)',
  fontFamily: 'inherit', transition: 'opacity .12s',
})

export default function LoginScreen({ onGoogle, onIdLogin, onIdSignup }) {
  const [mode, setMode]         = useState('login')   // 'login' | 'signup'
  const [id, setId]             = useState('')
  const [nickname, setNickname] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [done, setDone]         = useState(false)

  function switchMode(m) { setMode(m); setError('') }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!id.trim()) { setError('아이디를 입력해주세요.'); return }
    if (mode === 'signup' && !nickname.trim()) { setError('닉네임을 입력해주세요.'); return }
    setLoading(true)
    const err = mode === 'signup'
      ? await onIdSignup({ id: id.trim(), nickname: nickname.trim(), email: email.trim(), password })
      : await onIdLogin(id.trim(), password)
    setLoading(false)
    if (err) { setError(translateError(err.message)); return }
    if (mode === 'signup') setDone(true)
  }

  if (done) return (
    <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '0 28px' }}>
      <Face type="excited" size={60} />
      <h2 style={{ marginTop: 20, fontWeight: 800, fontSize: '1.3rem' }}>가입 완료!</h2>
      <p style={{ color: 'var(--mid)', marginTop: 10, fontSize: '.9rem', lineHeight: 1.7 }}>
        아이디 <b>{id}</b>로 가입됐어요.<br />로그인해주세요.
      </p>
      <button
        onClick={() => { setDone(false); switchMode('login') }}
        style={{ ...btnStyle('#7098C0', '#fff'), marginTop: 24, maxWidth: 320 }}
      >로그인하러 가기</button>
    </div>
  )

  return (
    <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', padding: '0 28px' }}>

      {/* 헤더 */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 22, flexWrap: 'wrap' }}>
          {['happy', 'excited', 'calm', 'sad', 'upset', 'bored'].map(t => (
            <Face key={t} type={t} size={46} className="face-icon" />
          ))}
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>모여모여 ✨</h1>
        <p style={{ color: 'var(--mid)', marginTop: 6, fontSize: '.88rem', lineHeight: 1.6 }}>
          친구들이랑 만날 수 있는 날<br />같이 찾아봐요!
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* 구글 */}
        <button style={{ ...btnStyle('#fff', '#3D3530', '0 2px 0 rgba(0,0,0,.09)'), border: '1.5px solid rgba(0,0,0,.13)' }}
          onClick={onGoogle}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google로 시작하기
        </button>

        {/* 구분선 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '4px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,.1)' }} />
          <span style={{ fontSize: '.8rem', color: 'var(--mid)', fontWeight: 600 }}>또는</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(0,0,0,.1)' }} />
        </div>

        {/* 아이디 폼 */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            style={inputStyle} placeholder="아이디" required autoComplete="username"
            value={id} onChange={e => setId(e.target.value)}
          />
          {mode === 'signup' && (
            <input
              style={inputStyle} placeholder="닉네임 (앱에서 표시되는 이름)" required
              value={nickname} onChange={e => setNickname(e.target.value)}
            />
          )}
          {mode === 'signup' && (
            <input
              style={inputStyle} type="email" placeholder="이메일 (비밀번호 찾기용)"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          )}
          <input
            style={inputStyle} type="password" placeholder="비밀번호 (6자 이상)" required autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            value={password} onChange={e => setPassword(e.target.value)}
          />

          {error && (
            <div style={{ fontSize: '.83rem', color: '#C85050', fontWeight: 600, paddingLeft: 4 }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{ ...btnStyle('#7098C0', '#fff'), marginTop: 2, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? '잠시만요...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>

        {/* 모드 전환 */}
        <div style={{ textAlign: 'center', marginTop: 4, fontSize: '.85rem', color: 'var(--mid)' }}>
          {mode === 'login' ? (
            <>처음이신가요?{' '}
              <button onClick={() => switchMode('signup')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, color: '#7098C0', fontFamily: 'inherit', fontSize: 'inherit', padding: 0 }}>
                회원가입
              </button>
            </>
          ) : (
            <>이미 계정이 있으신가요?{' '}
              <button onClick={() => switchMode('login')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 800, color: '#7098C0', fontFamily: 'inherit', fontSize: 'inherit', padding: 0 }}>
                로그인
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
