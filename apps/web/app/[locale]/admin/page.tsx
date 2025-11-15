import { prisma } from '@/lib/db'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default async function AdminDashboard() {
  // Get statistics
  const [
    totalUsers,
    totalTracks,
    totalPhases,
    totalTopics,
    totalResources,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.track.count(),
    prisma.phase.count(),
    prisma.topic.count(),
    prisma.resource.count(),
  ])

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: '👥',
      color: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Total Tracks',
      value: totalTracks,
      icon: '🎯',
      color: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
    },
    {
      title: 'Total Phases',
      value: totalPhases,
      icon: '📋',
      color: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
    },
    {
      title: 'Total Topics',
      value: totalTopics,
      icon: '📝',
      color: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
    },
    {
      title: 'Total Resources',
      value: totalResources,
      icon: '📚',
      color: 'bg-pink-50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800',
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your ML roadmap platform
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className={stat.color}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
