import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const quiz = await prisma.quiz.findUnique({
      where: { id: params.id },
      include: {
        topic: true,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    const body = await request.json()
    const {
      titleEn,
      titleTr,
      descriptionEn,
      descriptionTr,
      passingScore,
      timeLimit
    } = body

    const quiz = await prisma.quiz.update({
      where: { id: params.id },
      data: {
        titleEn,
        titleTr,
        descriptionEn,
        descriptionTr,
        passingScore,
        timeLimit
      }
    })

    return NextResponse.json({
      success: true,
      data: quiz
    })
  } catch (error) {
    console.error('Error updating quiz:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update quiz'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const adminCheck = await requireAdmin()
  if (adminCheck) return adminCheck

  try {
    // Delete all quiz attempts and answers first
    const attempts = await prisma.quizAttempt.findMany({
      where: { quizId: params.id }
    })

    for (const attempt of attempts) {
      await prisma.quizAnswer.deleteMany({
        where: { attemptId: attempt.id }
      })
    }

    await prisma.quizAttempt.deleteMany({
      where: { quizId: params.id }
    })

    // Delete all questions and choices
    const questions = await prisma.question.findMany({
      where: { quizId: params.id }
    })

    for (const question of questions) {
      await prisma.choice.deleteMany({
        where: { questionId: question.id }
      })
    }

    await prisma.question.deleteMany({
      where: { quizId: params.id }
    })

    // Finally delete the quiz
    await prisma.quiz.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Quiz deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting quiz:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete quiz'
      },
      { status: 500 }
    )
  }
}
