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

  async function loginWithGoogle() {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('room')
    const redirectTo = window.location.origin + window.location.pathname + (code ? `?room=${code}` : '')
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo } })
  }

  async function logout() {
    await supabase.auth.signOut()
  }

  async function updateName(name) {
    await supabase.auth.updateUser({ data: { full_name: name } })
    if (user) await supabase.from('members').update({ name }).eq('user_id', user.id)
  }

  return { user, loading, myName: getUserName(user), loginWithGoogle, logout, updateName }
}
