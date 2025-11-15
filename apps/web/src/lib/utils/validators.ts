import { z } from 'zod'

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
})

// Progress schemas
export const updateProgressSchema = z.object({
  topicId: z.string().uuid('Invalid topic ID'),
  status: z.enum(['planned', 'in_progress', 'completed']),
})

// Bookmark schemas
export const createBookmarkSchema = z.object({
  topicId: z.string().uuid('Invalid topic ID'),
})

// Quiz schemas
export const submitQuizSchema = z.object({
  quizId: z.string().uuid('Invalid quiz ID'),
  answers: z.array(z.object({
    questionId: z.string().uuid('Invalid question ID'),
    choiceId: z.string().uuid('Invalid choice ID'),
  })),
})

// Admin schemas
export const createPhaseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  description: z.string().optional(),
  order: z.number().int().positive(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().int().positive().optional(),
  mdxPath: z.string().optional(),
  published: z.boolean().default(false),
})

export const updatePhaseSchema = createPhaseSchema.partial()

export const createTopicSchema = z.object({
  phaseId: z.string().uuid('Invalid phase ID'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  description: z.string().optional(),
  mdxPath: z.string().optional(),
  order: z.number().int().positive(),
  estimatedTime: z.number().int().positive().optional(),
  published: z.boolean().default(false),
})

export const updateTopicSchema = createTopicSchema.partial().omit({ phaseId: true })

export const createResourceSchema = z.object({
  topicId: z.string().uuid('Invalid topic ID'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  type: z.enum(['pdf', 'link', 'video', 'book']),
  url: z.string().url().optional(),
  filePath: z.string().optional(),
  fileSize: z.number().int().positive().optional(),
  license: z.string().optional(),
  order: z.number().int().default(0),
  published: z.boolean().default(false),
})

export const updateResourceSchema = createResourceSchema.partial().omit({ topicId: true })

