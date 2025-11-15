import { NextRequest } from 'next/server'
import { quizService } from '@/lib/services/quizService'
import { getSession } from '@/lib/auth/session'
import { successResponse, errorResponse } from '@/lib/utils/response'
import { handleError } from '@/lib/utils/errors'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const quizId = searchParams.get('quizId')

    if (quizId) {
      const quiz = await quizService.getQuiz(quizId)
      return successResponse(quiz)
    }

    const attempts = await quizService.getUserAttempts(user.id)
    return successResponse(attempts)
  } catch (error) {
    const errorData = handleError(error)
    return errorResponse(errorData.error, 500, errorData.code)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const attempt = await quizService.submitQuiz({
      userId: user.id,
      ...body,
    })

    return successResponse(attempt, 201)
  } catch (error) {
    const errorData = handleError(error)
    return errorResponse(errorData.error, 500, errorData.code)
  }
}
