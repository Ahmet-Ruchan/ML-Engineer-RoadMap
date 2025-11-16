import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const phaseId = searchParams.get('phaseId')

    const where = phaseId ? { phaseId } : {}

    const topics = await prisma.topic.findMany({
      where,
      include: {
        phase: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleTr: true,
            track: {
              select: {
                id: true,
                slug: true,
                titleEn: true,
                titleTr: true
              }
            }
          }
        },
        _count: {
          select: {
            resources: true,
            quizzes: true
          }
        }
      },
      orderBy: [{ phaseId: 'asc' }, { order: 'asc' }]
    })

    return NextResponse.json({
      success: true,
      data: topics
    })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch topics'
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
      phaseId,
      slug,
      titleEn,
      titleTr,
      descriptionEn,
      descriptionTr,
      contentEn,
      contentTr,
      order,
      estimatedHours,
      difficulty
    } = body

    if (!phaseId || !slug || !titleEn || !titleTr) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      )
    }

    const topic = await prisma.topic.create({
      data: {
        phaseId,
        slug,
        titleEn,
        titleTr,
        descriptionEn,
        descriptionTr,
        contentEn,
        contentTr,
        order: order || 0,
        estimatedHours,
        difficulty
      }
    })

    return NextResponse.json({
      success: true,
      data: topic
    })
  } catch (error) {
    console.error('Error creating topic:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create topic'
      },
      { status: 500 }
    )
  }
}
