'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Track {
  id: string
  slug: string
  titleEn: string
  titleTr: string
  descriptionEn?: string
  descriptionTr?: string
  icon?: string
  color?: string
  _count: {
    phases: number
  }
}

export default function AdminTracksPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)

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
      toast.error('Failed to load tracks')
    } finally {
      setLoading(false)
    }
  }

  const deleteTrack = async (id: string, phaseCount: number) => {
    if (phaseCount > 0) {
      toast.error('Cannot delete track with phases. Delete phases first.')
      return
    }

    if (!confirm('Are you sure you want to delete this track?')) return

    try {
      const res = await fetch(`/api/admin/tracks/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Track deleted successfully')
        fetchTracks()
      } else {
        toast.error(data.error || 'Failed to delete track')
      }
    } catch (error) {
      console.error('Error deleting track:', error)
      toast.error('Failed to delete track')
    }
  }

  if (loading) {
    return <div className="text-center py-20">Loading tracks...</div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tracks Management</h1>
          <p className="text-muted-foreground">
            Manage learning tracks and roadmaps
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/tracks/new">Create Track</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {tracks.map((track) => (
          <Card key={track.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {track.icon && <span className="text-2xl">{track.icon}</span>}
                    <CardTitle>{track.titleEn}</CardTitle>
                  </div>
                  <CardDescription>
                    TR: {track.titleTr}
                  </CardDescription>
                  {track.descriptionEn && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {track.descriptionEn}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/tracks/${track.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    onClick={() => deleteTrack(track.id, track._count.phases)}
                    variant="destructive"
                    size="sm"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Slug: {track.slug}</span>
                <span>•</span>
                <span>{track._count.phases} phases</span>
                {track.color && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      Color: <div className={`w-4 h-4 rounded ${track.color}`}></div>
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {tracks.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No tracks found</p>
              <Button asChild>
                <Link href="/admin/tracks/new">Create your first track</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
