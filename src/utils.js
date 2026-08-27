import { MEMBER_COLORS } from './constants'

export function genId() {
  const ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => ch[Math.floor(Math.random() * ch.length)]).join('')
}

export function getDayFaceType(unavailCount, total, isMine) {
  if (total <= 1) return isMine ? 'upset' : 'happy'
  const r = unavailCount / total
  if (unavailCount === 0) return 'excited'
  if (r <= 0.33) return 'sad'
  if (r <= 0.66) return 'silly'
  return 'upset'
}

export function getMemberColor(userId, myUserId, name) {
  if (userId === myUserId) return '#7098C0'
  let h = 0
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) | 0
  return MEMBER_COLORS[Math.abs(h) % MEMBER_COLORS.length]
}

export function formatMonth(y, m) { return `${y}년 ${m}월` }
export function monthStr(y, m) { return `${y}-${String(m).padStart(2, '0')}` }

export function getUserName(user) {
  return user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.user_metadata?.preferred_username
    || user?.email?.split('@')[0]
    || '사용자'
}
