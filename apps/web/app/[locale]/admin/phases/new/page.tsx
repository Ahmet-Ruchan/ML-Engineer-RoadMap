'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Track {
  id: string
  titleEn: string
  titleTr: string
}

export default function NewPhasePage() {
  const router = useRouter()
  const [tracks, setTracks] = useState<Track[]>([])
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    trackId: '',
    slug: '',
    titleEn: '',
    titleTr: '',
    descriptionEn: '',
    descriptionTr: '',
    order: 0,
    durationMonths: 1
  })

  useEffect(() => {
    fetchTracks()
  }, [])

  const fetchTracks = async () => {
    try {
      const res = await fetch('/api/admin/tracks')
      const data = await res.json()
      if (data.success) {
        setTracks(data.data)
      }
    } catch (error) {
      console.error('Error fetching tracks:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/admin/phases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Phase created successfully')
        router.push('/admin/phases')
      } else {
        toast.error(data.error || 'Failed to create phase')
      }
    } catch (error) {
      console.error('Error creating phase:', error)
      toast.error('Failed to create phase')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create New Phase</h1>
        <p className="text-muted-foreground">Add a new learning phase</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Track *</label>
              <select
                value={formData.trackId}
                onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a track</option>
                {tracks.map(track => (
                  <option key={track.id} value={track.id}>
                    {track.titleEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="foundations"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration (Months) *</label>
                <input
                  type="number"
                  value={formData.durationMonths}
                  onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title (EN) *</label>
                <input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Foundations"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title (TR) *</label>
                <input
                  type="text"
                  value={formData.titleTr}
                  onChange={(e) => setFormData({ ...formData, titleTr: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="Temeller"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (EN)</label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (TR)</label>
              <textarea
                value={formData.descriptionTr}
                onChange={(e) => setFormData({ ...formData, descriptionTr: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create Phase'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/phases')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
