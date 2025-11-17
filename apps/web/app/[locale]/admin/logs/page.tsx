'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Activity {
  id: string
  type: string
  action: string
  entity: string
  entityId: string
  description: string
  timestamp: string
  user?: {
    name: string | null
    email: string
  }
}

export default function ActivityLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || session.user.role !== 'admin') {
      router.push('/')
      return
    }
    fetchLogs()
  }, [session, status, router, filterType])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        type: filterType,
        limit: '100'
      })
      const res = await fetch(`/api/admin/logs?${params}`)
      const data = await res.json()
      if (data.success) {
        setActivities(data.data.activities)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'earned':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'passed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return '👥'
      case 'topic':
        return '📝'
      case 'progress':
        return '✅'
      case 'resource':
        return '📚'
      case 'quiz':
        return '❓'
      case 'badge':
        return '🏆'
      default:
        return '📋'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) {
      return 'Just now'
    } else if (hours < 24) {
      return `${hours}h ago`
    } else if (days < 7) {
      return `${days}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading activity logs...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Activity Logs</h1>
        <p className="text-muted-foreground">
          Monitor all system activities and user actions
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All Activities
            </Button>
            <Button
              variant={filterType === 'user' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('user')}
            >
              👥 Users
            </Button>
            <Button
              variant={filterType === 'topic' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('topic')}
            >
              📝 Topics
            </Button>
            <Button
              variant={filterType === 'progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('progress')}
            >
              ✅ Progress
            </Button>
            <Button
              variant={filterType === 'resource' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('resource')}
            >
              📚 Resources
            </Button>
            <Button
              variant={filterType === 'quiz' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('quiz')}
            >
              ❓ Quizzes
            </Button>
            <Button
              variant={filterType === 'badge' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('badge')}
            >
              🏆 Badges
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            {activities.length} activities found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No activities found
            </p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  {/* Icon */}
                  <div className="text-3xl mt-1">
                    {getTypeIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getActionColor(activity.action)}>
                        {activity.action}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {activity.entity}
                      </span>
                    </div>
                    <p className="text-sm">
                      {activity.description}
                    </p>
                    {activity.user && (
                      <p className="text-xs text-muted-foreground mt-1">
                        User: {activity.user.name || activity.user.email}
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimestamp(activity.timestamp)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
