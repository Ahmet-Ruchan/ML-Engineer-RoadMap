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
    const phase = await prisma.phase.findUnique({
      where: { id: params.id },
      include: {
        track: true,
        topics: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!phase) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phase not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: phase
    })
  } catch (error) {
    console.error('Error fetching phase:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch phase'
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
    const { slug, titleEn, titleTr, descriptionEn, descriptionTr, order, durationMonths } = body

    const phase = await prisma.phase.update({
      where: { id: params.id },
      data: {
        slug,
        titleEn,
        titleTr,
        descriptionEn,
        descriptionTr,
        order,
        durationMonths
      }
    })

    return NextResponse.json({
      success: true,
      data: phase
    })
  } catch (error) {
    console.error('Error updating phase:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update phase'
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
    const existing = await prisma.phase.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { topics: true }
        }
      }
    })

    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phase not found'
        },
        { status: 404 }
      )
    }

    if (existing._count.topics > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete phase with topics. Delete topics first.'
        },
        { status: 400 }
      )
    }

    await prisma.phase.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Phase deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting phase:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete phase'
      },
      { status: 500 }
    )
  }
}
