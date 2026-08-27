import { FACE_CONFIGS } from '../constants'

export default function Face({ type = 'happy', size = 100, className, style, fill: fillOverride }) {
  const cfg = FACE_CONFIGS[type] || FACE_CONFIGS.happy
  const fill = fillOverride || cfg.fill

  const Eyes = () => {
    switch (cfg.eyes) {
      case 'arc-up': return <>
        <path d="M34 42 Q36 37 39 42" stroke="#3D3530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M61 42 Q64 37 67 42" stroke="#3D3530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
      case 'arc-down': return <>
        <path d="M34 39 Q36 44 39 39" stroke="#3D3530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M61 39 Q64 44 67 39" stroke="#3D3530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </>
      case 'angry': return <>
        <path d="M29 36 L41 43" stroke="#3D3530" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M59 43 L71 36" stroke="#3D3530" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="33" y1="43" x2="41" y2="43" stroke="#3D3530" strokeWidth="2" strokeLinecap="round"/>
        <line x1="59" y1="43" x2="67" y2="43" stroke="#3D3530" strokeWidth="2" strokeLinecap="round"/>
      </>
      case 'flat': return <>
        <line x1="33" y1="42" x2="41" y2="42" stroke="#3D3530" strokeWidth="2" strokeLinecap="round"/>
        <line x1="59" y1="42" x2="67" y2="42" stroke="#3D3530" strokeWidth="2" strokeLinecap="round"/>
      </>
      case 'x-left': return <>
        <line x1="29" y1="37" x2="40" y2="46" stroke="#3D3530" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="40" y1="37" x2="29" y2="46" stroke="#3D3530" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M61 42 Q64 37 67 42" stroke="#3D3530" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </>
      case 'half-open': return <>
        <path d="M32 43 Q36 48 40 43" stroke="#3D3530" strokeWidth="2" fill="none" strokeLinecap="round"/>
        <path d="M60 43 Q64 48 68 43" stroke="#3D3530" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </>
      default: return null
    }
  }

  const Mouth = () => {
    switch (cfg.mouth) {
      case 'smile-big': return <path d="M31 58 Q50 75 69 58" stroke="#3D3530" strokeWidth="3" fill="none" strokeLinecap="round"/>
      case 'smile':     return <path d="M33 60 Q50 70 67 60" stroke="#3D3530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      case 'frown':     return <path d="M33 66 Q50 56 67 66" stroke="#3D3530" strokeWidth="3" fill="none" strokeLinecap="round"/>
      case 'frown-sm':  return <path d="M35 63 Q50 56 65 63" stroke="#3D3530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      case 'flat':      return <line x1="33" y1="60" x2="67" y2="60" stroke="#3D3530" strokeWidth="2.5" strokeLinecap="round"/>
      default: return null
    }
  }

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={style}>
      <ellipse cx="50" cy="50" rx="45" ry="46" fill={fill} stroke="#3D3530" strokeWidth="2.5"/>
      <Eyes />
      <Mouth />
      {cfg.tear && <path d="M27 51 Q23 58 24 63" stroke="#3D3530" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5"/>}
    </svg>
  )
}
