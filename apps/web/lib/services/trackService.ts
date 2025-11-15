import { prisma } from '@/lib/db'
import { AppError } from '@/lib/utils/errors'

export const trackService = {
  async getAllTracks() {
    const tracks = await prisma.track.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            _count: {
              select: { topics: true },
            },
          },
        },
      },
    })

    return tracks
  },

  async getTrack(slug: string) {
    const track = await prisma.track.findUnique({
      where: { slug },
      include: {
        phases: {
          orderBy: { order: 'asc' },
          include: {
            topics: {
              orderBy: { order: 'asc' },
              include: {
                resources: true,
                quizzes: true,
              },
            },
          },
        },
      },
    })

    if (!track) {
      throw new AppError('Track not found', 404)
    }

    return track
  },

  async getPhase(trackSlug: string, phaseSlug: string) {
    const phase = await prisma.phase.findFirst({
      where: {
        slug: phaseSlug,
        track: {
          slug: trackSlug,
        },
      },
      include: {
        track: true,
        topics: {
          orderBy: { order: 'asc' },
          include: {
            resources: true,
            quizzes: {
              where: { isActive: true },
            },
          },
        },
      },
    })

    if (!phase) {
      throw new AppError('Phase not found', 404)
    }

    return phase
  },

  async getTopic(phaseId: string, topicSlug: string) {
    const topic = await prisma.topic.findFirst({
      where: {
        slug: topicSlug,
        phaseId,
      },
      include: {
        phase: {
          include: {
            track: true,
          },
        },
        resources: {
          orderBy: { order: 'asc' },
        },
        quizzes: {
          where: { isActive: true },
          include: {
            _count: {
              select: { questions: true },
            },
          },
        },
      },
    })

    if (!topic) {
      throw new AppError('Topic not found', 404)
    }

    return topic
  },
}
