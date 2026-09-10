import '../landing.css'

function Char({ char, delay }) {
  return (
    <span className="lp-cw">
      <span className="lp-c" style={{ animationDelay: `${delay}s` }}>
        {char}
      </span>
    </span>
  )
}

export default function LandingPage({ onStart }) {
  return (
    <div className="lp">

      {/* ── Hero ── */}
      <section className="lp-hero">

        <div className="lp-logo-wrap">
          <div className="lp-logo">
            <div className="lp-logo-row">
              <Char char="언" delay={0.1} />
              <Char char="제" delay={0.5} />
            </div>
            <div className="lp-logo-row">
              <Char char="보" delay={0.9} />
              <Char char="꼬" delay={1.3} />
            </div>
          </div>
        </div>

        <div className="lp-hero-body" style={{ animationDelay: '1.9s' }}>
          <h1 className="lp-h1">친구들과<br />날짜 맞춰봐요</h1>
          <p className="lp-sub">모두가 되는 날, 함께 찾아요</p>
          <button className="lp-btn" onClick={onStart}>시작하기 →</button>
        </div>

      </section>

      {/* ── Features ── */}
      <section className="lp-feats">
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
      </section>

      {/* ── Bottom CTA ── */}
      <section className="lp-bottom">
        <p className="lp-bottom-text">지금 바로 시작해봐요!</p>
        <button className="lp-btn lp-btn--lg" onClick={onStart}>무료로 시작하기</button>
      </section>

      <footer className="lp-footer">© 2025 언제보꼬</footer>
    </div>
  )
}
