'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Resource {
  id: string
  titleEn: string
  titleTr: string
  descriptionEn?: string
  descriptionTr?: string
  type: string
  url: string
  duration?: number
  topic: {
    titleEn: string
    titleTr: string
    phase: {
      titleEn: string
      titleTr: string
      track: {
        titleEn: string
        titleTr: string
      }
    }
  }
}

export default function ResourcesPage() {
  const t = useTranslations()
  const locale = useLocale()
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources')
      const data = await res.json()
      if (data.success) {
        setResources(data.data)
      }
    } catch (error) {
      console.error('Error fetching resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const resourceTypeIcons: Record<string, string> = {
    video: '🎥',
    article: '📄',
    book: '📚',
    course: '🎓',
    documentation: '📖',
    tutorial: '💻',
    tool: '🔧',
  }

  const types = ['all', ...Array.from(new Set(resources.map(r => r.type)))]

  const filteredResources = filter === 'all'
    ? resources
    : resources.filter(r => r.type === filter)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">Loading resources...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{t('nav.resources')}</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Curated learning resources for your ML journey
        </p>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {types.map(type => (
            <Button
              key={type}
              onClick={() => setFilter(type)}
              variant={filter === type ? 'default' : 'outline'}
              size="sm"
            >
              {type === 'all' ? 'All Resources' : type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="grid gap-4">
          {filteredResources.map(resource => {
            const title = locale === 'tr' ? resource.titleTr : resource.titleEn
            const description = locale === 'tr' ? resource.descriptionTr : resource.descriptionEn
            const topicTitle = locale === 'tr' ? resource.topic.titleTr : resource.topic.titleEn
            const phaseTitle = locale === 'tr' ? resource.topic.phase.titleTr : resource.topic.phase.titleEn
            const trackTitle = locale === 'tr' ? resource.topic.phase.track.titleTr : resource.topic.phase.track.titleEn

            return (
              <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="text-4xl flex-shrink-0">
                      {resourceTypeIcons[resource.type.toLowerCase()] || '📄'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold mb-2">{title}</h3>
                      {description && (
                        <p className="text-muted-foreground mb-3">{description}</p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="secondary">{trackTitle}</Badge>
                        <Badge variant="outline">{phaseTitle}</Badge>
                        <Badge variant="outline">{topicTitle}</Badge>
                        <Badge variant="outline">{resource.type}</Badge>
                        {resource.duration && (
                          <Badge variant="outline">{resource.duration} min</Badge>
                        )}
                      </div>
                      <Button asChild size="sm">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          View Resource →
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No resources found
          </div>
        )}
      </div>
    </div>
  )
}
