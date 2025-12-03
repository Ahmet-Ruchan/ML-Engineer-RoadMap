import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clean existing data (in development only)
  if (process.env.NODE_ENV !== 'production') {
    await prisma.quizAnswer.deleteMany()
    await prisma.quizAttempt.deleteMany()
    await prisma.choice.deleteMany()
    await prisma.question.deleteMany()
    await prisma.quiz.deleteMany()
    await prisma.userBadge.deleteMany()
    await prisma.badge.deleteMany()
    await prisma.note.deleteMany()
    await prisma.bookmark.deleteMany()
    await prisma.progressItem.deleteMany()
    await prisma.resource.deleteMany()
    await prisma.topic.deleteMany()
    await prisma.phase.deleteMany()
    await prisma.track.deleteMany()
    await prisma.profile.deleteMany()
    await prisma.session.deleteMany()
    await prisma.account.deleteMany()
    await prisma.user.deleteMany()
    console.log('✅ Cleaned existing data')
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@ml-roadmap.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'admin',
      profile: {
        create: {
          preferredLanguage: 'en',
          level: 10,
          experiencePoints: 5000,
        },
      },
    },
  })
  console.log('✅ Created admin user:', adminUser.email, '(password: admin123)')

  // Create ML Engineer Track
  const mlTrack = await prisma.track.create({
    data: {
      slug: 'ml',
      titleEn: 'Machine Learning Engineer',
      titleTr: 'Makine Öğrenmesi Mühendisi',
      descriptionEn: 'Complete roadmap to become a Machine Learning Engineer',
      descriptionTr: 'Makine Öğrenmesi Mühendisi olmak için tam yol haritası',
      order: 1,
      isActive: true,
    },
  })

  // Create AI Track
  const aiTrack = await prisma.track.create({
    data: {
      slug: 'ai',
      titleEn: 'AI Engineer',
      titleTr: 'Yapay Zeka Mühendisi',
      descriptionEn: 'Become an AI Engineer with deep learning and NLP',
      descriptionTr: 'Derin öğrenme ve NLP ile Yapay Zeka Mühendisi ol',
      order: 2,
      isActive: true,
    },
  })

  // Create Data Science Track
  const dsTrack = await prisma.track.create({
    data: {
      slug: 'ds',
      titleEn: 'Data Scientist',
      titleTr: 'Veri Bilimci',
      descriptionEn: 'Master data science from basics to advanced',
      descriptionTr: 'Veri biliminde temelden ileri seviyeye',
      order: 3,
      isActive: true,
    },
  })

  console.log('✅ Created 3 tracks')

  // ML Track - Phase 1
  const mlPhase1 = await prisma.phase.create({
    data: {
      trackId: mlTrack.id,
      slug: 'phase-1',
      titleEn: 'Python & Math Foundations',
      titleTr: 'Python ve Matematik Temelleri',
      descriptionEn: 'Build strong fundamentals in Python and mathematics',
      descriptionTr: 'Python ve matematikte güçlü temel oluştur',
      durationMonths: 2,
      order: 1,
    },
  })

  // ML Track - Phase 2
  const mlPhase2 = await prisma.phase.create({
    data: {
      trackId: mlTrack.id,
      slug: 'phase-2',
      titleEn: 'Data Analysis & Visualization',
      titleTr: 'Veri Analizi ve Görselleştirme',
      descriptionEn: 'Master data manipulation with NumPy, Pandas and visualization',
      descriptionTr: 'NumPy, Pandas ve görselleştirme ile veri manipülasyonu',
      durationMonths: 2,
      order: 2,
    },
  })

  // ML Track - Phase 3
  const mlPhase3 = await prisma.phase.create({
    data: {
      trackId: mlTrack.id,
      slug: 'phase-3',
      titleEn: 'Machine Learning Algorithms',
      titleTr: 'Makine Öğrenmesi Algoritmaları',
      descriptionEn: 'Learn core ML algorithms with Scikit-learn',
      descriptionTr: 'Scikit-learn ile temel ML algoritmaları',
      durationMonths: 3,
      order: 3,
    },
  })

  console.log('✅ Created 3 phases for ML track')

  // Topics for Phase 1
  const topic1 = await prisma.topic.create({
    data: {
      phaseId: mlPhase1.id,
      slug: 'python-basics',
      titleEn: 'Python Programming Basics',
      titleTr: 'Python Programlama Temelleri',
      descriptionEn: 'Learn Python syntax, data types, control flow, and functions',
      descriptionTr: 'Python sözdizimi, veri tipleri, akış kontrolü ve fonksiyonlar',
      contentEn: '# Python Programming Basics\n\nLearn the fundamentals of Python programming...',
      contentTr: '# Python Programlama Temelleri\n\nPython programlamanın temellerini öğren...',
      order: 1,
      estimatedHours: 40,
      difficulty: 'beginner',
    },
  })

  const topic2 = await prisma.topic.create({
    data: {
      phaseId: mlPhase1.id,
      slug: 'linear-algebra',
      titleEn: 'Linear Algebra for ML',
      titleTr: 'ML için Lineer Cebir',
      descriptionEn: 'Vectors, matrices, and linear transformations',
      descriptionTr: 'Vektörler, matrisler ve lineer dönüşümler',
      contentEn: '# Linear Algebra for ML\n\nMaster the math behind machine learning...',
      contentTr: '# ML için Lineer Cebir\n\nMakine öğrenmesinin arkasındaki matematikte uzmanlaş...',
      order: 2,
      estimatedHours: 30,
      difficulty: 'intermediate',
    },
  })

  const topic3 = await prisma.topic.create({
    data: {
      phaseId: mlPhase1.id,
      slug: 'calculus',
      titleEn: 'Calculus Fundamentals',
      titleTr: 'Kalkülüs Temelleri',
      descriptionEn: 'Derivatives, gradients, and optimization',
      descriptionTr: 'Türevler, gradyanlar ve optimizasyon',
      order: 3,
      estimatedHours: 25,
      difficulty: 'intermediate',
    },
  })

  // Topics for Phase 2
  const topic4 = await prisma.topic.create({
    data: {
      phaseId: mlPhase2.id,
      slug: 'numpy',
      titleEn: 'NumPy for Data Science',
      titleTr: 'Veri Bilimi için NumPy',
      descriptionEn: 'Array operations, broadcasting, and linear algebra with NumPy',
      descriptionTr: 'NumPy ile array işlemleri, broadcasting ve lineer cebir',
      order: 1,
      estimatedHours: 20,
      difficulty: 'beginner',
    },
  })

  const topic5 = await prisma.topic.create({
    data: {
      phaseId: mlPhase2.id,
      slug: 'pandas',
      titleEn: 'Pandas Data Manipulation',
      titleTr: 'Pandas Veri Manipülasyonu',
      descriptionEn: 'DataFrames, data cleaning, and transformation',
      descriptionTr: 'DataFrames, veri temizleme ve dönüştürme',
      order: 2,
      estimatedHours: 30,
      difficulty: 'beginner',
    },
  })

  const topic6 = await prisma.topic.create({
    data: {
      phaseId: mlPhase2.id,
      slug: 'matplotlib',
      titleEn: 'Data Visualization',
      titleTr: 'Veri Görselleştirme',
      descriptionEn: 'Create beautiful plots with Matplotlib and Seaborn',
      descriptionTr: 'Matplotlib ve Seaborn ile güzel grafikler oluştur',
      order: 3,
      estimatedHours: 15,
      difficulty: 'beginner',
    },
  })

  // Topics for Phase 3
  const topic7 = await prisma.topic.create({
    data: {
      phaseId: mlPhase3.id,
      slug: 'supervised-learning',
      titleEn: 'Supervised Learning',
      titleTr: 'Denetimli Öğrenme',
      descriptionEn: 'Linear regression, logistic regression, decision trees',
      descriptionTr: 'Lineer regresyon, lojistik regresyon, karar ağaçları',
      order: 1,
      estimatedHours: 40,
      difficulty: 'intermediate',
    },
  })

  const topic8 = await prisma.topic.create({
    data: {
      phaseId: mlPhase3.id,
      slug: 'unsupervised-learning',
      titleEn: 'Unsupervised Learning',
      titleTr: 'Denetimsiz Öğrenme',
      descriptionEn: 'Clustering, dimensionality reduction, PCA',
      descriptionTr: 'Kümeleme, boyut azaltma, PCA',
      order: 2,
      estimatedHours: 30,
      difficulty: 'intermediate',
    },
  })

  console.log('✅ Created 8 topics')

  // Resources
  const resource1 = await prisma.resource.create({
    data: {
      topicId: topic1.id,
      type: 'course',
      titleEn: 'Python for Everybody - Coursera',
      titleTr: 'Herkes için Python - Coursera',
      descriptionEn: 'Free Python course by Dr. Chuck',
      descriptionTr: 'Dr. Chuck tarafından ücretsiz Python kursu',
      url: 'https://www.coursera.org/specializations/python',
      order: 1,
    },
  })

  const resource2 = await prisma.resource.create({
    data: {
      topicId: topic1.id,
      type: 'book',
      titleEn: 'Automate the Boring Stuff with Python',
      titleTr: 'Python ile Sıkıcı İşleri Otomatikleştir',
      author: 'Al Sweigart',
      url: 'https://automatetheboringstuff.com/',
      order: 2,
    },
  })

  const resource3 = await prisma.resource.create({
    data: {
      topicId: topic5.id,
      type: 'article',
      titleEn: 'Pandas User Guide',
      titleTr: 'Pandas Kullanıcı Kılavuzu',
      url: 'https://pandas.pydata.org/docs/user_guide/index.html',
      order: 1,
    },
  })

  console.log('✅ Created 3 resources')

  // Quiz for Python Basics
  const quiz1 = await prisma.quiz.create({
    data: {
      topicId: topic1.id,
      titleEn: 'Python Basics Quiz',
      titleTr: 'Python Temelleri Quizi',
      descriptionEn: 'Test your Python fundamentals',
      descriptionTr: 'Python temellerinizi test edin',
      passingScore: 70,
      timeLimit: 30,
    },
  })

  const question1 = await prisma.question.create({
    data: {
      quizId: quiz1.id,
      questionEn: 'What is the correct way to declare a list in Python?',
      questionTr: 'Python\'da liste bildirmenin doğru yolu nedir?',
      type: 'multiple_choice',
      order: 1,
      points: 10,
    },
  })

  await prisma.choice.createMany({
    data: [
      {
        questionId: question1.id,
        choiceEn: 'list = ()',
        choiceTr: 'list = ()',
        isCorrect: false,
        order: 1,
      },
      {
        questionId: question1.id,
        choiceEn: 'list = []',
        choiceTr: 'list = []',
        isCorrect: true,
        order: 2,
      },
      {
        questionId: question1.id,
        choiceEn: 'list = {}',
        choiceTr: 'list = {}',
        isCorrect: false,
        order: 3,
      },
    ],
  })

  console.log('✅ Created quiz with questions')

  // Badges
  const badge1 = await prisma.badge.create({
    data: {
      slug: 'first-topic',
      nameEn: 'First Steps',
      nameTr: 'İlk Adımlar',
      descriptionEn: 'Completed your first topic',
      descriptionTr: 'İlk konunu tamamladın',
      criteria: JSON.stringify({ type: 'topic_completed', count: 1 }),
      points: 10,
    },
  })

  const badge2 = await prisma.badge.create({
    data: {
      slug: 'phase-complete',
      nameEn: 'Phase Master',
      nameTr: 'Faz Ustası',
      descriptionEn: 'Completed an entire phase',
      descriptionTr: 'Bir fazın tamamını bitirdin',
      criteria: JSON.stringify({ type: 'phase_completed', count: 1 }),
      points: 50,
    },
  })

  console.log('✅ Created 2 badges')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📊 Summary:')
  console.log('- 3 Tracks (ML, AI, DS)')
  console.log('- 3 Phases for ML Track')
  console.log('- 8 Topics')
  console.log('- 3 Resources')
  console.log('- 1 Quiz with questions')
  console.log('- 2 Badges')
  console.log('- 1 Admin user: admin@ml-roadmap.com (password: admin123)\n')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
