import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

interface Activity {
  id: string
  type: string
  action: string
  entity: string
  entityId: string
  description: string
  timestamp: Date
  user?: {
    name: string | null
    email: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type') || 'all'

    const activities: Activity[] = []

    // Fetch recent users
    if (type === 'all' || type === 'user') {
      const recentUsers = await prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      })

      recentUsers.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user',
          action: 'created',
          entity: 'User',
          entityId: user.id,
          description: `New ${user.role} registered: ${user.name || user.email}`,
          timestamp: user.createdAt
        })
      })
    }

    // Fetch recent topics
    if (type === 'all' || type === 'topic') {
      const recentTopics = await prisma.topic.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          titleEn: true,
          titleTr: true,
          createdAt: true,
          phase: {
            select: {
              titleEn: true,
              track: {
                select: {
                  titleEn: true
                }
              }
            }
          }
        }
      })

      recentTopics.forEach(topic => {
        activities.push({
          id: `topic-${topic.id}`,
          type: 'topic',
          action: 'created',
          entity: 'Topic',
          entityId: topic.id,
          description: `New topic created: "${topic.titleEn}" in ${topic.phase.track.titleEn} → ${topic.phase.titleEn}`,
          timestamp: topic.createdAt
        })
      })
    }

    // Fetch recent progress items
    if (type === 'all' || type === 'progress') {
      const recentProgress = await prisma.progressItem.findMany({
        take: 20,
        orderBy: { updatedAt: 'desc' },
        where: {
          status: 'completed'
        },
        select: {
          id: true,
          status: true,
          completedAt: true,
          updatedAt: true,
          user: {
            select: {
              name: true,
              email: true
            }
          },
          topic: {
            select: {
              titleEn: true
            }
          }
        }
      })

      recentProgress.forEach(progress => {
        activities.push({
          id: `progress-${progress.id}`,
          type: 'progress',
          action: 'completed',
          entity: 'Topic Progress',
          entityId: progress.id,
          description: `${progress.user.name || progress.user.email} completed: "${progress.topic.titleEn}"`,
          timestamp: progress.completedAt || progress.updatedAt,
          user: progress.user
        })
      })
    }

    // Fetch recent resources
    if (type === 'all' || type === 'resource') {
      const recentResources = await prisma.resource.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          titleEn: true,
          type: true,
          createdAt: true,
          topic: {
            select: {
              titleEn: true
            }
          }
        }
      })

      recentResources.forEach(resource => {
        activities.push({
          id: `resource-${resource.id}`,
          type: 'resource',
          action: 'created',
          entity: 'Resource',
          entityId: resource.id,
          description: `New ${resource.type} added: "${resource.titleEn}" for topic "${resource.topic.titleEn}"`,
          timestamp: resource.createdAt
        })
      })
    }

    // Sort all activities by timestamp (most recent first)
    const sortedActivities = activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: {
        activities: sortedActivities,
        total: sortedActivities.length
      }
    })
  } catch (error) {
    console.error('Error fetching activity logs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
}
