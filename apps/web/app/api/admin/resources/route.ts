import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')

    const where = topicId ? { topicId } : {}

    const resources = await prisma.resource.findMany({
      where,
      include: {
        topic: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleTr: true
          }
        }
      },
      orderBy: [{ topicId: 'asc' }, { order: 'asc' }]
    })

    return NextResponse.json({
      success: true,
      data: resources
    })
  } catch (error) {
    console.error('Error fetching resources:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch resources'
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
    const {
      topicId,
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

    if (!topicId || !titleEn || !titleTr || !type || !url) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      )
    }

    const resource = await prisma.resource.create({
      data: {
        topicId,
        titleEn,
        titleTr,
        descriptionEn,
        descriptionTr,
        type,
        url,
        order: order || 0,
        duration,
        isPremium: isPremium || false
      }
    })

    return NextResponse.json({
      success: true,
      data: resource
    })
  } catch (error) {
    console.error('Error creating resource:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create resource'
      },
      { status: 500 }
    )
  }
}
