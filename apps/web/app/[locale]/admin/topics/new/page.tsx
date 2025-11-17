'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/navigation'

interface Phase {
  id: string
  slug: string
  titleEn: string
  titleTr: string
  order: number
}

interface Track {
  id: string
  slug: string
  titleEn: string
  titleTr: string
  descriptionEn: string | null
  descriptionTr: string | null
  order: number
  isActive: boolean
  phases: Phase[]
}

export default function NewTopicPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tracks, setTracks] = useState<Track[]>([])
  const [selectedTrack, setSelectedTrack] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form fields
  const [phaseId, setPhaseId] = useState('')
  const [slug, setSlug] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [titleTr, setTitleTr] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionTr, setDescriptionTr] = useState('')
  const [contentEn, setContentEn] = useState('')
  const [contentTr, setContentTr] = useState('')
  const [order, setOrder] = useState('0')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [difficulty, setDifficulty] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || session.user.role !== 'admin') {
      router.push('/')
      return
    }
    fetchTracksAndPhases()
  }, [session, status, router])

  const fetchTracksAndPhases = async () => {
    try {
      const res = await fetch('/api/admin/tracks-phases')
      const data = await res.json()
      if (data.success) {
        setTracks(data.data)
      }
    } catch (error) {
      console.error('Error fetching tracks:', error)
      setError('Failed to load tracks and phases')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phaseId,
          slug,
          titleEn,
          titleTr,
          descriptionEn: descriptionEn || null,
          descriptionTr: descriptionTr || null,
          contentEn: contentEn || null,
          contentTr: contentTr || null,
          order: parseInt(order) || 0,
          estimatedHours: estimatedHours ? parseInt(estimatedHours) : null,
          difficulty: difficulty || null
        })
      })

      const result = await res.json()

      if (result.success) {
        alert('Topic created successfully!')
        router.push('/admin/topics')
      } else {
        setError(result.error || 'Failed to create topic')
      }
    } catch (error) {
      console.error('Error creating topic:', error)
      setError('Failed to create topic')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const selectedTrackData = tracks.find(t => t.id === selectedTrack)
  const availablePhases = selectedTrackData?.phases || []

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Create New Topic</h1>
          <p className="text-muted-foreground">
            Add a new learning topic to a phase
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/topics">Back to Topics</Link>
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Topic Information</CardTitle>
            <CardDescription>Fill in the details for the new topic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Track Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Track <span className="text-destructive">*</span>
              </label>
              <select
                value={selectedTrack}
                onChange={(e) => {
                  setSelectedTrack(e.target.value)
                  setPhaseId('') // Reset phase when track changes
                }}
                className="w-full px-4 py-2 rounded-md border border-input bg-background"
                required
              >
                <option value="">-- Select a Track --</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>
                    {track.titleEn} / {track.titleTr}
                  </option>
                ))}
              </select>
            </div>

            {/* Phase Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Phase <span className="text-destructive">*</span>
              </label>
              <select
                value={phaseId}
                onChange={(e) => setPhaseId(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-input bg-background"
                required
                disabled={!selectedTrack}
              >
                <option value="">-- Select a Phase --</option>
                {availablePhases.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    {phase.titleEn} / {phase.titleTr}
                  </option>
                ))}
              </select>
              {!selectedTrack && (
                <p className="text-sm text-muted-foreground mt-1">
                  Please select a track first
                </p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Slug <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g., linear-regression"
                className="w-full px-4 py-2 rounded-md border border-input bg-background"
                required
              />
              <p className="text-sm text-muted-foreground mt-1">
                URL-friendly identifier (lowercase, hyphens only)
              </p>
            </div>

            {/* Title English */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Title (English) <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g., Linear Regression"
                className="w-full px-4 py-2 rounded-md border border-input bg-background"
                required
              />
            </div>

            {/* Title Turkish */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Title (Turkish) <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={titleTr}
                onChange={(e) => setTitleTr(e.target.value)}
                placeholder="e.g., Doğrusal Regresyon"
                className="w-full px-4 py-2 rounded-md border border-input bg-background"
                required
              />
            </div>

            {/* Description English */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description (English)
              </label>
              <textarea
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Brief description in English..."
                className="w-full px-4 py-2 rounded-md border border-input bg-background min-h-[100px]"
                rows={4}
              />
            </div>

            {/* Description Turkish */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Description (Turkish)
              </label>
              <textarea
                value={descriptionTr}
                onChange={(e) => setDescriptionTr(e.target.value)}
                placeholder="Türkçe kısa açıklama..."
                className="w-full px-4 py-2 rounded-md border border-input bg-background min-h-[100px]"
                rows={4}
              />
            </div>

            {/* Content English (MDX) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Content (English) - MDX
              </label>
              <textarea
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                placeholder="Full MDX content in English..."
                className="w-full px-4 py-2 rounded-md border border-input bg-background min-h-[200px] font-mono text-sm"
                rows={10}
              />
              <p className="text-sm text-muted-foreground mt-1">
                MDX-formatted content with markdown and React components
              </p>
            </div>

            {/* Content Turkish (MDX) */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Content (Turkish) - MDX
              </label>
              <textarea
                value={contentTr}
                onChange={(e) => setContentTr(e.target.value)}
                placeholder="Türkçe MDX içeriği..."
                className="w-full px-4 py-2 rounded-md border border-input bg-background min-h-[200px] font-mono text-sm"
                rows={10}
              />
              <p className="text-sm text-muted-foreground mt-1">
                MDX-formatted content with markdown and React components
              </p>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2 rounded-md border border-input bg-background"
              >
                <option value="">-- Select Difficulty --</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Estimated Hours */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Estimated Hours
              </label>
              <input
                type="number"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="e.g., 8"
                min="0"
                className="w-full px-4 py-2 rounded-md border border-input bg-background"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Estimated time to complete this topic (in hours)
              </p>
            </div>

            {/* Order */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Order
              </label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2 rounded-md border border-input bg-background"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Display order within the phase (0 = first)
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4 border-t">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Creating...' : 'Create Topic'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/admin/topics')}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
