import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        bio: true,
        preferredLanguage: true,
        level: true,
        xp: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            progressItems: true,
            badges: true,
            bookmarks: true,
            notes: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Get detailed stats
    const completedTopics = await prisma.progressItem.count({
      where: {
        userId: user.id,
        status: 'completed'
      }
    })

    const inProgressTopics = await prisma.progressItem.count({
      where: {
        userId: user.id,
        status: 'in_progress'
      }
    })

    const quizzesPassed = await prisma.quizResult.count({
      where: {
        userId: user.id,
        passed: true
      }
    })

    const recentProgress = await prisma.progressItem.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      include: {
        topic: {
          select: {
            titleEn: true,
            titleTr: true,
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
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        stats: {
          totalProgress: user._count.progressItems,
          completedTopics,
          inProgressTopics,
          totalBadges: user._count.badges,
          totalBookmarks: user._count.bookmarks,
          totalNotes: user._count.notes,
          quizzesPassed
        },
        recentProgress
      }
    })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { role, name, bio, preferredLanguage } = body

    // Validate role if provided
    if (role && !['user', 'admin'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      )
    }

    // Prevent admin from changing their own role
    if (session.user.id === params.id && role && role !== session.user.role) {
      return NextResponse.json(
        { success: false, error: 'Cannot change your own role' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}
    if (role !== undefined) updateData.role = role
    if (name !== undefined) updateData.name = name
    if (bio !== undefined) updateData.bio = bio
    if (preferredLanguage !== undefined) updateData.preferredLanguage = preferredLanguage

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        bio: true,
        preferredLanguage: true,
        level: true,
        xp: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: updatedUser
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Prevent admin from deleting themselves
    if (session.user.id === params.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
