import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { getUserName } from '../utils'

export function useAuth() {
  const [user, setUser]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true)
      else setRecovering(false)
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function getRedirectTo() {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('room')
    return window.location.origin + window.location.pathname + (code ? `?room=${code}` : '')
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: getRedirectTo() } })
  }

  async function signInWithId(id, password) {
    const { data: profile, error: lookupErr } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', id)
      .single()

    if (lookupErr || !profile) return { message: 'User not found' }

    const { error } = await supabase.auth.signInWithPassword({ email: profile.email, password })
    return error ?? null
  }

  async function signUpWithId({ id, nickname, email, password }) {
    // 아이디 중복 확인
    const { data: existing } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', id)
      .single()

    if (existing) return { message: 'Username already registered' }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: nickname || id, username: id } },
    })
    if (error) return error

    return null
  }

  async function resetPassword(id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', id)
      .single()

    if (!profile) return { found: false }

    await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo: window.location.origin,
    })
    return { found: true, email: profile.email }
  }

  async function updatePassword(newPassword) {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (!error) setRecovering(false)
    return error ?? null
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  async function updateName(name) {
    await supabase.auth.updateUser({ data: { full_name: name } })
    if (user) await supabase.from('members').update({ name }).eq('user_id', user.id)
  }

  return {
    user, loading, recovering, myName: getUserName(user),
    loginWithGoogle, signInWithId, signUpWithId,
    resetPassword, updatePassword, logout, updateName,
  }
}
