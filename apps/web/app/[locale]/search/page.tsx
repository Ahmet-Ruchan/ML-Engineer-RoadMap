'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/navigation'

interface Topic {
  id: string
  slug: string
  titleEn: string
  titleTr: string
  descriptionEn?: string
  descriptionTr?: string
  difficulty?: string
  phase: {
    slug: string
    titleEn: string
    titleTr: string
    track: {
      slug: string
      titleEn: string
      titleTr: string
    }
  }
}

interface Resource {
  id: string
  titleEn: string
  titleTr: string
  type: string
  url: string
  topic: {
    slug: string
    titleEn: string
    titleTr: string
    phase: {
      slug: string
      track: {
        slug: string
      }
    }
  }
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const locale = useLocale()
  const t = useTranslations()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [topics, setTopics] = useState<Topic[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      performSearch(q)
    }
  }, [searchParams])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) return

    setLoading(true)
    setSearched(true)

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()

      if (data.success) {
        setTopics(data.data.topics)
        setResources(data.data.resources)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(query)}`)
      performSearch(query)
    }
  }

  const resourceTypeIcons: Record<string, string> = {
    video: '🎥',
    article: '📄',
    book: '📚',
    course: '🎓',
    documentation: '📖',
    tutorial: '💻',
    tool: '🔧'
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('search.title')}</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="flex-1 p-3 border rounded-lg"
            />
            <Button type="submit" disabled={loading || query.trim().length < 2}>
              {loading ? t('search.searching') : t('search.button')}
            </Button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-muted-foreground">{t('search.searching')}</div>
          </div>
        ) : searched ? (
          <>
            {/* Topics */}
            {topics.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{t('search.topics')} ({topics.length})</h2>
                <div className="space-y-4">
                  {topics.map((topic) => {
                    const title = locale === 'tr' ? topic.titleTr : topic.titleEn
                    const description = locale === 'tr' ? topic.descriptionTr : topic.descriptionEn
                    const trackTitle = locale === 'tr' ? topic.phase.track.titleTr : topic.phase.track.titleEn
                    const phaseTitle = locale === 'tr' ? topic.phase.titleTr : topic.phase.titleEn

                    return (
                      <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <h3 className="text-xl font-semibold mb-2">{title}</h3>
                          {description && (
                            <p className="text-muted-foreground mb-3">{description}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge variant="secondary">{trackTitle}</Badge>
                            <Badge variant="outline">{phaseTitle}</Badge>
                            {topic.difficulty && (
                              <Badge variant="outline">{topic.difficulty}</Badge>
                            )}
                          </div>
                          <Button asChild size="sm">
                            <Link
                              href={`/roadmap/${topic.phase.track.slug}/${topic.phase.slug}/${topic.slug}`}
                            >
                              {t('search.view_topic')}
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Resources */}
            {resources.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4">{t('search.resources')} ({resources.length})</h2>
                <div className="space-y-4">
                  {resources.map((resource) => {
                    const title = locale === 'tr' ? resource.titleTr : resource.titleEn
                    const topicTitle = locale === 'tr' ? resource.topic.titleTr : resource.topic.titleEn

                    return (
                      <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="text-3xl">
                              {resourceTypeIcons[resource.type.toLowerCase()] || '📄'}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-2">{title}</h3>
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge variant="secondary">{topicTitle}</Badge>
                                <Badge variant="outline">{resource.type}</Badge>
                              </div>
                              <Button asChild size="sm">
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                  {t('search.view_resource')} →
                                </a>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* No Results */}
            {topics.length === 0 && resources.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">{t('search.no_results')}</h3>
                  <p className="text-muted-foreground">
                    {t('search.no_results_description')}
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">🔎</div>
              <h3 className="text-xl font-semibold mb-2">{t('search.start_searching')}</h3>
              <p className="text-muted-foreground">
                {t('search.start_description')}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
