'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/navigation'
import { toast } from 'sonner'

interface Bookmark {
  id: string
  topic: {
    id: string
    slug: string
    titleEn: string
    titleTr: string
    descriptionEn?: string
    descriptionTr?: string
    difficulty?: string
    estimatedHours?: number
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
  createdAt: string
}

export default function BookmarksPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.push('/login')
      return
    }
    fetchBookmarks()
  }, [session, status, router])

  const fetchBookmarks = async () => {
    try {
      const res = await fetch('/api/bookmarks')
      const data = await res.json()
      if (data.success) {
        setBookmarks(data.data)
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error)
      toast.error('Failed to load bookmarks')
    } finally {
      setLoading(false)
    }
  }

  const removeBookmark = async (topicId: string) => {
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId })
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Bookmark removed')
        fetchBookmarks()
      }
    } catch (error) {
      console.error('Error removing bookmark:', error)
      toast.error('Failed to remove bookmark')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">{t('common.loading')}</div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">{t('bookmarks.title')}</h1>
        <p className="text-muted-foreground mb-8">
          {t('bookmarks.subtitle')}
        </p>

        {bookmarks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="text-6xl mb-4">🔖</div>
              <h2 className="text-2xl font-semibold mb-2">{t('bookmarks.no_bookmarks')}</h2>
              <p className="text-muted-foreground mb-6">
                {t('bookmarks.no_bookmarks_description')}
              </p>
              <Button asChild>
                <Link href="/roadmap">{t('bookmarks.browse_roadmap')}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookmarks.map((bookmark) => {
              const title = locale === 'tr' ? bookmark.topic.titleTr : bookmark.topic.titleEn
              const description = locale === 'tr' ? bookmark.topic.descriptionTr : bookmark.topic.descriptionEn
              const trackTitle = locale === 'tr' ? bookmark.topic.phase.track.titleTr : bookmark.topic.phase.track.titleEn
              const phaseTitle = locale === 'tr' ? bookmark.topic.phase.titleTr : bookmark.topic.phase.titleEn
              
              return (
                <Card key={bookmark.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{title}</h3>
                        {description && (
                          <p className="text-muted-foreground mb-3">{description}</p>
                        )}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary">{trackTitle}</Badge>
                          <Badge variant="outline">{phaseTitle}</Badge>
                          {bookmark.topic.difficulty && (
                            <Badge className={difficultyColors[bookmark.topic.difficulty.toLowerCase()]}>
                              {bookmark.topic.difficulty}
                            </Badge>
                          )}
                          {bookmark.topic.estimatedHours && (
                            <Badge variant="outline">⏱️ {bookmark.topic.estimatedHours}h</Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button asChild size="sm">
                            <Link
                              href={\`/roadmap/\${bookmark.topic.phase.track.slug}/\${bookmark.topic.phase.slug}/\${bookmark.topic.slug}\`}
                            >
                              {t('search.view_topic')}
                            </Link>
                          </Button>
                          <Button
                            onClick={() => removeBookmark(bookmark.topic.id)}
                            variant="outline"
                            size="sm"
                          >
                            {t('bookmarks.remove')}
                          </Button>
                        </div>
                      </div>
                    </div>
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
