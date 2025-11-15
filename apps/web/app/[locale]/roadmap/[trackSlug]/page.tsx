import { useTranslations, useLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/navigation'

interface Topic {
  id: string
  slug: string
  titleEn: string
  titleTr: string
  descriptionEn?: string
  descriptionTr?: string
  order: number
  estimatedHours?: number
  difficulty?: string
  resources: any[]
  quizzes?: any[]
  _count: {
    resources: number
  }
}

interface Phase {
  id: string
  slug: string
  titleEn: string
  titleTr: string
  descriptionEn?: string
  descriptionTr?: string
  order: number
  durationMonths: number
  topics: Topic[]
  _count: {
    topics: number
  }
}

interface Track {
  id: string
  slug: string
  titleEn: string
  titleTr: string
  descriptionEn?: string
  descriptionTr?: string
  phases: Phase[]
  _count: {
    phases: number
  }
}

async function getTrack(slug: string): Promise<Track | null> {
  try {
    const res = await fetch(`http://localhost:3000/api/tracks/${slug}`, {
      cache: 'no-store'
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    return data.success ? data.data : null
  } catch (error) {
    console.error('Error fetching track:', error)
    return null
  }
}

export default async function TrackDetailPage({
  params
}: {
  params: { trackSlug: string }
}) {
  const t = useTranslations()
  const locale = useLocale()
  const track = await getTrack(params.trackSlug)

  if (!track) {
    notFound()
  }

  const title = locale === 'tr' ? track.titleTr : track.titleEn
  const description = locale === 'tr' ? track.descriptionTr : track.descriptionEn
  const totalTopics = track.phases.reduce((sum, phase) => sum + phase._count.topics, 0)
  const totalDuration = track.phases.reduce((sum, phase) => sum + phase.durationMonths, 0)

  const trackColors: Record<string, string> = {
    ml: 'bg-blue-500',
    ai: 'bg-purple-500',
    cs: 'bg-green-500',
    se: 'bg-orange-500',
    ds: 'bg-pink-500',
  }

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-4 h-4 rounded-full ${trackColors[track.slug] || 'bg-gray-500'}`} />
            <h1 className="text-4xl md:text-5xl font-bold">{title}</h1>
          </div>

          {description && (
            <p className="text-xl text-muted-foreground mb-6">{description}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="text-base py-2 px-4">
              {track._count.phases} {t('roadmap.phases')}
            </Badge>
            <Badge variant="secondary" className="text-base py-2 px-4">
              {totalTopics} {t('roadmap.topics')}
            </Badge>
            <Badge variant="outline" className="text-base py-2 px-4">
              {totalDuration} {t('roadmap.months')}
            </Badge>
          </div>
        </div>

        {/* Progress Overview - Placeholder */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>{t('trackDetail.your_progress')}</CardTitle>
            <CardDescription>{t('trackDetail.not_started')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
              <div className="bg-blue-600 h-3 rounded-full" style={{ width: '0%' }}></div>
            </div>
            <p className="text-sm text-muted-foreground">
              0 / {totalTopics} {t('roadmap.topics').toLowerCase()} {t('status.completed').toLowerCase()}
            </p>
          </CardContent>
        </Card>

        {/* Learning Path Timeline */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">{t('trackDetail.learning_path')}</h2>

          <div className="space-y-8">
            {track.phases.map((phase, phaseIndex) => {
              const phaseTitle = locale === 'tr' ? phase.titleTr : phase.titleEn
              const phaseDescription = locale === 'tr' ? phase.descriptionTr : phase.descriptionEn

              return (
                <div key={phase.id} className="relative">
                  {/* Phase Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full ${trackColors[track.slug] || 'bg-gray-500'} flex items-center justify-center text-white font-bold text-lg`}>
                        {phaseIndex + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{phaseTitle}</h3>
                      {phaseDescription && (
                        <p className="text-muted-foreground mb-2">{phaseDescription}</p>
                      )}
                      <div className="flex gap-2">
                        <Badge variant="outline">
                          {phase.durationMonths} {t('roadmap.months')}
                        </Badge>
                        <Badge variant="outline">
                          {phase._count.topics} {t('roadmap.topics')}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Topics Grid */}
                  <div className="ml-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {phase.topics.map((topic) => {
                      const topicTitle = locale === 'tr' ? topic.titleTr : topic.titleEn
                      const topicDescription = locale === 'tr' ? topic.descriptionTr : topic.descriptionEn

                      return (
                        <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between mb-2">
                              <CardTitle className="text-lg flex-1">{topicTitle}</CardTitle>
                              {topic.difficulty && (
                                <Badge
                                  variant="secondary"
                                  className={difficultyColors[topic.difficulty.toLowerCase()] || ''}
                                >
                                  {t(`trackDetail.${topic.difficulty.toLowerCase()}`)}
                                </Badge>
                              )}
                            </div>
                            <CardDescription className="line-clamp-2">
                              {topicDescription || 'Learn the fundamentals and practical applications'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {topic.estimatedHours && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>⏱️</span>
                                  <span>{topic.estimatedHours}h</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>📚</span>
                                <span>{topic._count.resources} {t('trackDetail.resources')}</span>
                              </div>

                              {topic.quizzes && topic.quizzes.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <span>✅</span>
                                  <span>{t('trackDetail.quiz')}</span>
                                </div>
                              )}

                              <Button asChild className="w-full mt-2">
                                <Link href={`/roadmap/${track.slug}/${phase.slug}/${topic.slug}`}>
                                  {t('trackDetail.start_topic')}
                                </Link>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Connector Line */}
                  {phaseIndex < track.phases.length - 1 && (
                    <div className="ml-6 w-0.5 h-8 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-600 dark:to-gray-700 my-4"></div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
