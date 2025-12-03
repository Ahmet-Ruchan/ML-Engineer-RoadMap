'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  requiredCount: number
}

interface UserBadge {
  id: string
  earnedAt: string
  badge: BadgeData
}

export default function BadgesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [allBadges, setAllBadges] = useState<BadgeData[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [completedTopics, setCompletedTopics] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.push('/login')
      return
    }
    fetchBadges()
  }, [session, status, router])

  const fetchBadges = async () => {
    try {
      const res = await fetch('/api/badges')
      const data = await res.json()
      if (data.success) {
        setAllBadges(data.data.allBadges)
        setUserBadges(data.data.userBadges)
        setCompletedTopics(data.data.completedTopics)
      }
    } catch (error) {
      console.error('Error fetching badges:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">Loading badges...</div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badge.id))

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Achievements & Badges</h1>
        <p className="text-muted-foreground mb-8">
          Earn badges by completing topics and reaching milestones
        </p>

        {/* Stats */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold">{userBadges.length}</div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{completedTopics}</div>
                <div className="text-sm text-muted-foreground">Topics Completed</div>
              </div>
              <div>
                <div className="text-3xl font-bold">{Math.round((userBadges.length / allBadges.length) * 100)}%</div>
                <div className="text-sm text-muted-foreground">Collection</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {allBadges.map((badge) => {
            const isEarned = earnedBadgeIds.has(badge.id)
            const userBadge = userBadges.find(ub => ub.badge.id === badge.id)
            const progress = Math.min((completedTopics / badge.requiredCount) * 100, 100)

            return (
              <Card
                key={badge.id}
                className={isEarned ? 'border-2 border-primary' : 'opacity-60'}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`text-5xl \${isEarned ? '' : 'grayscale'}`}>
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {badge.name}
                        {isEarned && (
                          <Badge variant="default" className="text-xs">Earned</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {badge.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {isEarned ? 'Completed' : 'Progress'}
                      </span>
                      <span className="font-medium">
                        {isEarned
                          ? new Date(userBadge!.earnedAt).toLocaleDateString()
                          : `\${completedTopics}/\${badge.requiredCount} topics`
                        }
                      </span>
                    </div>
                    {!isEarned && (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `\${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {allBadges.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold mb-2">No badges yet</h3>
              <p className="text-muted-foreground">
                Badges will appear here as you complete topics
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
