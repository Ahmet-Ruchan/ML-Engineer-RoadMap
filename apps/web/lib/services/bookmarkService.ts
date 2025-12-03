import { prisma } from '@/lib/db'
import { AppError } from '@/lib/utils/errors'
import { z } from 'zod'

const createBookmarkSchema = z.object({
  userId: z.string().uuid(),
  resourceId: z.string().uuid(),
  note: z.string().optional(),
})

export const bookmarkService = {
  async createBookmark(data: z.infer<typeof createBookmarkSchema>) {
    const validated = createBookmarkSchema.parse(data)

    // Check if bookmark already exists
    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_resourceId: {
          userId: validated.userId,
          resourceId: validated.resourceId,
        },
      },
    })

    if (existing) {
      throw new AppError('Bookmark already exists', 400)
    }

    const bookmark = await prisma.bookmark.create({
      data: validated,
      include: {
        resource: {
          include: {
            topic: true,
          },
        },
      },
    })

    return bookmark
  },

  async deleteBookmark(userId: string, resourceId: string) {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
    })

    if (!bookmark) {
      throw new AppError('Bookmark not found', 404)
    }

    await prisma.bookmark.delete({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
    })

    return { success: true }
  },

  async getUserBookmarks(userId: string) {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        resource: {
          include: {
            topic: {
              include: {
                phase: {
                  include: {
                    track: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return bookmarks
  },

  async updateBookmarkNote(
    userId: string,
    resourceId: string,
    note: string
  ) {
    const bookmark = await prisma.bookmark.update({
      where: {
        userId_resourceId: {
          userId,
          resourceId,
        },
      },
      data: { note },
    })

    return bookmark
  },
}
