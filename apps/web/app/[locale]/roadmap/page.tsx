import { useTranslations } from 'next-intl'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function RoadmapPage() {
  const t = useTranslations()

  const tracks = [
    { slug: 'ml', title: t('tracks.ml'), color: 'bg-blue-500' },
    { slug: 'ai', title: t('tracks.ai'), color: 'bg-purple-500' },
    { slug: 'cs', title: t('tracks.cs'), color: 'bg-green-500' },
    { slug: 'se', title: t('tracks.se'), color: 'bg-orange-500' },
    { slug: 'ds', title: t('tracks.ds'), color: 'bg-pink-500' },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{t('roadmap.title')}</h1>
        <p className="text-lg text-muted-foreground mb-12">
          {t('roadmap.subtitle')}
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {tracks.map((track) => (
            <Card key={track.slug} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${track.color}`} />
                  <CardTitle>{track.title}</CardTitle>
                </div>
                <CardDescription>
                  Comprehensive learning path for {track.title}
                </CardDescription>
                <div className="mt-4">
                  <Badge variant="outline">6 Phases</Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
