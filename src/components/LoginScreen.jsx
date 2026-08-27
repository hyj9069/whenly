import Face from './Face'

export default function LoginScreen({ onLogin }) {
  return (
    <div className="screen" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {['happy', 'excited', 'calm', 'sad', 'upset', 'bored'].map(t => (
            <Face key={t} type={t} size={52} className="face-icon" />
          ))}
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>모여모여 ✨</h1>
        <p style={{ color: 'var(--mid)', marginTop: 8, fontSize: '.9rem', lineHeight: 1.6 }}>
          친구들이랑 만날 수 있는 날<br />같이 찾아봐요!
        </p>
      </div>

      <button
        onClick={onLogin}
        onMouseDown={e => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,.13)' }}
        onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          width: '100%', maxWidth: 320, padding: '15px 20px',
          background: '#fff', border: '1.5px solid rgba(0,0,0,.15)', borderRadius: 16,
          fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 3px 0 rgba(0,0,0,.08)', color: '#3D3530',
          transition: 'transform .12s, box-shadow .12s',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google로 로그인
      </button>
    </div>
  )
}
