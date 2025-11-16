import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { trackSlug: string; phaseSlug: string; topicSlug: string } }
) {
  try {
    const { trackSlug, phaseSlug, topicSlug } = params

    // First find the track
    const track = await prisma.track.findUnique({
      where: { slug: trackSlug },
      select: { id: true, slug: true, titleEn: true, titleTr: true }
    })

    if (!track) {
      return NextResponse.json(
        {
          success: false,
          error: 'Track not found'
        },
        { status: 404 }
      )
    }

    // Then find the phase
    const phase = await prisma.phase.findFirst({
      where: {
        slug: phaseSlug,
        trackId: track.id
      },
      select: { id: true, slug: true, titleEn: true, titleTr: true }
    })

    if (!phase) {
      return NextResponse.json(
        {
          success: false,
          error: 'Phase not found'
        },
        { status: 404 }
      )
    }

    // Finally find the topic with all related data
    const topic = await prisma.topic.findFirst({
      where: {
        slug: topicSlug,
        phaseId: phase.id
      },
      include: {
        resources: {
          orderBy: { order: 'asc' }
        },
        quizzes: {
          include: {
            questions: {
              include: {
                choices: true
              }
            }
          }
        },
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
        }
      }
    })

    if (!topic) {
      return NextResponse.json(
        {
          success: false,
          error: 'Topic not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: topic
    })
  } catch (error) {
    console.error('Error fetching topic:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch topic'
      },
      { status: 500 }
    )
  }
}
