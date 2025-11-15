import { prisma } from '@/lib/db/prismaClient'
import { AppError } from '@/lib/utils/errors'
import { createBookmarkSchema } from '@/lib/utils/validators'

export const BookmarkService = {
  /**
   * Create a bookmark for a topic
   */
  async createBookmark(userId: string, data: unknown) {
    // Validate input
    const validated = createBookmarkSchema.parse(data)
    
    // Check if topic exists and is published
    const topic = await prisma.topic.findUnique({
      where: { id: validated.topicId },
    })
    
    if (!topic) {
      throw new AppError('Topic not found', 404)
    }
    
    if (!topic.published) {
      throw new AppError('Topic is not published', 403)
    }
    
    // Check if bookmark already exists
    const existing = await prisma.bookmark.findUnique({
      where: {
        user_id_topic_id: {
          user_id: userId,
          topic_id: validated.topicId,
        },
      },
    })
    
    if (existing) {
      throw new AppError('Bookmark already exists', 400)
    }
    
    // Create bookmark
    const bookmark = await prisma.bookmark.create({
      data: {
        user_id: userId,
        topic_id: validated.topicId,
      },
      include: {
        topic: {
          include: {
            phase: true,
          },
        },
      },
    })
    
    return bookmark
  },
  
  /**
   * Delete a bookmark
   */
  async deleteBookmark(userId: string, bookmarkId: string) {
    // Check if bookmark exists and belongs to user
    const bookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    })
    
    if (!bookmark) {
      throw new AppError('Bookmark not found', 404)
    }
    
    if (bookmark.user_id !== userId) {
      throw new AppError('Unauthorized', 403)
    }
    
    // Delete bookmark
    await prisma.bookmark.delete({
      where: { id: bookmarkId },
    })
    
    return { success: true }
  },
  
  /**
   * Get all bookmarks for a user
   */
  async getUserBookmarks(userId: string) {
    return prisma.bookmark.findMany({
      where: {
        user_id: userId,
      },
      include: {
        topic: {
          include: {
            phase: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    })
  },
  
  /**
   * Check if a topic is bookmarked by user
   */
  async isBookmarked(userId: string, topicId: string) {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        user_id_topic_id: {
          user_id: userId,
          topic_id: topicId,
        },
      },
    })
    
    return !!bookmark
  },
}

