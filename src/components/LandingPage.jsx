import '../landing.css'

export default function LandingPage({ onStart }) {
  return (
    <div className="lp">
      <section className="lp-hero">

        <div className="lp-logo-wrap">
          <div className="lp-logo">
            <div className="lp-logo-row">
              <span className="lp-c">언</span>
              <span className="lp-c">제</span>
            </div>
            <div className="lp-logo-row">
              <span className="lp-c">보</span>
              <span className="lp-c">꼬</span>
            </div>
          </div>
        </div>

        <div className="lp-hero-body">
<p className="lp-sub">모두가 되는 날, 함께 찾아요</p>
        </div>

        <div className="lp-feats">
          {[
            { icon: '📅', title: '한눈에 보는 달력', desc: '모두가 가능한 날을 달력에서 바로 확인해요' },
            { icon: '⚡', title: '실시간 업데이트', desc: '친구가 날짜를 바꾸면 즉시 반영돼요' },
            { icon: '🔗', title: '링크로 초대', desc: '링크 하나로 친구를 방으로 초대해요' },
          ].map(f => (
            <div className="lp-feat-card" key={f.title}>
              <div className="lp-feat-icon">{f.icon}</div>
              <div>
                <div className="lp-feat-title">{f.title}</div>
                <div className="lp-feat-desc">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <button className="lp-btn" onClick={onStart}>시작하기 →</button>

      </section>

      <footer className="lp-footer">© 2025 언제보꼬</footer>
    </div>
  )
}
