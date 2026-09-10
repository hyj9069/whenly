import { ArrowLeft } from 'lucide-react'

export default function TopBar({ onBack, title }) {
  return (
    <div className="top-bar">
      <button className="back-btn" onClick={onBack}><ArrowLeft size={18} /></button>
      <span className="top-bar-title">{title}</span>
    </div>
  )
}
