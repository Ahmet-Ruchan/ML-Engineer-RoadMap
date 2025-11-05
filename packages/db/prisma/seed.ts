import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    await prisma.quiz_answer.deleteMany()
    await prisma.quiz_attempt.deleteMany()
    await prisma.choice.deleteMany()
    await prisma.question.deleteMany()
    await prisma.quiz.deleteMany()
    await prisma.progress_item.deleteMany()
    await prisma.bookmark.deleteMany()
    await prisma.resource.deleteMany()
    await prisma.topic.deleteMany()
    await prisma.phase.deleteMany()
    await prisma.profiles.deleteMany()
    await prisma.users.deleteMany()
    console.log('✅ Cleaned existing data')
  }

  // Create sample admin user
  const adminUser = await prisma.users.create({
    data: {
      email: 'admin@ml-roadmap.com',
      profile: {
        create: {
          full_name: 'Admin User',
          role: 'admin',
        },
      },
    },
  })
  console.log('✅ Created admin user:', adminUser.email)

  // Create sample student user
  const studentUser = await prisma.users.create({
    data: {
      email: 'student@ml-roadmap.com',
      profile: {
        create: {
          full_name: 'Test Student',
          role: 'student',
        },
      },
    },
  })
  console.log('✅ Created student user:', studentUser.email)

  // Phase 1: Python & Math Foundations
  const phase1 = await prisma.phase.create({
    data: {
      title: 'Phase 1: Python & Math Foundations',
      slug: 'phase-1-foundations',
      description: 'Build strong fundamentals in Python programming and mathematics required for machine learning.',
      order: 1,
      difficulty: 'beginner',
      duration: 90,
      mdx_path: 'ml/phase-1-foundations',
      published: true,
    },
  })

  // Phase 2: Data Manipulation & Analysis
  const phase2 = await prisma.phase.create({
    data: {
      title: 'Phase 2: Data Manipulation & Analysis',
      slug: 'phase-2-data-manipulation',
      description: 'Master data manipulation with NumPy, Pandas, and data visualization libraries.',
      order: 2,
      difficulty: 'beginner',
      duration: 90,
      mdx_path: 'ml/phase-2-data-manipulation',
      published: true,
    },
  })

  // Phase 3: Machine Learning Foundations
  const phase3 = await prisma.phase.create({
    data: {
      title: 'Phase 3: Machine Learning Foundations',
      slug: 'phase-3-ml-foundations',
      description: 'Learn core machine learning algorithms and implement them using Scikit-learn.',
      order: 3,
      difficulty: 'intermediate',
      duration: 90,
      mdx_path: 'ml/phase-3-ml-foundations',
      published: true,
    },
  })

  console.log('✅ Created 3 phases')

  // Topics for Phase 1
  const topic1_1 = await prisma.topic.create({
    data: {
      phase_id: phase1.id,
      title: 'Python Basics',
      slug: 'python-basics',
      description: 'Learn Python fundamentals: variables, data types, control flow, and functions.',
      mdx_path: 'ml/python-basics',
      order: 1,
      estimated_time: 240,
      published: true,
    },
  })

  const topic1_2 = await prisma.topic.create({
    data: {
      phase_id: phase1.id,
      title: 'Linear Algebra',
      slug: 'linear-algebra',
      description: 'Understand vectors, matrices, and linear transformations essential for ML.',
      mdx_path: 'ml/linear-algebra',
      order: 2,
      estimated_time: 360,
      published: true,
    },
  })

  const topic1_3 = await prisma.topic.create({
    data: {
      phase_id: phase1.id,
      title: 'Calculus for ML',
      slug: 'calculus',
      description: 'Learn derivatives, gradients, and optimization concepts.',
      mdx_path: 'ml/calculus',
      order: 3,
      estimated_time: 300,
      published: true,
    },
  })

  // Topics for Phase 2
  const topic2_1 = await prisma.topic.create({
    data: {
      phase_id: phase2.id,
      title: 'NumPy Fundamentals',
      slug: 'numpy-fundamentals',
      description: 'Master NumPy arrays, operations, and numerical computing.',
      mdx_path: 'ml/numpy-fundamentals',
      order: 1,
      estimated_time: 180,
      published: true,
    },
  })

  const topic2_2 = await prisma.topic.create({
    data: {
      phase_id: phase2.id,
      title: 'Pandas for Data Analysis',
      slug: 'pandas-data-analysis',
      description: 'Learn data manipulation, cleaning, and analysis with Pandas.',
      mdx_path: 'ml/pandas-data-analysis',
      order: 2,
      estimated_time: 240,
      published: true,
    },
  })

  // Topics for Phase 3
  const topic3_1 = await prisma.topic.create({
    data: {
      phase_id: phase3.id,
      title: 'Linear Regression',
      slug: 'linear-regression',
      description: 'Understand and implement linear regression from scratch.',
      mdx_path: 'ml/linear-regression',
      order: 1,
      estimated_time: 180,
      published: true,
    },
  })

  console.log('✅ Created 6 topics')

  // Add resources for Python Basics
  await prisma.resource.createMany({
    data: [
      {
        topic_id: topic1_1.id,
        title: 'Python Official Documentation',
        description: 'Comprehensive Python documentation and tutorials.',
        type: 'link',
        url: 'https://docs.python.org/3/',
        order: 1,
        published: true,
      },
      {
        topic_id: topic1_1.id,
        title: 'Automate the Boring Stuff with Python',
        description: 'Free online book for Python beginners.',
        type: 'book',
        url: 'https://automatetheboringstuff.com/',
        order: 2,
        published: true,
      },
    ],
  })

  // Add resources for Linear Algebra
  await prisma.resource.createMany({
    data: [
      {
        topic_id: topic1_2.id,
        title: 'MIT Linear Algebra Course',
        description: 'Gilbert Strang\'s legendary linear algebra lectures.',
        type: 'video',
        url: 'https://ocw.mit.edu/courses/mathematics/18-06-linear-algebra-spring-2010/',
        order: 1,
        published: true,
      },
      {
        topic_id: topic1_2.id,
        title: '3Blue1Brown - Essence of Linear Algebra',
        description: 'Visual and intuitive introduction to linear algebra.',
        type: 'video',
        url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
        order: 2,
        published: true,
      },
    ],
  })

  console.log('✅ Created sample resources')

  // Create a sample quiz for Python Basics
  const quiz1 = await prisma.quiz.create({
    data: {
      topic_id: topic1_1.id,
      title: 'Python Basics Quiz',
      description: 'Test your understanding of Python fundamentals.',
      pass_score: 70,
      time_limit: 15,
      published: true,
    },
  })

  // Question 1
  const q1 = await prisma.question.create({
    data: {
      quiz_id: quiz1.id,
      question_text: 'What is the correct way to create a variable in Python?',
      explanation: 'In Python, you create variables by simply assigning a value with the = operator. No type declaration is needed.',
      order: 1,
    },
  })

  await prisma.choice.createMany({
    data: [
      {
        question_id: q1.id,
        choice_text: 'x = 10',
        is_correct: true,
        order: 1,
      },
      {
        question_id: q1.id,
        choice_text: 'int x = 10',
        is_correct: false,
        order: 2,
      },
      {
        question_id: q1.id,
        choice_text: 'var x = 10',
        is_correct: false,
        order: 3,
      },
      {
        question_id: q1.id,
        choice_text: 'let x = 10',
        is_correct: false,
        order: 4,
      },
    ],
  })

  // Question 2
  const q2 = await prisma.question.create({
    data: {
      quiz_id: quiz1.id,
      question_text: 'Which data structure is ordered and changeable in Python?',
      explanation: 'Lists are ordered, changeable, and allow duplicate values. They are one of the most commonly used data structures in Python.',
      order: 2,
    },
  })

  await prisma.choice.createMany({
    data: [
      {
        question_id: q2.id,
        choice_text: 'Tuple',
        is_correct: false,
        order: 1,
      },
      {
        question_id: q2.id,
        choice_text: 'Set',
        is_correct: false,
        order: 2,
      },
      {
        question_id: q2.id,
        choice_text: 'List',
        is_correct: true,
        order: 3,
      },
      {
        question_id: q2.id,
        choice_text: 'Dictionary',
        is_correct: false,
        order: 4,
      },
    ],
  })

  console.log('✅ Created sample quiz with 2 questions')

  // Create sample progress for student user
  await prisma.progress_item.createMany({
    data: [
      {
        user_id: studentUser.id,
        topic_id: topic1_1.id,
        status: 'completed',
        started_at: new Date('2024-01-01'),
        completed_at: new Date('2024-01-05'),
      },
      {
        user_id: studentUser.id,
        topic_id: topic1_2.id,
        status: 'in_progress',
        started_at: new Date('2024-01-06'),
      },
      {
        user_id: studentUser.id,
        topic_id: topic1_3.id,
        status: 'planned',
      },
    ],
  })

  console.log('✅ Created sample progress items')

  // Create sample bookmark
  await prisma.bookmark.create({
    data: {
      user_id: studentUser.id,
      topic_id: topic2_1.id,
    },
  })

  console.log('✅ Created sample bookmark')

  console.log('🎉 Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

