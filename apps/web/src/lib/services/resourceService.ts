import { prisma } from '@/lib/db/prismaClient'
import { AppError } from '@/lib/utils/errors'

export const ResourceService = {
  /**
   * Get all published resources with optional filtering
   */
  async getResources(filters?: {
    type?: string
    topicId?: string
    search?: string
  }) {
    return prisma.resource.findMany({
      where: {
        published: true,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.topicId && { topic_id: filters.topicId }),
        ...(filters?.search && {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        topic: {
          include: {
            phase: true,
          },
        },
      },
      orderBy: [
        { order: 'asc' },
        { created_at: 'desc' },
      ],
    })
  },
  
  /**
   * Get a single resource
   */
  async getResource(resourceId: string) {
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        topic: {
          include: {
            phase: true,
          },
        },
      },
    })
    
    if (!resource) {
      throw new AppError('Resource not found', 404)
    }
    
    if (!resource.published) {
      throw new AppError('Resource is not published', 403)
    }
    
    return resource
  },
  
  /**
   * Get resources for a specific topic
   */
  async getTopicResources(topicId: string) {
    // Check if topic exists and is published
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
    })
    
    if (!topic) {
      throw new AppError('Topic not found', 404)
    }
    
    if (!topic.published) {
      throw new AppError('Topic is not published', 403)
    }
    
    return prisma.resource.findMany({
      where: {
        topic_id: topicId,
        published: true,
      },
      orderBy: {
        order: 'asc',
      },
    })
  },
}

