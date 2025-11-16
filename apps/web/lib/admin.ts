import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json(
      {
        success: false,
        error: 'Unauthorized - Please login'
      },
      { status: 401 }
    )
  }

  if (session.user.role !== 'admin') {
    return NextResponse.json(
      {
        success: false,
        error: 'Forbidden - Admin access required'
      },
      { status: 403 }
    )
  }

  return null // No error, user is admin
}

export async function isAdmin() {
  const session = await getServerSession(authOptions)
  return session?.user?.role === 'admin'
}
