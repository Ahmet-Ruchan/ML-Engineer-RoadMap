import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        topic: {
          include: {
            phase: {
              include: {
                track: {
                  select: {
                    titleEn: true,
                    titleTr: true,
                    slug: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: bookmarks
    })
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bookmarks' },
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
    const { topicId } = await request.json()

    if (!topicId) {
      return NextResponse.json(
        { success: false, error: 'Topic ID is required' },
        { status: 400 }
      )
    }

    // Check if bookmark already exists
    const existing = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.id,
        topicId
      }
    })

    if (existing) {
      // Remove bookmark
      await prisma.bookmark.delete({
        where: { id: existing.id }
      })

      return NextResponse.json({
        success: true,
        message: 'Bookmark removed',
        bookmarked: false
      })
    } else {
      // Add bookmark
      const bookmark = await prisma.bookmark.create({
        data: {
          userId: session.user.id,
          topicId
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Bookmark added',
        data: bookmark,
        bookmarked: true
      })
    }
  } catch (error) {
    console.error('Error toggling bookmark:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle bookmark' },
      { status: 500 }
    )
  }
}
