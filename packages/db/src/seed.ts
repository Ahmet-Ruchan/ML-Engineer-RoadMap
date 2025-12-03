import { prisma } from './index'

async function main() {
  console.log('🌱 Seeding database...')

  // Create tracks
  const mlTrack = await prisma.track.upsert({
    where: { slug: 'ml' },
    update: {},
    create: {
      slug: 'ml',
      titleEn: 'Machine Learning Engineer',
      titleTr: 'Makine Öğrenmesi Mühendisi',
      descriptionEn: 'Comprehensive path to become a Machine Learning Engineer',
      descriptionTr: 'Makine Öğrenmesi Mühendisi olmak için kapsamlı yol haritası',
      order: 1,
      isActive: true,
    },
  })

  const aiTrack = await prisma.track.upsert({
    where: { slug: 'ai' },
    update: {},
    create: {
      slug: 'ai',
      titleEn: 'AI Engineer',
      titleTr: 'Yapay Zeka Mühendisi',
      descriptionEn: 'Become an expert in Artificial Intelligence',
      descriptionTr: 'Yapay Zeka alanında uzman ol',
      order: 2,
      isActive: true,
    },
  })

  console.log('✅ Tracks created')

  // Create phases for ML track
  const phase1 = await prisma.phase.create({
    data: {
      trackId: mlTrack.id,
      slug: 'phase-1',
      titleEn: 'Foundation (0-3 Months)',
      titleTr: 'Temel (0-3 Ay)',
      descriptionEn: 'Build strong fundamentals in programming and mathematics',
      descriptionTr: 'Programlama ve matematikte güçlü temeller oluşturun',
      durationMonths: 3,
      order: 1,
    },
  })

  console.log('✅ Phases created')

  // Create sample topic
  await prisma.topic.create({
    data: {
      phaseId: phase1.id,
      slug: 'python-basics',
      titleEn: 'Python Programming Basics',
      titleTr: 'Python Programlama Temelleri',
      descriptionEn: 'Learn Python fundamentals',
      descriptionTr: 'Python temellerini öğren',
      difficulty: 'beginner',
      estimatedHours: 40,
      order: 1,
    },
  })

  console.log('✅ Topics created')

  // Create sample badges
  await prisma.badge.create({
    data: {
      slug: 'first-quiz',
      nameEn: 'Quiz Master',
      nameTr: 'Quiz Ustası',
      descriptionEn: 'Complete your first quiz',
      descriptionTr: 'İlk quiz\'ini tamamla',
      criteria: JSON.stringify({ type: 'quiz_completed', count: 1 }),
      points: 10,
    },
  })

  console.log('✅ Badges created')
  console.log('🎉 Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
