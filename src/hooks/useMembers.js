import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useMembers(room, isGuest = false) {
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

    setMembers(prev => prev.map(m => m.id === me.id ? { ...m, unavailable_days: days } : m))

    let error
    if (isGuest) {
      const { error: e } = await supabase.rpc('guest_update_days', {
        p_member_id: me.id, p_guest_id: userId, p_days: days
      })
      error = e
    } else {
      const { error: e } = await supabase.from('members').update({ unavailable_days: days }).eq('id', me.id)
      error = e
    }

    if (error) {
      fetchMembers(roomId)
      return false
    }
    return true
  }

  return { members, toggleDay }
}
