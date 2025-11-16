import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const {
      titleEn,
      titleTr,
      descriptionEn,
      descriptionTr,
      type,
      url,
      order,
      duration,
      isPremium
    } = body

    const resource = await prisma.resource.update({
      where: { id: params.id },
      data: {
        titleEn,
        titleTr,
        descriptionEn,
        descriptionTr,
        type,
        url,
        order,
        duration,
        isPremium
      }
    })

    return NextResponse.json({
      success: true,
      data: resource
    })
  } catch (error) {
    console.error('Error updating resource:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update resource'
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
    await prisma.resource.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting resource:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete resource'
      },
      { status: 500 }
    )
  }
}
