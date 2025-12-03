import { cookies } from 'next/headers'
import { supabase } from './supabase'

export async function getSession() {
  const cookieStore = cookies()
  const token = cookieStore.get('sb-access-token')?.value

  if (!token) {
    return null
  }

  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    return null
  }

  return data.user
}

export async function requireAuth() {
  const user = await getSession()

  if (!user) {
    throw new Error('Unauthorized')
  }

  return user
}
