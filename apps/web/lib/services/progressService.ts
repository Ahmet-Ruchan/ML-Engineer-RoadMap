import { prisma } from '@/lib/db'
import { AppError } from '@/lib/utils/errors'
import { z } from 'zod'

const updateProgressSchema = z.object({
  userId: z.string().uuid(),
  topicId: z.string().uuid(),
  status: z.enum(['planned', 'in_progress', 'completed']),
})

export const progressService = {
  async updateProgress(data: z.infer<typeof updateProgressSchema>) {
    const validated = updateProgressSchema.parse(data)

    const progressItem = await prisma.progressItem.upsert({
      where: {
        userId_topicId: {
          userId: validated.userId,
          topicId: validated.topicId,
        },
      },
      update: {
        status: validated.status,
        completedAt:
          validated.status === 'completed' ? new Date() : null,
      },
      create: {
        userId: validated.userId,
        topicId: validated.topicId,
        status: validated.status,
        completedAt:
          validated.status === 'completed' ? new Date() : null,
      },
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
    })

    return progressItem
  },

  async getUserProgress(userId: string) {
    const progress = await prisma.progressItem.findMany({
      where: { userId },
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
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return progress
  },

  async getTopicProgress(userId: string, topicId: string) {
    const progress = await prisma.progressItem.findUnique({
      where: {
        userId_topicId: {
          userId,
          topicId,
        },
      },
    })

    return progress
  },

  async getProgressStats(userId: string) {
    const stats = await prisma.progressItem.groupBy({
      by: ['status'],
      where: { userId },
      _count: true,
    })

    return {
      planned: stats.find((s) => s.status === 'planned')?._count || 0,
      inProgress: stats.find((s) => s.status === 'in_progress')?._count || 0,
      completed: stats.find((s) => s.status === 'completed')?._count || 0,
    }
  },
}
