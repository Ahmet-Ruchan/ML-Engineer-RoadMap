import { NextRequest } from 'next/server'
import { bookmarkService } from '@/lib/services/bookmarkService'
import { getSession } from '@/lib/auth/session'
import { successResponse, errorResponse } from '@/lib/utils/response'
import { handleError } from '@/lib/utils/errors'

export async function GET(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const bookmarks = await bookmarkService.getUserBookmarks(user.id)
    return successResponse(bookmarks)
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
    const bookmark = await bookmarkService.createBookmark({
      userId: user.id,
      ...body,
    })

    return successResponse(bookmark, 201)
  } catch (error) {
    const errorData = handleError(error)
    return errorResponse(errorData.error, 500, errorData.code)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSession()
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const resourceId = searchParams.get('resourceId')

    if (!resourceId) {
      return errorResponse('resourceId is required', 400)
    }

    const result = await bookmarkService.deleteBookmark(user.id, resourceId)
    return successResponse(result)
  } catch (error) {
    const errorData = handleError(error)
    return errorResponse(errorData.error, 500, errorData.code)
  }
}
