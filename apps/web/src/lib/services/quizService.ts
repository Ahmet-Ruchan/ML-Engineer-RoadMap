import { prisma } from '@/lib/db/prismaClient'
import { AppError } from '@/lib/utils/errors'
import { submitQuizSchema } from '@/lib/utils/validators'

export const QuizService = {
  /**
   * Get all published quizzes
   */
  async getQuizzes() {
    return prisma.quiz.findMany({
      where: {
        published: true,
      },
      include: {
        topic: {
          include: {
            phase: true,
          },
        },
        _count: {
          select: {
            questions: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
  },
  
  /**
   * Get a single quiz with questions and choices
   */
  async getQuiz(quizId: string) {
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        topic: {
          include: {
            phase: true,
          },
        },
        questions: {
          include: {
            choices: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    })
    
    if (!quiz) {
      throw new AppError('Quiz not found', 404)
    }
    
    if (!quiz.published) {
      throw new AppError('Quiz is not published', 403)
    }
    
    // Remove correct answer flags from choices (don't reveal answers)
    const sanitizedQuiz = {
      ...quiz,
      questions: quiz.questions.map((q) => ({
        ...q,
        choices: q.choices.map((c) => ({
          id: c.id,
          choice_text: c.choice_text,
          order: c.order,
        })),
      })),
    }
    
    return sanitizedQuiz
  },
  
  /**
   * Submit quiz answers and calculate score
   */
  async submitQuiz(userId: string, data: unknown) {
    // Validate input
    const validated = submitQuizSchema.parse(data)
    
    // Get quiz with questions and choices
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
    
    if (!quiz.published) {
      throw new AppError('Quiz is not published', 403)
    }
    
    // Create quiz attempt
    const attempt = await prisma.quiz_attempt.create({
      data: {
        user_id: userId,
        quiz_id: validated.quizId,
        started_at: new Date(),
      },
    })
    
    // Process answers
    let correctCount = 0
    const answerPromises = validated.answers.map(async (answer) => {
      const question = quiz.questions.find((q) => q.id === answer.questionId)
      
      if (!question) {
        throw new AppError(`Question ${answer.questionId} not found`, 404)
      }
      
      const choice = question.choices.find((c) => c.id === answer.choiceId)
      
      if (!choice) {
        throw new AppError(`Choice ${answer.choiceId} not found`, 404)
      }
      
      const isCorrect = choice.is_correct
      if (isCorrect) {
        correctCount++
      }
      
      return prisma.quiz_answer.create({
        data: {
          attempt_id: attempt.id,
          question_id: answer.questionId,
          choice_id: answer.choiceId,
          is_correct: isCorrect,
        },
      })
    })
    
    await Promise.all(answerPromises)
    
    // Calculate score
    const totalQuestions = quiz.questions.length
    const score = Math.round((correctCount / totalQuestions) * 100)
    const passed = score >= quiz.pass_score
    
    // Update attempt with score
    const updatedAttempt = await prisma.quiz_attempt.update({
      where: { id: attempt.id },
      data: {
        score,
        passed,
        completed_at: new Date(),
      },
      include: {
        quiz: true,
        answers: {
          include: {
            question: true,
            choice: true,
          },
        },
      },
    })
    
    return updatedAttempt
  },
  
  /**
   * Get user's quiz attempts
   */
  async getUserAttempts(userId: string, quizId?: string) {
    return prisma.quiz_attempt.findMany({
      where: {
        user_id: userId,
        ...(quizId && { quiz_id: quizId }),
      },
      include: {
        quiz: {
          include: {
            topic: true,
          },
        },
      },
      orderBy: {
        started_at: 'desc',
      },
    })
  },
  
  /**
   * Get quiz attempt details with answers
   */
  async getAttempt(userId: string, attemptId: string) {
    const attempt = await prisma.quiz_attempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                choices: true,
              },
            },
          },
        },
        answers: {
          include: {
            question: {
              include: {
                choices: true,
              },
            },
            choice: true,
          },
        },
      },
    })
    
    if (!attempt) {
      throw new AppError('Attempt not found', 404)
    }
    
    if (attempt.user_id !== userId) {
      throw new AppError('Unauthorized', 403)
    }
    
    return attempt
  },
}

