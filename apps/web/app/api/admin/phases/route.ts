import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const trackId = searchParams.get('trackId')

    const where = trackId ? { trackId } : {}

    const phases = await prisma.phase.findMany({
      where,
      include: {
        track: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleTr: true
          }
        },
        _count: {
          select: { topics: true }
        }
      },
      orderBy: [{ trackId: 'asc' }, { order: 'asc' }]
    })

    return NextResponse.json({
      success: true,
      data: phases
    })
  } catch (error) {
    console.error('Error fetching phases:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch phases'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { trackId, slug, titleEn, titleTr, descriptionEn, descriptionTr, order, durationMonths } = body

    if (!trackId || !slug || !titleEn || !titleTr) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      )
    }

    // Check if track exists
    const track = await prisma.track.findUnique({
      where: { id: trackId }
    })

    if (!track) {
      return NextResponse.json(
        {
          success: false,
          error: 'Track not found'
        },
        { status: 404 }
      )
    }

    const phase = await prisma.phase.create({
      data: {
        trackId,
        slug,
        titleEn,
        titleTr,
        descriptionEn,
        descriptionTr,
        order: order || 0,
        durationMonths: durationMonths || 1
      }
    })

    return NextResponse.json({
      success: true,
      data: phase
    })
  } catch (error) {
    console.error('Error creating phase:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create phase'
      },
      { status: 500 }
    )
  }
}
