'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from '@/navigation'
import { Badge } from '@/components/ui/badge'

interface AdminStats {
  counts: {
    totalUsers: number
    totalTracks: number
    totalPhases: number
    totalTopics: number
    totalResources: number
    totalQuizzes: number
    totalBadges: number
    newUsersThisWeek: number
    adminCount: number
    userCount: number
  }
  progress: {
    total: number
    completed: number
    inProgress: number
    completionRate: number
  }
  recent: {
    users: Array<{
      id: string
      name: string | null
      email: string
      role: string
      createdAt: string
    }>
    topics: Array<{
      id: string
      titleEn: string
      titleTr: string
      createdAt: string
      phase: {
        titleEn: string
        titleTr: string
        track: {
          titleEn: string
          titleTr: string
        }
      }
    }>
    resources: any[]
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || session.user.role !== 'admin') {
      router.push('/')
      return
    }
    fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  const mainStats = [
    {
      title: 'Total Users',
      value: stats.counts.totalUsers,
      change: `+${stats.counts.newUsersThisWeek} this week`,
      icon: '👥',
      color: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
    },
    {
      title: 'Learning Tracks',
      value: stats.counts.totalTracks,
      subtitle: `${stats.counts.totalPhases} phases`,
      icon: '🎯',
      color: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800',
    },
    {
      title: 'Topics',
      value: stats.counts.totalTopics,
      subtitle: `${stats.counts.totalResources} resources`,
      icon: '📝',
      color: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800',
    },
    {
      title: 'Quizzes & Badges',
      value: stats.counts.totalQuizzes,
      subtitle: `${stats.counts.totalBadges} badges`,
      icon: '🏆',
      color: 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800',
    },
  ]

  const quickActions = [
    { label: 'New Track', href: '/admin/tracks/new', icon: '➕', color: 'bg-purple-500' },
    { label: 'New Phase', href: '/admin/phases/new', icon: '📋', color: 'bg-blue-500' },
    { label: 'New Topic', href: '/admin/topics/new', icon: '📝', color: 'bg-green-500' },
    { label: 'New Resource', href: '/admin/resources/new', icon: '📚', color: 'bg-orange-500' },
    { label: 'New Quiz', href: '/admin/quizzes/new', icon: '❓', color: 'bg-pink-500' },
    { label: 'Manage Users', href: '/admin/users', icon: '👥', color: 'bg-indigo-500' },
  ]

  const progressPercentage = stats.progress.total > 0
    ? (stats.progress.inProgress / stats.progress.total) * 100
    : 0

  const userRolePercentage = stats.counts.totalUsers > 0
    ? (stats.counts.userCount / stats.counts.totalUsers) * 100
    : 0

  const adminRolePercentage = stats.counts.totalUsers > 0
    ? (stats.counts.adminCount / stats.counts.totalUsers) * 100
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s what&apos;s happening with your platform.
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {mainStats.map((stat) => (
          <Card key={stat.title} className={stat.color}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              {stat.change && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  {stat.change}
                </p>
              )}
              {stat.subtitle && (
                <p className="text-xs text-muted-foreground">
                  {stat.subtitle}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.label}
                asChild
                variant="outline"
                className="h-auto flex-col py-4 space-y-2"
              >
                <Link href={action.href}>
                  <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center text-2xl text-white`}>
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Progress & Roles */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Progress</CardTitle>
            <CardDescription>Overall learning progress statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Total Progress Items</span>
                <span className="text-sm text-muted-foreground">{stats.progress.total}</span>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Completed</span>
                <span className="text-sm text-green-600">{stats.progress.completed}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${stats.progress.completionRate}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">In Progress</span>
                <span className="text-sm text-blue-600">{stats.progress.inProgress}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {stats.progress.completionRate}%
                </div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Roles</CardTitle>
            <CardDescription>Distribution of user roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">👥 Regular Users</span>
                  <span className="text-sm font-bold">{stats.counts.userCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${userRolePercentage}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">👨‍💼 Administrators</span>
                  <span className="text-sm font-bold">{stats.counts.adminCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${adminRolePercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {stats.counts.totalUsers}
                </div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recent.users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recent.users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{user.name || 'Anonymous'}</p>
                      <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/users">View All Users</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Topics</CardTitle>
            <CardDescription>Latest added topics</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recent.topics.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No topics yet</p>
            ) : (
              <div className="space-y-3">
                {stats.recent.topics.map((topic) => (
                  <div key={topic.id} className="p-3 rounded-lg bg-muted/50">
                    <p className="font-medium">{topic.titleEn}</p>
                    <p className="text-sm text-muted-foreground">
                      {topic.phase.track.titleEn} → {topic.phase.titleEn}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(topic.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/topics">View All Topics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Links */}
      <Card>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
          <CardDescription>Manage all content types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Button asChild variant="outline">
              <Link href="/admin/tracks">Tracks</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/phases">Phases</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/topics">Topics</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/resources">Resources</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/quizzes">Quizzes</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
