'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from '@/navigation'
import { Link } from '@/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
// Icons as SVG components
const UploadIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
)

const FileTextIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
)

const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
)

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [topics, setTopics] = useState<Topic[]>([])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{
    fileUrl: string
    filename: string
    size: number
  } | null>(null)
  const [formData, setFormData] = useState({
    topicId: '',
    titleEn: '',
    titleTr: '',
    descriptionEn: '',
    descriptionTr: '',
    type: 'article',
    url: '',
    fileUrl: '',
    author: '',
    order: 0,
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
      toast.error('Failed to load topics')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed')
      return
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB')
      return
    }

    setUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const res = await fetch('/api/admin/resources/upload', {
        method: 'POST',
        body: uploadFormData
      })

      const data = await res.json()

      if (data.success) {
        setUploadedFile(data.data)
        setFormData({ ...formData, fileUrl: data.data.fileUrl, type: 'pdf' })
        toast.success('PDF uploaded successfully')
      } else {
        toast.error(data.error || 'Failed to upload file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setFormData({ ...formData, fileUrl: '', type: 'article' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.topicId) {
      toast.error('Please select a topic')
      return
    }

    if (!formData.titleEn || !formData.titleTr) {
      toast.error('Please fill in both English and Turkish titles')
      return
    }

    if (formData.type === 'pdf' && !formData.fileUrl) {
      toast.error('Please upload a PDF file')
      return
    }

    if (formData.type !== 'pdf' && !formData.url) {
      toast.error('Please provide a URL')
      return
    }

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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/resources">
              ← Back to Resources
            </Link>
          </Button>
        </div>
        <h1 className="text-4xl font-bold mb-2">Add New Resource</h1>
        <p className="text-muted-foreground">
          Add a learning resource to a topic. You can upload a PDF or provide a URL.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Select the topic and provide resource details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Topic <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.topicId}
                onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Resource Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value
                    setFormData({ 
                      ...formData, 
                      type: newType,
                      // Clear fileUrl if switching away from PDF
                      fileUrl: newType !== 'pdf' ? '' : formData.fileUrl
                    })
                    if (newType !== 'pdf') {
                      setUploadedFile(null)
                    }
                  }}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  required
                >
                  <option value="article">📄 Article</option>
                  <option value="video">🎥 Video</option>
                  <option value="book">📚 Book</option>
                  <option value="course">🎓 Course</option>
                  <option value="documentation">📖 Documentation</option>
                  <option value="tutorial">💻 Tutorial</option>
                  <option value="tool">🔧 Tool</option>
                  <option value="pdf">📑 PDF Document</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Author</label>
                <Input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Author name (optional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title (English) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.titleEn}
                  onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  placeholder="Resource title in English"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Title (Turkish) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={formData.titleTr}
                  onChange={(e) => setFormData({ ...formData, titleTr: e.target.value })}
                  placeholder="Resource title in Turkish"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (English)</label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Brief description of the resource"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description (Turkish)</label>
              <textarea
                value={formData.descriptionTr}
                onChange={(e) => setFormData({ ...formData, descriptionTr: e.target.value })}
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Kaynağın kısa açıklaması"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload or URL */}
        <Card>
          <CardHeader>
            <CardTitle>
              {formData.type === 'pdf' ? 'PDF Upload' : 'Resource URL'}
            </CardTitle>
            <CardDescription>
              {formData.type === 'pdf' 
                ? 'Upload a PDF file (max 10MB)' 
                : 'Provide the URL to the resource'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.type === 'pdf' ? (
              <div className="space-y-4">
                {!uploadedFile ? (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="cursor-pointer flex flex-col items-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <UploadIcon />
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">
                          Click to upload PDF
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PDF files only, max 10MB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={uploading}
                        onClick={(e) => {
                          e.preventDefault()
                          fileInputRef.current?.click()
                        }}
                      >
                        {uploading ? 'Uploading...' : 'Choose PDF File'}
                      </Button>
                    </label>
                  </div>
                ) : (
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                          <FileTextIcon />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{uploadedFile.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(uploadedFile.size)}
                          </p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          <CheckIcon />
                          <span className="ml-1">Uploaded</span>
                        </Badge>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeFile}
                      >
                        <XIcon />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-2">
                  URL <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    <LinkIcon />
                  </span>
                  <Input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com/resource"
                    required={formData.type !== 'pdf'}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Settings</CardTitle>
            <CardDescription>Configure display order and premium status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Order</label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  min="0"
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower numbers appear first
                </p>
              </div>
              <div className="flex items-center gap-3 pt-8">
                <input
                  type="checkbox"
                  id="isPremium"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isPremium" className="text-sm font-medium cursor-pointer">
                  Premium Resource
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/resources')}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving || uploading}>
            {saving ? 'Creating...' : 'Create Resource'}
          </Button>
        </div>
      </form>
    </div>
  )
}
