import { NextRequest } from 'next/server'
import { progressService } from '@/lib/services/progressService'
import { getSession } from '@/lib/auth/session'
import { successResponse, errorResponse } from '@/lib/utils/response'
import { handleError } from '@/lib/utils/errors'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const progress = await progressService.getUserProgress(user.id)
    return successResponse(progress)
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
    const progress = await progressService.updateProgress({
      userId: user.id,
      ...body,
    })

    return successResponse(progress, 201)
  } catch (error) {
    const errorData = handleError(error)
    return errorResponse(errorData.error, 500, errorData.code)
  }
}
