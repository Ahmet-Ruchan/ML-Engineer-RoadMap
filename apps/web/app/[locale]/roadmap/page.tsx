import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/navigation'

interface Track {
  id: string
  slug: string
  titleEn: string
  titleTr: string
  descriptionEn?: string
  descriptionTr?: string
  phases: {
    id: string
    slug: string
    titleEn: string
    titleTr: string
    durationMonths: number
    _count: {
      topics: number
    }
  }[]
}

async function getTracks(): Promise<Track[]> {
  try {
    const res = await fetch('http://localhost:3000/api/tracks', {
      cache: 'no-store'
    })

    if (!res.ok) {
      throw new Error('Failed to fetch tracks')
    }

    const data = await res.json()
    return data.success ? data.data : []
  } catch (error) {
    console.error('Error fetching tracks:', error)
    return []
  }
}

export default async function RoadmapPage() {
  const t = useTranslations()
  const locale = useLocale()
  const tracks = await getTracks()

  const trackColors: Record<string, string> = {
    ml: 'bg-blue-500',
    ai: 'bg-purple-500',
    cs: 'bg-green-500',
    se: 'bg-orange-500',
    ds: 'bg-pink-500',
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('roadmap.title')}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t('roadmap.subtitle')}
          </p>
        </div>

        {tracks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {tracks.map((track) => {
              const title = locale === 'tr' ? track.titleTr : track.titleEn
              const description = locale === 'tr' ? track.descriptionTr : track.descriptionEn
              const totalTopics = track.phases.reduce((sum, phase) => sum + phase._count.topics, 0)
              const totalDuration = track.phases.reduce((sum, phase) => sum + phase.durationMonths, 0)

              return (
                <Card key={track.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${trackColors[track.slug] || 'bg-gray-500'}`} />
                      <CardTitle className="text-2xl">{title}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {description || `Comprehensive learning path for ${title}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="secondary">
                        {track.phases.length} {t('roadmap.phases')}
                      </Badge>
                      <Badge variant="secondary">
                        {totalTopics} {t('roadmap.topics')}
                      </Badge>
                      <Badge variant="outline">
                        {totalDuration} {t('roadmap.months')}
                      </Badge>
                    </div>

                    {track.phases.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {track.phases.map((phase) => {
                          const phaseTitle = locale === 'tr' ? phase.titleTr : phase.titleEn
                          return (
                            <div key={phase.id} className="text-sm text-muted-foreground">
                              • {phaseTitle} ({phase._count.topics} {t('roadmap.topics').toLowerCase()})
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <Button asChild className="w-full">
                      <Link href={`/roadmap/${track.slug}`}>
                        {t('roadmap.start_learning')}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
