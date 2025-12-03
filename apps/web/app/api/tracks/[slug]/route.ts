import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const track = await prisma.track.findUnique({
      where: { slug },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            topics: {
              orderBy: { order: 'asc' },
              include: {
                resources: {
                  orderBy: { order: 'asc' }
                },
                quizzes: true,
                _count: {
                  select: {
                    resources: true
                  }
                }
              }
            },
            _count: {
              select: {
                topics: true
              }
            }
          }
        },
        _count: {
          select: {
            phases: true
          }
        }
      }
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

    return NextResponse.json({
      success: true,
      data: track
    })
  } catch (error) {
    console.error('Error fetching track:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch track'
      },
      { status: 500 }
    )
  }
}
