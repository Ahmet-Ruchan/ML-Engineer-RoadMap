'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Resource {
  id: string
  titleEn: string
  titleTr: string
  type: string
  url: string
  duration?: number
  topic: {
    titleEn: string
  }
}

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResources()
  }, [])

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/admin/resources')
      const data = await res.json()
      if (data.success) {
        setResources(data.data)
      }
    } catch (error) {
      console.error('Error fetching resources:', error)
      toast.error('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const deleteResource = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      const res = await fetch(`/api/admin/resources/\${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Resource deleted successfully')
        fetchResources()
      } else {
        toast.error(data.error || 'Failed to delete resource')
      }
    } catch (error) {
      console.error('Error deleting resource:', error)
      toast.error('Failed to delete resource')
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading resources...</div>
  }

  const typeIcons: Record<string, string> = {
    video: '🎥',
    article: '📄',
    book: '📚',
    course: '🎓',
    documentation: '📖',
    tutorial: '💻',
    tool: '🔧'
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resources Management</h1>
          <p className="text-muted-foreground">
            Manage learning resources for topics
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/resources/new">Add Resource</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{typeIcons[resource.type.toLowerCase()] || '📄'}</span>
                    <CardTitle>{resource.titleEn}</CardTitle>
                  </div>
                  <CardDescription>TR: {resource.titleTr}</CardDescription>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="secondary">{resource.topic.titleEn}</Badge>
                    <Badge variant="outline">{resource.type}</Badge>
                    {resource.duration && (
                      <Badge variant="outline">{resource.duration} min</Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/resources/\${resource.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    onClick={() => deleteResource(resource.id)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground truncate">
                URL: {resource.url}
              </div>
            </CardContent>
          </Card>
        ))}

        {resources.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No resources found</p>
              <Button asChild>
                <Link href="/admin/resources/new">Add your first resource</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
