import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useMembers(room) {
  const [members, setMembers] = useState([])

  const fetchMembers = useCallback(async (roomId) => {
    const { data } = await supabase
      .from('members').select('*').eq('room_id', roomId).order('created_at')
    if (data) setMembers(data)
  }, [])

  useEffect(() => {
    if (!room) { setMembers([]); return }
    fetchMembers(room.id)
    const ch = supabase.channel('room:' + room.id)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'members', filter: `room_id=eq.${room.id}`
      }, () => fetchMembers(room.id))
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [room, fetchMembers])

  async function toggleDay(roomId, userId, day) {
    const me = members.find(m => m.user_id === userId)
    if (!me) return false

    const days = [...(me.unavailable_days || [])]
    const idx = days.indexOf(day)
    if (idx === -1) days.push(day); else days.splice(idx, 1)
    days.sort()

    // 낙관적 업데이트
    setMembers(prev => prev.map(m => m.id === me.id ? { ...m, unavailable_days: days } : m))

    // DB 업데이트 — 기본키(id)로 정확히 지정
    const { error } = await supabase
      .from('members')
      .update({ unavailable_days: days })
      .eq('id', me.id)

    if (error) {
      // 실패 시 롤백
      fetchMembers(roomId)
      return false
    }
    return true
  }

  return { members, toggleDay }
}
