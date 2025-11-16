import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const { quizId } = params

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        topic: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleTr: true,
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
        },
        questions: {
          orderBy: { order: 'asc' },
          include: {
            choices: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    if (!quiz) {
      return NextResponse.json(
        {
          success: false,
          error: 'Quiz not found'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: quiz
    })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch quiz'
      },
      { status: 500 }
    )
  }
}
