import { useState, useEffect } from 'react'
import { icons } from '../assets/icons'

export function useAnimatedIcon(active) {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (!active) return
    const t = setInterval(() => setIdx(i => (i + 1) % icons.length), 350)
    return () => clearInterval(t)
  }, [active])
  return icons[idx]
}
