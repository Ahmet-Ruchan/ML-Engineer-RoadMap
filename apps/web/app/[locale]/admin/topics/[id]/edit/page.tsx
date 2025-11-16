'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
  order: number
}

export default function EditTopicPage() {
  const params = useParams()
  const router = useRouter()
  const topicId = params.id as string

  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTopic()
  }, [])

  const fetchTopic = async () => {
    try {
      const res = await fetch(\`/api/admin/topics/\${topicId}\`)
      const data = await res.json()
      if (data.success) {
        setTopic(data.data)
      } else {
        toast.error('Topic not found')
        router.push('/admin/topics')
      }
    } catch (error) {
      console.error('Error fetching topic:', error)
      toast.error('Failed to load topic')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!topic) return

    setSaving(true)
    try {
      const res = await fetch(\`/api/admin/topics/\${topicId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(topic)
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Topic updated successfully')
        router.push('/admin/topics')
      } else {
        toast.error(data.error || 'Failed to update topic')
      }
    } catch (error) {
      console.error('Error updating topic:', error)
      toast.error('Failed to update topic')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading topic...</div>
  }

  if (!topic) {
    return <div className="text-center py-20">Topic not found</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Edit Topic</h1>
        <p className="text-muted-foreground">Update topic content and details</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title (EN)</label>
                <input
                  type="text"
                  value={topic.titleEn}
                  onChange={(e) => setTopic({ ...topic, titleEn: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title (TR)</label>
                <input
                  type="text"
                  value={topic.titleTr}
                  onChange={(e) => setTopic({ ...topic, titleTr: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Slug</label>
                <input
                  type="text"
                  value={topic.slug}
                  onChange={(e) => setTopic({ ...topic, slug: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty</label>
                <select
                  value={topic.difficulty || ''}
                  onChange={(e) => setTopic({ ...topic, difficulty: e.target.value })}
                  className="w-full p-2 border rounded"
                >
                  <option value="">Select difficulty</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Estimated Hours</label>
                <input
                  type="number"
                  value={topic.estimatedHours || ''}
                  onChange={(e) => setTopic({ ...topic, estimatedHours: parseInt(e.target.value) || undefined })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Order</label>
                <input
                  type="number"
                  value={topic.order}
                  onChange={(e) => setTopic({ ...topic, order: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (EN)</label>
              <textarea
                value={topic.descriptionEn || ''}
                onChange={(e) => setTopic({ ...topic, descriptionEn: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (TR)</label>
              <textarea
                value={topic.descriptionTr || ''}
                onChange={(e) => setTopic({ ...topic, descriptionTr: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Content (HTML)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Content (EN) - HTML</label>
              <textarea
                value={topic.contentEn || ''}
                onChange={(e) => setTopic({ ...topic, contentEn: e.target.value })}
                className="w-full p-2 border rounded font-mono text-sm"
                rows={15}
                placeholder="<h2>Introduction</h2><p>Topic content here...</p>"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Content (TR) - HTML</label>
              <textarea
                value={topic.contentTr || ''}
                onChange={(e) => setTopic({ ...topic, contentTr: e.target.value })}
                className="w-full p-2 border rounded font-mono text-sm"
                rows={15}
                placeholder="<h2>Giriş</h2><p>Konu içeriği buraya...</p>"
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
            onClick={() => router.push('/admin/topics')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
