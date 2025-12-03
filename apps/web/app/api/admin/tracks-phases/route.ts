import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all tracks with their phases
    const tracks = await prisma.track.findMany({
      orderBy: { order: 'asc' },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleTr: true,
            order: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: tracks
    })
  } catch (error) {
    console.error('Error fetching tracks and phases:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tracks and phases' },
      { status: 500 }
    )
  }
}
