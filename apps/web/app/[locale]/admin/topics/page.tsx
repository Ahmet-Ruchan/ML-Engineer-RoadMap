'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Link } from '@/navigation'

interface Topic {
  id: string
  slug: string
  titleEn: string
  titleTr: string
  difficulty?: string
  phase: {
    titleEn: string
    titleTr: string
    track: {
      titleEn: string
      titleTr: string
    }
  }
  _count: {
    resources: number
    quizzes: number
  }
}

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

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
    } finally {
      setLoading(false)
    }
  }

  const deleteTopic = async (id: string) => {
    if (!confirm('Are you sure you want to delete this topic?')) return

    try {
      const res = await fetch(`/api/admin/topics/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success('Topic deleted successfully')
        fetchTopics()
      } else {
        toast.error(data.error || 'Failed to delete topic')
      }
    } catch (error) {
      console.error('Error deleting topic:', error)
      toast.error('Failed to delete topic')
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading topics...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Topics</h1>
          <p className="text-muted-foreground">Edit topic content and details</p>
        </div>
      </div>

      <div className="grid gap-4">
        {topics.map((topic) => (
          <Card key={topic.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-2">{topic.titleEn}</CardTitle>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary">
                      {topic.phase.track.titleEn} → {topic.phase.titleEn}
                    </Badge>
                    {topic.difficulty && (
                      <Badge variant="outline">{topic.difficulty}</Badge>
                    )}
                    <Badge variant="outline">
                      📚 {topic._count.resources} resources
                    </Badge>
                    <Badge variant="outline">
                      ✅ {topic._count.quizzes} quizzes
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href={`/admin/topics/${topic.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    onClick={() => deleteTopic(topic.id)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
