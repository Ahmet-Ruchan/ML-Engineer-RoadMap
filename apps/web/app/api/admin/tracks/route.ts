import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET() {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const tracks = await prisma.track.findMany({
      include: {
        _count: {
          select: {
            phases: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: tracks
    })
  } catch (error) {
    console.error('Error fetching tracks:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch tracks'
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
    const { slug, titleEn, titleTr, descriptionEn, descriptionTr, icon, color } = body

    // Validate required fields
    if (!slug || !titleEn || !titleTr) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: slug, titleEn, titleTr'
        },
        { status: 400 }
      )
    }

    // Check if slug already exists
    const existing = await prisma.track.findUnique({
      where: { slug }
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Track with this slug already exists'
        },
        { status: 400 }
      )
    }

    const track = await prisma.track.create({
      data: {
        slug,
        titleEn,
        titleTr,
        descriptionEn,
        descriptionTr,
        icon,
        color
      }
    })

    return NextResponse.json({
      success: true,
      data: track
    })
  } catch (error) {
    console.error('Error creating track:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create track'
      },
      { status: 500 }
    )
  }
}
