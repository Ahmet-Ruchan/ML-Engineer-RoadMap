import { prisma } from '@/lib/db/prismaClient'
import { AppError } from '@/lib/utils/errors'
import { updateProgressSchema } from '@/lib/utils/validators'

export const ProgressService = {
  /**
   * Update or create user progress for a topic
   */
  async updateProgress(userId: string, data: unknown) {
    // Validate input
    const validated = updateProgressSchema.parse(data)
    
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
    
    // Get existing progress
    const existing = await prisma.progress_item.findUnique({
      where: {
        user_id_topic_id: {
          user_id: userId,
          topic_id: validated.topicId,
        },
      },
    })
    
    // Update or create progress
    const progress = await prisma.progress_item.upsert({
      where: {
        user_id_topic_id: {
          user_id: userId,
          topic_id: validated.topicId,
        },
      },
      update: {
        status: validated.status,
        ...(validated.status === 'in_progress' && !existing?.started_at && {
          started_at: new Date(),
        }),
        ...(validated.status === 'completed' && {
          completed_at: new Date(),
        }),
      },
      create: {
        user_id: userId,
        topic_id: validated.topicId,
        status: validated.status,
        ...(validated.status === 'in_progress' && {
          started_at: new Date(),
        }),
        ...(validated.status === 'completed' && {
          completed_at: new Date(),
        }),
      },
      include: {
        topic: {
          include: {
            phase: true,
          },
        },
      },
    })
    
    return progress
  },
  
  /**
   * Get user progress for all topics or a specific phase
   */
  async getUserProgress(userId: string, phaseId?: string) {
    return prisma.progress_item.findMany({
      where: {
        user_id: userId,
        ...(phaseId && {
          topic: {
            phase_id: phaseId,
          },
        }),
      },
      include: {
        topic: {
          include: {
            phase: true,
          },
        },
      },
      orderBy: {
        updated_at: 'desc',
      },
    })
  },
  
  /**
   * Get progress statistics for a user
   */
  async getProgressStats(userId: string) {
    const total = await prisma.topic.count({ 
      where: { published: true } 
    })
    
    const completed = await prisma.progress_item.count({
      where: {
        user_id: userId,
        status: 'completed',
      },
    })
    
    const inProgress = await prisma.progress_item.count({
      where: {
        user_id: userId,
        status: 'in_progress',
      },
    })
    
    const planned = await prisma.progress_item.count({
      where: {
        user_id: userId,
        status: 'planned',
      },
    })
    
    return {
      total,
      completed,
      inProgress,
      planned,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    }
  },
  
  /**
   * Get progress for a specific topic
   */
  async getTopicProgress(userId: string, topicId: string) {
    return prisma.progress_item.findUnique({
      where: {
        user_id_topic_id: {
          user_id: userId,
          topic_id: topicId,
        },
      },
      include: {
        topic: true,
      },
    })
  },
}

