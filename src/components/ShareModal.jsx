const KAKAO_JS_KEY = '9791554988f51a9c4ecc86dabe5f4393'

function shareKakao(url, roomId) {
  if (!window.Kakao) return
  if (!window.Kakao.isInitialized()) window.Kakao.init(KAKAO_JS_KEY)
  window.Kakao.Share.sendDefault({
    objectType: 'text',
    text: `모여모여에 초대합니다! 🎉\n아래 링크로 참여해주세요 :)`,
    link: { mobileWebUrl: url, webUrl: url },
    buttons: [{ title: '일정 확인하기', link: { mobileWebUrl: url, webUrl: url } }],
  })
}

export default function ShareModal({ roomId, onClose, onToast }) {
  const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`

  async function copy() {
    try { await navigator.clipboard.writeText(url) }
    catch {
      const t = document.createElement('textarea')
      t.value = url; document.body.appendChild(t); t.select()
      document.execCommand('copy'); document.body.removeChild(t)
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <button style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: 13, background: '#FEE500', border: 'none', borderRadius: 14,
            fontSize: '.95rem', fontWeight: 800, cursor: 'pointer', color: '#3A1D1D',
            boxShadow: '0 2px 0 rgba(0,0,0,.1)',
          }} onClick={() => shareKakao(url, roomId)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#3A1D1D">
              <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.634 1.617 4.95 4.07 6.306L5 21l5.19-2.763A11.5 11.5 0 0012 18.5c5.523 0 10-3.358 10-7.5S17.523 3 12 3z"/>
            </svg>
            카카오톡으로 공유하기
          </button>
          <div style={{ display: 'flex', gap: 9 }}>
            <button className="btn btn-blue" style={{ flex: 1, padding: 12 }} onClick={copy}>링크 복사 📋</button>
            <button className="btn btn-ghost btn-sm" onClick={onClose}>닫기</button>
          </div>
        </div>
      </div>
    </div>
  )
}
