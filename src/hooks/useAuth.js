import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import { getUserName } from '../utils'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
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

  async function loginWithKakao() {
    await supabase.auth.signInWithOAuth({ provider: 'kakao', options: { redirectTo: getRedirectTo() } })
  }

  async function signInWithId(id, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email: `${id}@moyeo.app`,
      password,
    })
    return error ?? null
  }

  async function signUpWithId({ id, nickname, email, password }) {
    const { error } = await supabase.auth.signUp({
      email: `${id}@moyeo.app`,
      password,
      options: {
        data: {
          full_name: nickname || id,
          username: id,
          recovery_email: email,
        },
      },
    })
    return error ?? null
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  async function updateName(name) {
    await supabase.auth.updateUser({ data: { full_name: name } })
    if (user) await supabase.from('members').update({ name }).eq('user_id', user.id)
  }

  return { user, loading, myName: getUserName(user), loginWithGoogle, signInWithId, signUpWithId, logout, updateName }
}
