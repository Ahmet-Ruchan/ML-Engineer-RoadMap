'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function NewTrackPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    slug: '',
    titleEn: '',
    titleTr: '',
    descriptionEn: '',
    descriptionTr: '',
    icon: '',
    color: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/admin/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Track created successfully')
        router.push('/admin/tracks')
      } else {
        toast.error(data.error || 'Failed to create track')
      }
    } catch (error) {
      console.error('Error creating track:', error)
      toast.error('Failed to create track')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create New Track</h1>
        <p className="text-muted-foreground">Add a new learning track</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="ml-engineer"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="🤖"
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
                  placeholder="Machine Learning Engineer"
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
                  placeholder="Makine Öğrenmesi Mühendisi"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (EN)</label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Comprehensive ML engineering roadmap..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (TR)</label>
              <textarea
                value={formData.descriptionTr}
                onChange={(e) => setFormData({ ...formData, descriptionTr: e.target.value })}
                className="w-full p-2 border rounded"
                rows={3}
                placeholder="Kapsamlı ML mühendisliği yol haritası..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Color (Tailwind class)</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="bg-blue-500"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Example: bg-blue-500, bg-purple-500, bg-green-500
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating...' : 'Create Track'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/tracks')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
