'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/navigation'
import { toast } from 'sonner'

interface Resource {
  id: string
  titleEn: string
  titleTr: string
  descriptionEn?: string
  descriptionTr?: string
  type: string
  url: string
  duration?: number
}

interface Quiz {
  id: string
  titleEn: string
  titleTr: string
  descriptionEn?: string
  descriptionTr?: string
  questions: any[]
}

interface Topic {
  id: string
  slug: string
  titleEn: string
  titleTr: string
  descriptionEn?: string
  descriptionTr?: string
  contentEn?: string
  contentTr?: string
  difficulty?: string
  estimatedHours?: number
  resources: Resource[]
  quizzes: Quiz[]
  phase: {
    id: string
    slug: string
    titleEn: string
    titleTr: string
    track: {
      id: string
      slug: string
      titleEn: string
      titleTr: string
    }
  }
}

export default function TopicDetailPage() {
  const params = useParams()
  const t = useTranslations()
  const locale = useLocale()
  const { data: session } = useSession()

  const [topic, setTopic] = useState<Topic | null>(null)
  const [progress, setProgress] = useState<string | null>(null)
  const [bookmarked, setBookmarked] = useState(false)
  const [notes, setNotes] = useState<any[]>([])
  const [newNote, setNewNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const trackSlug = params.trackSlug as string
  const phaseSlug = params.phaseSlug as string
  const topicSlug = params.topicSlug as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch topic data
        const topicRes = await fetch(`/api/topics/${trackSlug}/${phaseSlug}/${topicSlug}`)
        const topicData = await topicRes.json()

        if (topicData.success) {
          setTopic(topicData.data)

          // Fetch user progress and bookmarks if logged in
          if (session?.user) {
            const progressRes = await fetch('/api/progress')
            const progressData = await progressRes.json()

            if (progressData.success) {
              const topicProgress = progressData.data.find(
                (p: any) => p.topicId === topicData.data.id
              )
              setProgress(topicProgress?.status || null)
            }

            // Check if bookmarked
            const bookmarksRes = await fetch('/api/bookmarks')
            const bookmarksData = await bookmarksRes.json()
            if (bookmarksData.success) {
              const isBookmarked = bookmarksData.data.some(
                (b: any) => b.topic.id === topicData.data.id
              )
              setBookmarked(isBookmarked)
            }

            // Fetch notes
            const notesRes = await fetch(`/api/notes?topicId=${topicData.data.id}`)
            const notesData = await notesRes.json()
            if (notesData.success) {
              setNotes(notesData.data)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching topic:', error)
        toast.error('Failed to load topic')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [trackSlug, phaseSlug, topicSlug, session])

  const updateProgress = async (status: string) => {
    if (!session?.user || !topic) {
      toast.error('Please log in to track your progress')
      return
    }

    setUpdating(true)
    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: topic.id,
          status,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setProgress(status)
        toast.success(
          status === 'completed'
            ? 'Topic marked as completed!'
            : status === 'in_progress'
            ? 'Topic marked as in progress'
            : 'Topic marked as planned'
        )
      } else {
        toast.error('Failed to update progress')
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('Failed to update progress')
    } finally {
      setUpdating(false)
    }
  }

  const toggleBookmark = async () => {
    if (!session?.user || !topic) {
      toast.error('Please log in to bookmark topics')
      return
    }

    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: topic.id,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setBookmarked(data.bookmarked)
        toast.success(data.bookmarked ? 'Bookmark added' : 'Bookmark removed')
      } else {
        toast.error('Failed to toggle bookmark')
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      toast.error('Failed to toggle bookmark')
    }
  }

  const addNote = async () => {
    if (!session?.user || !topic || !newNote.trim()) {
      toast.error('Please enter a note')
      return
    }

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicId: topic.id,
          content: newNote
        }),
      })

      const data = await res.json()

      if (data.success) {
        setNotes([data.data, ...notes])
        setNewNote('')
        toast.success('Note added')
      } else {
        toast.error('Failed to add note')
      }
    } catch (error) {
      console.error('Error adding note:', error)
      toast.error('Failed to add note')
    }
  }

  const deleteNote = async (noteId: string) => {
    if (!confirm('Delete this note?')) return

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE'
      })

      const data = await res.json()

      if (data.success) {
        setNotes(notes.filter(n => n.id !== noteId))
        toast.success('Note deleted')
      } else {
        toast.error('Failed to delete note')
      }
    } catch (error) {
      console.error('Error deleting note:', error)
      toast.error('Failed to delete note')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-pulse text-muted-foreground">
              Loading topic...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Topic not found</h1>
            <Button asChild>
              <Link href="/roadmap">Back to Roadmap</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const title = locale === 'tr' ? topic.titleTr : topic.titleEn
  const description = locale === 'tr' ? topic.descriptionTr : topic.descriptionEn
  const content = locale === 'tr' ? topic.contentTr : topic.contentEn

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    advanced: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  }

  const progressColors: Record<string, string> = {
    planned: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    in_progress: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/roadmap" className="hover:text-foreground">
            Roadmap
          </Link>
          <span>/</span>
          <Link
            href={`/roadmap/${topic.phase.track.slug}`}
            className="hover:text-foreground"
          >
            {locale === 'tr' ? topic.phase.track.titleTr : topic.phase.track.titleEn}
          </Link>
          <span>/</span>
          <span>{locale === 'tr' ? topic.phase.titleTr : topic.phase.titleEn}</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-4xl md:text-5xl font-bold flex-1">{title}</h1>
            {topic.difficulty && (
              <Badge
                variant="secondary"
                className={`text-base py-2 px-4 ${difficultyColors[topic.difficulty.toLowerCase()] || ''}`}
              >
                {t(`trackDetail.${topic.difficulty.toLowerCase()}`)}
              </Badge>
            )}
          </div>

          {description && (
            <p className="text-xl text-muted-foreground mb-4">{description}</p>
          )}

          <div className="flex flex-wrap gap-3 mb-6">
            {topic.estimatedHours && (
              <Badge variant="outline" className="text-base py-2 px-4">
                ⏱️ {topic.estimatedHours}h
              </Badge>
            )}
            <Badge variant="outline" className="text-base py-2 px-4">
              📚 {topic.resources.length} Resources
            </Badge>
            {topic.quizzes.length > 0 && (
              <Badge variant="outline" className="text-base py-2 px-4">
                ✅ Quiz Available
              </Badge>
            )}
            {progress && (
              <Badge
                className={`text-base py-2 px-4 ${progressColors[progress]}`}
              >
                {t(`status.${progress}`)}
              </Badge>
            )}
          </div>

          {/* Progress Actions */}
          {session?.user && (
            <div className="flex gap-3 flex-wrap">
              {progress !== 'in_progress' && (
                <Button
                  onClick={() => updateProgress('in_progress')}
                  disabled={updating}
                  variant={progress === 'completed' ? 'outline' : 'default'}
                >
                  {progress === 'completed' ? 'Mark as In Progress' : 'Start Learning'}
                </Button>
              )}
              {progress !== 'completed' && (
                <Button
                  onClick={() => updateProgress('completed')}
                  disabled={updating}
                  variant={progress === 'in_progress' ? 'default' : 'outline'}
                >
                  Mark as Completed
                </Button>
              )}
              {progress === 'completed' && (
                <Button
                  onClick={() => updateProgress('planned')}
                  disabled={updating}
                  variant="outline"
                >
                  Reset Progress
                </Button>
              )}
              <Button
                onClick={toggleBookmark}
                variant="outline"
                className={bookmarked ? 'bg-yellow-50 border-yellow-500' : ''}
              >
                {bookmarked ? '🔖 Bookmarked' : '🔖 Bookmark'}
              </Button>
            </div>
          )}

          {!session?.user && (
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>{' '}
                to track your progress
              </p>
            </div>
          )}
        </div>

        {/* Main Content */}
        {content && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Learning Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resources */}
        {topic.resources.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Learning Resources</CardTitle>
              <CardDescription>
                Curated resources to help you master this topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topic.resources.map((resource) => {
                  const resourceTitle = locale === 'tr' ? resource.titleTr : resource.titleEn
                  const resourceDescription =
                    locale === 'tr' ? resource.descriptionTr : resource.descriptionEn

                  return (
                    <div
                      key={resource.id}
                      className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="text-3xl flex-shrink-0">
                        {resourceTypeIcons[resource.type.toLowerCase()] || '📄'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1">{resourceTitle}</h4>
                        {resourceDescription && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {resourceDescription}
                          </p>
                        )}
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs">
                            {resource.type}
                          </Badge>
                          {resource.duration && (
                            <span className="text-xs text-muted-foreground">
                              {resource.duration} min
                            </span>
                          )}
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </a>
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quiz */}
        {topic.quizzes.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Knowledge Check</CardTitle>
              <CardDescription>
                Test your understanding of this topic
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topic.quizzes.map((quiz) => {
                  const quizTitle = locale === 'tr' ? quiz.titleTr : quiz.titleEn
                  const quizDescription =
                    locale === 'tr' ? quiz.descriptionTr : quiz.descriptionEn

                  return (
                    <div
                      key={quiz.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <h4 className="font-semibold mb-1">{quizTitle}</h4>
                      {quizDescription && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {quizDescription}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">
                          {quiz.questions.length} Questions
                        </Badge>
                        <Button asChild size="sm">
                          <Link href={`/quiz/${quiz.id}`}>Take Quiz</Link>
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {session?.user && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>My Notes</CardTitle>
              <CardDescription>
                Personal notes for this topic
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add note */}
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 p-3 border rounded-lg resize-none"
                  rows={3}
                />
                <Button onClick={addNote} disabled={!newNote.trim()}>
                  Add Note
                </Button>
              </div>

              {/* Notes list */}
              {notes.length > 0 ? (
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-4 border rounded-lg bg-muted/30"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <Button
                          onClick={() => deleteNote(note.id)}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                        >
                          Delete
                        </Button>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No notes yet. Add your first note above!
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button asChild variant="outline">
            <Link href={`/roadmap/${topic.phase.track.slug}`}>
              ← Back to {locale === 'tr' ? topic.phase.track.titleTr : topic.phase.track.titleEn}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
