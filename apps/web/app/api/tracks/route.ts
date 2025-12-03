import { NextRequest } from 'next/server'
import { trackService } from '@/lib/services/trackService'
import { successResponse, errorResponse } from '@/lib/utils/response'
import { handleError } from '@/lib/utils/errors'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')

    if (slug) {
      const track = await trackService.getTrack(slug)
      return successResponse(track)
    }

    const tracks = await trackService.getAllTracks()
    return successResponse(tracks)
  } catch (error) {
    const errorData = handleError(error)
    return errorResponse(errorData.error, 500, errorData.code)
  }
}
