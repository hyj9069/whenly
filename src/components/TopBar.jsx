export default function TopBar({ onBack, title }) {
  return (
    <div className="top-bar">
      <button className="back-btn" onClick={onBack}>←</button>
      <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{title}</span>
    </div>
  )
}
