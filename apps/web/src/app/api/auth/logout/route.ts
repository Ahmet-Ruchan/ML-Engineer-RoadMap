import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/auth/supabaseClient'

export async function POST(request: NextRequest) {
  try {
    const supabase = await getServerSupabase()
    
    await supabase.auth.signOut()
    
    const response = NextResponse.json({
      success: true,
    })
    
    // Clear auth cookies
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    
    return response
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}

