import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    // Get basic counts
    const [
      totalUsers,
      totalTracks,
      totalPhases,
      totalTopics,
      totalResources,
      totalQuizzes,
      totalBadges,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.track.count(),
      prisma.phase.count(),
      prisma.topic.count(),
      prisma.resource.count(),
      prisma.quiz.count(),
      prisma.badge.count(),
    ])

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const newUsersThisWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      }
    })

    // Get user roles distribution
    const adminCount = await prisma.user.count({ where: { role: 'admin' } })
    const userCount = await prisma.user.count({ where: { role: 'user' } })

    // Get recent users
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })

    // Get recent topics
    const recentTopics = await prisma.topic.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        titleEn: true,
        titleTr: true,
        createdAt: true,
        phase: {
          select: {
            titleEn: true,
            titleTr: true,
            track: {
              select: {
                titleEn: true,
                titleTr: true,
              }
            }
          }
        }
      }
    })

    // Get recent resources
    const recentResources = await prisma.resource.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        titleEn: true,
        titleTr: true,
        type: true,
        url: true,
        createdAt: true,
        topic: {
          select: {
            titleEn: true,
            titleTr: true,
          }
        }
      }
    })

    // Get progress statistics
    const totalProgressItems = await prisma.progressItem.count()
    const completedItems = await prisma.progressItem.count({
      where: { status: 'completed' }
    })
    const inProgressItems = await prisma.progressItem.count({
      where: { status: 'in_progress' }
    })

    return NextResponse.json({
      success: true,
      data: {
        counts: {
          totalUsers,
          totalTracks,
          totalPhases,
          totalTopics,
          totalResources,
          totalQuizzes,
          totalBadges,
          newUsersThisWeek,
          adminCount,
          userCount,
        },
        progress: {
          total: totalProgressItems,
          completed: completedItems,
          inProgress: inProgressItems,
          completionRate: totalProgressItems > 0
            ? Math.round((completedItems / totalProgressItems) * 100)
            : 0
        },
        recent: {
          users: recentUsers,
          topics: recentTopics,
          resources: recentResources,
        }
      }
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
