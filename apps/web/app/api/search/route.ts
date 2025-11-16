import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        success: false,
        error: 'Query must be at least 2 characters'
      }, { status: 400 })
    }

    const searchTerm = query.trim().toLowerCase()

    // Search topics
    const topics = await prisma.topic.findMany({
      where: {
        OR: [
          { titleEn: { contains: searchTerm, mode: 'insensitive' } },
          { titleTr: { contains: searchTerm, mode: 'insensitive' } },
          { descriptionEn: { contains: searchTerm, mode: 'insensitive' } },
          { descriptionTr: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      include: {
        phase: {
          include: {
            track: {
              select: {
                slug: true,
                titleEn: true,
                titleTr: true
              }
            }
          }
        }
      },
      take: 10
    })

    // Search resources
    const resources = await prisma.resource.findMany({
      where: {
        OR: [
          { titleEn: { contains: searchTerm, mode: 'insensitive' } },
          { titleTr: { contains: searchTerm, mode: 'insensitive' } },
          { descriptionEn: { contains: searchTerm, mode: 'insensitive' } },
          { descriptionTr: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      include: {
        topic: {
          select: {
            slug: true,
            titleEn: true,
            titleTr: true,
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
      take: 10
    })

    return NextResponse.json({
      success: true,
      data: {
        topics,
        resources,
        total: topics.length + resources.length
      }
    })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to search' },
      { status: 500 }
    )
  }
}
