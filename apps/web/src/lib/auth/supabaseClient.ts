import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client with cookies
export async function getServerSupabase() {
  const cookieStore = cookies()
  
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        storage: {
          getItem: async (key: string) => {
            const cookie = cookieStore.get(key)
            return cookie?.value ?? null
          },
          setItem: async (key: string, value: string) => {
            cookieStore.set(key, value, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 7, // 7 days
            })
          },
          removeItem: async (key: string) => {
            cookieStore.delete(key)
          },
        },
      },
    }
  )
}

// Get authenticated user from request
export async function getUser() {
  const supabase = await getServerSupabase()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

// Get user with profile (including role)
export async function getUserWithProfile() {
  const user = await getUser()
  
  if (!user) {
    return null
  }
  
  const supabase = await getServerSupabase()
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (error) {
      console.error('Error getting profile:', error)
      return null
    }
    
    return {
      ...user,
      profile,
    }
  } catch (error) {
    console.error('Error getting user with profile:', error)
    return null
  }
}

// Check if user is admin
export async function isAdmin() {
  const userWithProfile = await getUserWithProfile()
  return userWithProfile?.profile?.role === 'admin'
}

