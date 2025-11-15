import { prisma } from '@/lib/db'
import { AppError } from '@/lib/utils/errors'
import { z } from 'zod'

const submitQuizSchema = z.object({
  userId: z.string().uuid(),
  quizId: z.string().uuid(),
  answers: z.array(
    z.object({
      questionId: z.string().uuid(),
      choiceId: z.string().uuid().optional(),
      answerText: z.string().optional(),
    })
  ),
})

export const quizService = {
  async getQuiz(quizId: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            choices: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
        topic: true,
      },
    })

    if (!quiz) {
      throw new AppError('Quiz not found', 404)
    }

    return quiz
  },

  async submitQuiz(data: z.infer<typeof submitQuizSchema>) {
    const validated = submitQuizSchema.parse(data)

    // Get quiz with questions and correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: validated.quizId },
      include: {
        questions: {
          include: {
            choices: true,
          },
        },
      },
    })

    if (!quiz) {
      throw new AppError('Quiz not found', 404)
    }

    // Calculate score
    let totalPoints = 0
    let earnedPoints = 0

    const answersData = validated.answers.map((answer) => {
      const question = quiz.questions.find((q) => q.id === answer.questionId)
      if (!question) {
        throw new AppError(`Question ${answer.questionId} not found`, 400)
      }

      totalPoints += question.points

      const correctChoice = question.choices.find((c) => c.isCorrect)
      const isCorrect = correctChoice?.id === answer.choiceId

      if (isCorrect) {
        earnedPoints += question.points
      }

      return {
        questionId: answer.questionId,
        choiceId: answer.choiceId,
        answerText: answer.answerText,
        isCorrect,
        pointsEarned: isCorrect ? question.points : 0,
      }
    })

    const score = Math.round((earnedPoints / totalPoints) * 100)
    const passed = score >= quiz.passingScore

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: validated.userId,
        quizId: validated.quizId,
        score,
        totalPoints,
        passed,
        completedAt: new Date(),
        answers: {
          create: answersData,
        },
      },
      include: {
        answers: {
          include: {
            question: {
              include: {
                choices: true,
              },
            },
          },
        },
      },
    })

    return attempt
  },

  async getUserAttempts(userId: string, quizId?: string) {
    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId,
        ...(quizId && { quizId }),
      },
      include: {
        quiz: {
          include: {
            topic: true,
          },
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    })

    return attempts
  },

  async getBestAttempt(userId: string, quizId: string) {
    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        userId,
        quizId,
      },
      orderBy: {
        score: 'desc',
      },
    })

    return attempt
  },
}
