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

    // Get query parameters for search and filter
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Build where clause for filtering
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role !== 'all') {
      where.role = role
    }

    // Get total count for pagination
    const totalUsers = await prisma.user.count({ where })

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
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

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
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

        return {
          ...user,
          stats: {
            totalProgress: user._count.progressItems,
            completedTopics,
            inProgressTopics,
            totalBadges: user._count.badges,
            totalBookmarks: user._count.bookmarks,
            totalNotes: user._count.notes,
            quizzesPassed
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
