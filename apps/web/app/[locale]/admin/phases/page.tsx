'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Phase {
  id: string
  slug: string
  titleEn: string
  titleTr: string
  order: number
  durationMonths: number
  track: {
    titleEn: string
    titleTr: string
  }
  _count: {
    topics: number
  }
}

export default function AdminPhasesPage() {
  const [phases, setPhases] = useState<Phase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPhases()
  }, [])

  const fetchPhases = async () => {
    try {
      const res = await fetch('/api/admin/phases')
      const data = await res.json()
      if (data.success) {
        setPhases(data.data)
      }
    } catch (error) {
      console.error('Error fetching phases:', error)
      toast.error('Failed to load phases')
    } finally {
      setLoading(false)
    }
  }

  const deletePhase = async (id: string, topicCount: number) => {
    if (topicCount > 0) {
      toast.error('Cannot delete phase with topics. Delete topics first.')
      return
    }

    if (!confirm('Are you sure you want to delete this phase?')) return

    try {
      const res = await fetch(`/api/admin/phases/\${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Phase deleted successfully')
        fetchPhases()
      } else {
        toast.error(data.error || 'Failed to delete phase')
      }
    } catch (error) {
      console.error('Error deleting phase:', error)
      toast.error('Failed to delete phase')
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading phases...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Phases Management</h1>
          <p className="text-muted-foreground">
            Manage learning phases within tracks
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/phases/new">Create Phase</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {phases.map((phase) => (
          <Card key={phase.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-2">{phase.titleEn}</CardTitle>
                  <CardDescription>TR: {phase.titleTr}</CardDescription>
                  <div className="flex gap-2 mt-3">
                    <Badge variant="secondary">{phase.track.titleEn}</Badge>
                    <Badge variant="outline">Order: {phase.order}</Badge>
                    <Badge variant="outline">{phase.durationMonths} months</Badge>
                    <Badge variant="outline">{phase._count.topics} topics</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/phases/\${phase.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    onClick={() => deletePhase(phase.id, phase._count.topics)}
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

        {phases.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No phases found</p>
              <Button asChild>
                <Link href="/admin/phases/new">Create your first phase</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
