import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')

    const where: any = {
      userId: session.user.id
    }

    if (topicId) {
      where.topicId = topicId
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        topic: {
          select: {
            id: true,
            titleEn: true,
            titleTr: true,
            slug: true,
            phase: {
              select: {
                slug: true,
                track: {
                  select: {
                    slug: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: notes
    })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notes' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const { topicId, content } = await request.json()

    if (!topicId || !content) {
      return NextResponse.json(
        { success: false, error: 'Topic ID and content are required' },
        { status: 400 }
      )
    }

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        topicId,
        content
      }
    })

    return NextResponse.json({
      success: true,
      data: note
    })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create note' },
      { status: 500 }
    )
  }
}
