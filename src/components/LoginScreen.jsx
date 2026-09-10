import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { icon4 } from '../assets/icons'
import googleIcon from '../assets/googleIcon.svg'

function translateError(msg) {
  if (!msg) return '오류가 발생했어요. 다시 시도해주세요.'
  if (msg.includes('User not found'))            return '존재하지 않는 아이디예요.'
  if (msg.includes('Username already'))          return '이미 사용 중인 아이디예요.'
  if (msg.includes('already registered'))        return '이미 사용 중인 이메일이에요.'
  if (msg.includes('Invalid login credentials')) return '아이디 또는 비밀번호가 틀렸어요.'
  if (msg.includes('Email not confirmed'))       return '이메일 인증을 먼저 완료해주세요.'
  if (msg.includes('Password should be'))        return '비밀번호가 너무 짧아요. 더 길게 입력해주세요.'
  return `오류: ${msg}`
}

function validateId(val) {
  if (!val) return '아이디를 입력해주세요'
  if (val.length < 4) return '4자 이상 입력해주세요'
  if (val.length > 20) return '20자 이하로 입력해주세요'
  if (!/^[a-zA-Z0-9]+$/.test(val)) return '영문·숫자만 사용 가능해요'
  return ''
}

function validateNickname(val) {
  if (!val) return '닉네임을 입력해주세요'
  if (val.length < 2) return '2자 이상 입력해주세요'
  if (val.length > 10) return '10자 이하로 입력해주세요'
  return ''
}

function validateEmail(val) {
  if (!val) return '이메일을 입력해주세요'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return '이메일 형식이 아니에요'
  return ''
}

function validatePassword(val) {
  if (!val) return '비밀번호를 입력해주세요'
  return ''
}

function FieldHint({ touched, error }) {
  if (!touched) return null
  const ok = error === ''
  return (
    <div className={`field-hint ${ok ? 'field-hint--ok' : 'field-hint--err'}`}>
      {ok
        ? <><Check size={13} style={{ verticalAlign: 'middle', marginRight: 2 }} />사용 가능</>
        : <><X size={13} style={{ verticalAlign: 'middle', marginRight: 2 }} />{error}</>}
    </div>
  )
}

function inpClass(touched, error) {
  if (!touched) return 'inp'
  return `inp ${error === '' ? 'inp--valid' : 'inp--invalid'}`
}

