import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { genId } from '../utils'

export function useRooms(user, myName) {
  const [myRooms, setMyRooms] = useState([])

  async function loadMyRooms() {
    if (!user?.id) return

    const { data: memberRows, error: e1 } = await supabase
      .from('members')
      .select('room_id')
      .eq('user_id', user.id)

    if (e1) return
    if (!memberRows || memberRows.length === 0) {
      setMyRooms([])
      return
    }

    const ids = memberRows.map(m => m.room_id)
    const { data: roomRows, error: e2 } = await supabase
      .from('rooms')
      .select('id, name, confirmed_day')
      .in('id', ids)

    if (!e2 && roomRows) setMyRooms(roomRows)
  }

  useEffect(() => {
    if (user) loadMyRooms()
    else setMyRooms([])
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  async function createRoom(name) {
    let created = null
    for (let i = 0; i < 5; i++) {
      const id = genId()
      const { error } = await supabase.from('rooms').insert({ id, name })
      if (!error) { created = { id, name }; break }
    }
    if (!created) return null

    const { error: memberErr } = await supabase.from('members').insert({
      room_id: created.id,
      user_id: user.id,
      name: myName,
      unavailable_days: [],
    })

    if (memberErr) {
      console.error('[createRoom] member insert error:', memberErr)
      await supabase.from('rooms').delete().eq('id', created.id)
      return { error: memberErr.message }
    }

    setMyRooms(prev => [...prev.filter(r => r.id !== created.id), created])
    return created
  }

  async function joinRoom(code) {
    const { data: roomData, error } = await supabase
      .from('rooms').select('*').eq('id', code).single()
    if (error || !roomData) return null

    const { data: existing } = await supabase
      .from('members').select('id').eq('room_id', code).eq('user_id', user.id).single()

    if (!existing) {
      const { error: memberErr } = await supabase.from('members').insert({
        room_id: code, user_id: user.id, name: myName, unavailable_days: []
      })
      if (memberErr) return null
    }

    setMyRooms(prev => prev.find(r => r.id === code) ? prev : [...prev, roomData])
    return roomData
  }

  async function leaveRoom(roomId, isHost) {
    if (isHost) await supabase.from('rooms').delete().eq('id', roomId)
    else await supabase.from('members').delete().eq('room_id', roomId).eq('user_id', user.id)
    setMyRooms(prev => prev.filter(r => r.id !== roomId))
  }

  async function confirmDay(roomId, day) {
    const { error } = await supabase.from('rooms').update({ confirmed_day: day }).eq('id', roomId)
    if (!error) setMyRooms(prev => prev.map(r => r.id === roomId ? { ...r, confirmed_day: day } : r))
    return !error
  }

  async function renameRoom(roomId, name) {
    const { error } = await supabase.from('rooms').update({ name }).eq('id', roomId)
    if (!error) setMyRooms(prev => prev.map(r => r.id === roomId ? { ...r, name } : r))
    return !error
  }

  async function leaveRoomById(roomId) {
    const { data } = await supabase
      .from('members').select('user_id').eq('room_id', roomId).order('created_at').limit(1)
    const isHost = data?.[0]?.user_id === user.id
    await leaveRoom(roomId, isHost)
  }

  return { myRooms, loadMyRooms, createRoom, joinRoom, leaveRoom, leaveRoomById, confirmDay, renameRoom }
}
