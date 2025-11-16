'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Topic {
  id: string
  titleEn: string
  phase: {
    titleEn: string
    track: {
      titleEn: string
    }
  }
}

export default function NewResourcePage() {
  const router = useRouter()
  const [topics, setTopics] = useState<Topic[]>([])
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    topicId: '',
    titleEn: '',
    titleTr: '',
    descriptionEn: '',
    descriptionTr: '',
    type: 'article',
    url: '',
    order: 0,
    duration: 0,
    isPremium: false
  })

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    try {
      const res = await fetch('/api/admin/topics')
      const data = await res.json()
      if (data.success) {
        setTopics(data.data)
      }
    } catch (error) {
      console.error('Error fetching topics:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Resource created successfully')
        router.push('/admin/resources')
      } else {
        toast.error(data.error || 'Failed to create resource')
      }
    } catch (error) {
      console.error('Error creating resource:', error)
      toast.error('Failed to create resource')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Add New Resource</h1>
        <p className="text-muted-foreground">Add a learning resource to a topic</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Topic *</label>
              <select
                value={formData.topicId}
                onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="">Select a topic</option>
                {topics.map(topic => (
                  <option key={topic.id} value={topic.id}>
                    {topic.phase.track.titleEn} → {topic.phase.titleEn} → {topic.titleEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="video">Video</option>
                  <option value="article">Article</option>
                  <option value="book">Book</option>
                  <option value="course">Course</option>
                  <option value="documentation">Documentation</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="tool">Tool</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full p-2 border rounded"
                  min="0"
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
              <label className="block text-sm font-medium mb-2">URL *</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="https://..."
                required
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

            <div className="grid grid-cols-2 gap-4">
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
              <div className="flex items-center gap-2 pt-8">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isPremium" className="text-sm font-medium">
                  Premium Resource
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create Resource'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/resources')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