export default function LoginScreen({ onGoogle, onIdLogin, onIdSignup, onResetPassword }) {
  const [mode, setMode]           = useState('login')
  const savedId = localStorage.getItem('saved_id') || ''
  const [id, setId]               = useState(savedId)
  const [rememberMe, setRememberMe] = useState(!!savedId)
  const [nickname, setNickname]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [touched, setTouched]     = useState({})
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [done, setDone]           = useState(false)
  const [resetSent, setResetSent] = useState('')

  function touch(field) { setTouched(t => ({ ...t, [field]: true })) }
  function switchMode(m) { setMode(m); setError(''); setTouched({}); setDone(false); setResetSent('') }

  const idErr       = validateId(id)
  const nicknameErr = validateNickname(nickname)
  const emailErr    = validateEmail(email)
  const passwordErr = validatePassword(password)
  const signupValid = idErr === '' && nicknameErr === '' && emailErr === '' && passwordErr === ''

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (mode === 'reset') {
      if (!id.trim()) { setError('아이디를 입력해주세요.'); return }
      setLoading(true)
      const result = await onResetPassword(id.trim())
      setLoading(false)
      if (!result.found) { setError('존재하지 않는 아이디예요.'); return }
      setResetSent(result.email)
      return
    }

    if (mode === 'signup') {
      setTouched({ id: true, nickname: true, email: true, password: true })
      if (!signupValid) return
    }
    setLoading(true)
    const err = mode === 'signup'
      ? await onIdSignup({ id: id.trim(), nickname: nickname.trim(), email: email.trim(), password })
      : await onIdLogin(id.trim(), password)
    setLoading(false)
    if (err) { setError(translateError(err.message)); return }
    if (mode === 'login') {
      rememberMe ? localStorage.setItem('saved_id', id.trim()) : localStorage.removeItem('saved_id')
    }
    if (mode === 'signup') setDone(true)
  }

  if (done) return (
    <div className="screen screen--center" style={{ textAlign: 'center' }}>
      <img src={icon4} alt="" style={{ height: 60 }} />
      <h2 style={{ marginTop: 20, fontWeight: 700, fontSize: '2.08rem' }}>가입 완료!</h2>
      <p style={{ color: 'var(--mid)', marginTop: 10, fontSize: '1.44rem', lineHeight: 1.7 }}>
        아이디 <b>{id}</b>로 가입됐어요.<br />로그인해주세요.
      </p>
      <button className="btn btn-blue" style={{ marginTop: 24, maxWidth: 320 }}
        onClick={() => { setDone(false); switchMode('login') }}>
        로그인하러 가기
      </button>
    </div>
  )

  return (
    <div className="screen screen--center">

      <div className="login-header">
        <img src={icon4} alt="" style={{ height: 100 }} />
        <h1>언제보꼬</h1>
        <p>친구들이랑 만날 수 있는 날 같이 찾아봐요!</p>
      </div>

      <div className="login-body">

        {mode === 'reset' && (<>
          <div style={{ fontWeight: 700, fontSize: '1.6rem', marginBottom: 4 }}>비밀번호 찾기</div>
          {resetSent ? (
            <div style={{ fontSize: '1.44rem', lineHeight: 1.7, color: 'var(--mid)' }}>
              <Check size={14} color="#4CAF7D" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              <b>{resetSent.replace(/(?<=.{2}).(?=[^@]*@)/g, '*')}</b>으로<br />재설정 링크를 보냈어요.
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <input className="inp" placeholder="아이디" value={id} onChange={e => setId(e.target.value)} />
              {error && <div className="form-error">{error}</div>}
              <button type="submit" className="btn btn-blue" disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? '전송 중...' : '재설정 링크 전송'}
              </button>
            </form>
          )}
          <div style={{ textAlign: 'center', fontSize: '1.36rem', color: 'var(--mid)', marginTop: 4 }}>
            <button className="link-btn" onClick={() => switchMode('login')}>로그인으로 돌아가기</button>
          </div>
        </>)}

        {mode !== 'reset' && (<>
          <button className="btn btn-white" onClick={onGoogle}>
            <img src={googleIcon} alt="" style={{ height: 20 }} />
            Google로 시작하기
          </button>

          <div className="login-or">또는</div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input className={inpClass(touched.id, idErr)} placeholder="아이디" autoComplete="username"
              value={id} onChange={e => { setId(e.target.value); touch('id') }} />
            {mode === 'signup' && <FieldHint touched={touched.id} error={idErr} />}

            {mode === 'signup' && (<>
              <input className={inpClass(touched.nickname, nicknameErr)} placeholder="닉네임 (앱에서 표시되는 이름)"
                value={nickname} onChange={e => { setNickname(e.target.value); touch('nickname') }} />
              <FieldHint touched={touched.nickname} error={nicknameErr} />
            </>)}

            {mode === 'signup' && (<>
              <input className={inpClass(touched.email, emailErr)} type="email" placeholder="이메일 (비밀번호 찾기용)"
                value={email} onChange={e => { setEmail(e.target.value); touch('email') }} />
              <FieldHint touched={touched.email} error={emailErr} />
            </>)}

            <input
              className={inpClass(touched.password, mode === 'signup' ? passwordErr : '')}
              type="password"
              placeholder="비밀번호"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password} onChange={e => { setPassword(e.target.value); touch('password') }} />
            {mode === 'signup' && <FieldHint touched={touched.password} error={passwordErr} />}

            {mode === 'login' && (
              <label className="remember-row">
                <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                아이디 기억하기
              </label>
            )}

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="btn btn-dark" disabled={loading}
              style={{ marginTop: 10, opacity: loading ? 0.7 : 1 }}>
              {loading ? (mode === 'login' ? '로그인 중...' : '가입 중...') : mode === 'login' ? '로그인' : '회원가입'}
            </button>
          </form>

          {mode === 'login' && (
            <div className="login-forgot">
              <button className="link-btn link-btn--muted" onClick={() => switchMode('reset')}>비밀번호 찾기</button>
            </div>
          )}

          <div className="login-switch">
            {mode === 'login'
              ? <>처음이신가요?{' '}<button className="link-btn" onClick={() => switchMode('signup')}>회원가입</button></>
              : <>이미 계정이 있으신가요?{' '}<button className="link-btn" onClick={() => switchMode('login')}>로그인</button></>}
          </div>
        </>)}

      </div>
    </div>
  )
}
