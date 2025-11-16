'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useSession } from 'next-auth/react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/navigation'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const t = useTranslations()
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    planned: 0,
    inProgress: 0,
    completed: 0,
    level: 1,
    xp: 0,
    badges: 0,
    loading: true
  })
  const [recentTopics, setRecentTopics] = useState<any[]>([])

  useEffect(() => {
    if (session?.user) {
      // Fetch progress stats
      fetch('/api/progress')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            const progress = data.data
            const planned = progress.filter((p: any) => p.status === 'planned').length
            const inProgress = progress.filter((p: any) => p.status === 'in_progress').length
            const completed = progress.filter((p: any) => p.status === 'completed').length

            // Get recent in-progress topics
            const recent = progress
              .filter((p: any) => p.status === 'in_progress')
              .slice(0, 3)

            setStats({
              planned,
              inProgress,
              completed,
              level: 1, // From user profile
              xp: completed * 100, // Simple XP calculation
              badges: 0,
              loading: false
            })
            setRecentTopics(recent)
          }
        })
        .catch(() => {
          setStats(prev => ({ ...prev, loading: false }))
        })
    }
  }, [session])

  if (stats.loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="animate-pulse text-muted-foreground">
              Loading your dashboard...
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('dashboard.title')}
          </h1>
          <p className="text-xl text-muted-foreground">
            Welcome back, {session?.user?.name || 'Student'}! 👋
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6 mb-8">
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-blue-600 dark:text-blue-400">
                Level
              </CardDescription>
              <CardTitle className="text-3xl text-blue-700 dark:text-blue-300">
                {stats.level}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-purple-600 dark:text-purple-400">
                XP Points
              </CardDescription>
              <CardTitle className="text-3xl text-purple-700 dark:text-purple-300">
                {stats.xp}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-amber-600 dark:text-amber-400">
                Badges
              </CardDescription>
              <CardTitle className="text-3xl text-amber-700 dark:text-amber-300">
                {stats.badges}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-orange-600 dark:text-orange-400">
                Planned
              </CardDescription>
              <CardTitle className="text-3xl text-orange-700 dark:text-orange-300">
                {stats.planned}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-cyan-600 dark:text-cyan-400">
                In Progress
              </CardDescription>
              <CardTitle className="text-3xl text-cyan-700 dark:text-cyan-300">
                {stats.inProgress}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-green-600 dark:text-green-400">
                Completed
              </CardDescription>
              <CardTitle className="text-3xl text-green-700 dark:text-green-300">
                {stats.completed}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Learning Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
              <CardDescription>
                Pick up where you left off
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentTopics.length > 0 ? (
                <div className="space-y-4">
                  {recentTopics.map((topic: any) => (
                    <div key={topic.topicId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div>
                        <h4 className="font-medium">Topic #{topic.topicId.substring(0, 8)}</h4>
                        <p className="text-sm text-muted-foreground">
                          Status: <Badge variant="outline">{topic.status}</Badge>
                        </p>
                      </div>
                      <Button size="sm" asChild>
                        <Link href="/roadmap">Continue</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No topics in progress yet
                  </p>
                  <Button asChild>
                    <Link href="/roadmap">
                      Start Learning
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>
                Overall learning statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Completion Rate</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.planned + stats.inProgress + stats.completed > 0
                        ? Math.round((stats.completed / (stats.planned + stats.inProgress + stats.completed)) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${stats.planned + stats.inProgress + stats.completed > 0
                          ? (stats.completed / (stats.planned + stats.inProgress + stats.completed)) * 100
                          : 0}%`
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.planned}</div>
                    <div className="text-xs text-muted-foreground">Planned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cyan-600">{stats.inProgress}</div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                    <div className="text-xs text-muted-foreground">Done</div>
                  </div>
                </div>

                <Button asChild className="w-full mt-4">
                  <Link href="/roadmap">Explore All Topics</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Jump to different sections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button asChild variant="outline" className="h-auto py-6 flex flex-col gap-2">
                <Link href="/roadmap">
                  <span className="text-2xl">🗺️</span>
                  <span>Roadmap</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-6 flex flex-col gap-2">
                <Link href="/resources">
                  <span className="text-2xl">📚</span>
                  <span>Resources</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-6 flex flex-col gap-2">
                <Link href="/roadmap/ml">
                  <span className="text-2xl">🤖</span>
                  <span>ML Track</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto py-6 flex flex-col gap-2">
                <Link href="/admin">
                  <span className="text-2xl">⚙️</span>
                  <span>Admin</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
