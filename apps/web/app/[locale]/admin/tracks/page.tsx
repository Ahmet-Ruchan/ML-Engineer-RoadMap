import { prisma } from '@/lib/db'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AdminTracksPage() {
  const tracks = await prisma.track.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: {
          phases: true,
        },
      },
    },
  })

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
                    <CardTitle>{track.titleEn}</CardTitle>
                    <Badge variant={track.isActive ? 'default' : 'secondary'}>
                      {track.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>
                    Turkish: {track.titleTr}
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Slug: {track.slug}</span>
                <span>•</span>
                <span>{track._count.phases} phases</span>
                <span>•</span>
                <span>Order: {track.order}</span>
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
