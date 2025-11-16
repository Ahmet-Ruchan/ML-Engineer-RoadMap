import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      )
    }

    const { quizId } = params
    const { answers } = await request.json()

    // Validate quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            choices: true
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

    // Calculate score
    let correctAnswers = 0
    const totalQuestions = quiz.questions.length

    const answerRecords = answers.map((answer: { questionId: string; choiceId: string }) => {
      const question = quiz.questions.find(q => q.id === answer.questionId)
      const choice = question?.choices.find(c => c.id === answer.choiceId)

      if (choice?.isCorrect) {
        correctAnswers++
      }

      return {
        questionId: answer.questionId,
        choiceId: answer.choiceId
      }
    })

    const score = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: session.user.id,
        quizId,
        score,
        answers: {
          create: answerRecords
        }
      },
      include: {
        answers: {
          include: {
            question: true,
            choice: true
          }
        }
      }
    })

    // Return results with correct answers
    const results = quiz.questions.map(question => {
      const userAnswer = answers.find((a: any) => a.questionId === question.id)
      const correctChoice = question.choices.find(c => c.isCorrect)
      const userChoice = question.choices.find(c => c.id === userAnswer?.choiceId)

      return {
        questionId: question.id,
        questionText: question.questionTextEn, // or based on locale
        userChoiceId: userAnswer?.choiceId,
        userChoiceText: userChoice?.choiceTextEn,
        correctChoiceId: correctChoice?.id,
        correctChoiceText: correctChoice?.choiceTextEn,
        isCorrect: userChoice?.isCorrect || false,
        explanation: question.explanationEn
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        attemptId: attempt.id,
        score,
        correctAnswers,
        totalQuestions,
        results
      }
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to submit quiz'
      },
      { status: 500 }
    )
  }
}
