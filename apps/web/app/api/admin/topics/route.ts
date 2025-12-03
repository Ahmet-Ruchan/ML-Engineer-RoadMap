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

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const phaseId = searchParams.get('phaseId') || ''
    const difficulty = searchParams.get('difficulty') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { titleEn: { contains: search, mode: 'insensitive' } },
        { titleTr: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (phaseId) {
      where.phaseId = phaseId
    }

    if (difficulty !== 'all') {
      where.difficulty = difficulty
    }

    // Get total count
    const totalTopics = await prisma.topic.count({ where })

    // Get topics with phase and track info
    const topics = await prisma.topic.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { phase: { order: 'asc' } },
        { order: 'asc' }
      ],
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
            quizzes: true,
            progressItems: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        topics,
        pagination: {
          page,
          limit,
          total: totalTopics,
          totalPages: Math.ceil(totalTopics / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

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

    // Validate required fields
    if (!phaseId || !slug || !titleEn || !titleTr) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: phaseId, slug, titleEn, titleTr' },
        { status: 400 }
      )
    }

    // Validate difficulty if provided
    if (difficulty && !['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return NextResponse.json(
        { success: false, error: 'Invalid difficulty. Must be: beginner, intermediate, or advanced' },
        { status: 400 }
      )
    }

    // Check if phase exists
    const phase = await prisma.phase.findUnique({
      where: { id: phaseId }
    })

    if (!phase) {
      return NextResponse.json(
        { success: false, error: 'Phase not found' },
        { status: 404 }
      )
    }

    // Check if slug already exists in this phase
    const existingTopic = await prisma.topic.findFirst({
      where: {
        phaseId,
        slug
      }
    })

    if (existingTopic) {
      return NextResponse.json(
        { success: false, error: 'Topic with this slug already exists in this phase' },
        { status: 400 }
      )
    }

    // Create topic
    const topic = await prisma.topic.create({
      data: {
        phaseId,
        slug,
        titleEn,
        titleTr,
        descriptionEn: descriptionEn || null,
        descriptionTr: descriptionTr || null,
        contentEn: contentEn || null,
        contentTr: contentTr || null,
        order: order || 0,
        estimatedHours: estimatedHours ? parseInt(estimatedHours) : null,
        difficulty: difficulty || null
      },
      include: {
        phase: {
          select: {
            titleEn: true,
            titleTr: true,
            track: {
              select: {
                titleEn: true,
                titleTr: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: topic
    })
  } catch (error) {
    console.error('Error creating topic:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create topic' },
      { status: 500 }
    )
  }
}
