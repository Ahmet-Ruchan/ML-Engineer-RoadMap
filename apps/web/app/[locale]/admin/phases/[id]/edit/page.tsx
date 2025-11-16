'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Track {
  id: string
  titleEn: string
}

export default function EditPhasePage() {
  const params = useParams()
  const router = useRouter()
  const phaseId = params.id as string

  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
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
    fetchPhase()
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

  const fetchPhase = async () => {
    try {
      const res = await fetch(\`/api/admin/phases/\${phaseId}\`)
      const data = await res.json()
      if (data.success) {
        const phase = data.data
        setFormData({
          trackId: phase.trackId,
          slug: phase.slug,
          titleEn: phase.titleEn,
          titleTr: phase.titleTr,
          descriptionEn: phase.descriptionEn || '',
          descriptionTr: phase.descriptionTr || '',
          order: phase.order,
          durationMonths: phase.durationMonths
        })
      } else {
        toast.error('Phase not found')
        router.push('/admin/phases')
      }
    } catch (error) {
      console.error('Error fetching phase:', error)
      toast.error('Failed to load phase')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch(\`/api/admin/phases/\${phaseId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Phase updated successfully')
        router.push('/admin/phases')
      } else {
        toast.error(data.error || 'Failed to update phase')
      }
    } catch (error) {
      console.error('Error updating phase:', error)
      toast.error('Failed to update phase')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading phase...</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Edit Phase</h1>
        <p className="text-muted-foreground">Update phase information</p>
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
            {saving ? 'Saving...' : 'Save Changes'}
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
