import { NextResponse } from 'next/server'
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
    // Get all badges
    const allBadges = await prisma.badge.findMany({
      orderBy: { requiredCount: 'asc' }
    })

    // Get user's badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      include: { badge: true }
    })

    // Get user's progress
    const completedTopics = await prisma.progressItem.count({
      where: {
        userId: session.user.id,
        status: 'completed'
      }
    })

    // Check and award new badges
    for (const badge of allBadges) {
      const hasThis Badge = userBadges.some(ub => ub.badgeId === badge.id)

      if (!hasBadge && completedTopics >= badge.requiredCount) {
        // Award badge
        await prisma.userBadge.create({
          data: {
            userId: session.user.id,
            badgeId: badge.id
          }
        })
      }
    }

    // Fetch updated user badges
    const updatedUserBadges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: {
        allBadges,
        userBadges: updatedUserBadges,
        completedTopics
      }
    })
  } catch (error) {
    console.error('Error fetching badges:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch badges' },
      { status: 500 }
    )
  }
}
