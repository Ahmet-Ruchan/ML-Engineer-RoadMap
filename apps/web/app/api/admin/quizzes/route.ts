import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')

    const where = topicId ? { topicId } : {}

    const quizzes = await prisma.quiz.findMany({
      where,
      include: {
        topic: {
          select: {
            id: true,
            slug: true,
            titleEn: true,
            titleTr: true
          }
        },
        _count: {
          select: { questions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: quizzes
    })
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch quizzes'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const {
      topicId,
      titleEn,
      titleTr,
      descriptionEn,
      descriptionTr,
      passingScore,
      timeLimit,
      questions
    } = body

    if (!topicId || !titleEn || !titleTr) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields'
        },
        { status: 400 }
      )
    }

    const quiz = await prisma.quiz.create({
      data: {
        topicId,
        titleEn,
        titleTr,
        descriptionEn,
        descriptionTr,
        passingScore: passingScore || 70,
        timeLimit,
        questions: questions ? {
          create: questions.map((q: any, index: number) => ({
            questionTextEn: q.questionTextEn,
            questionTextTr: q.questionTextTr,
            explanationEn: q.explanationEn,
            explanationTr: q.explanationTr,
            order: index,
            choices: {
              create: q.choices.map((c: any, cIndex: number) => ({
                choiceTextEn: c.choiceTextEn,
                choiceTextTr: c.choiceTextTr,
                isCorrect: c.isCorrect,
                order: cIndex
              }))
            }
          }))
        } : undefined
      },
      include: {
        questions: {
          include: {
            choices: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: quiz
    })
  } catch (error) {
    console.error('Error creating quiz:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create quiz'
      },
      { status: 500 }
    )
  }
}
