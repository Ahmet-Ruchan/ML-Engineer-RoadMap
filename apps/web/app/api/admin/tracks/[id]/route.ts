import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const track = await prisma.track.findUnique({
      where: { id: params.id },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { topics: true }
            }
          }
        }
      }
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

    return NextResponse.json({
      success: true,
      data: track
    })
  } catch (error) {
    console.error('Error fetching track:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch track'
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const { slug, titleEn, titleTr, descriptionEn, descriptionTr, icon, color } = body

    // Check if track exists
    const existing = await prisma.track.findUnique({
      where: { id: params.id }
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Track not found'
        },
        { status: 404 }
      )
    }

    // If slug is being changed, check if new slug is available
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.track.findUnique({
        where: { slug }
      })

      if (slugExists) {
        return NextResponse.json(
          {
            success: false,
            error: 'Slug already exists'
          },
          { status: 400 }
        )
      }
    }

    const track = await prisma.track.update({
      where: { id: params.id },
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
    console.error('Error updating track:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update track'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    // Check if track exists
    const existing = await prisma.track.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { phases: true }
        }
      }
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Track not found'
        },
        { status: 404 }
      )
    }

    // Check if track has phases
    if (existing._count.phases > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete track with phases. Delete phases first.'
        },
        { status: 400 }
      )
    }

    await prisma.track.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Track deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting track:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete track'
      },
      { status: 500 }
    )
  }
}
