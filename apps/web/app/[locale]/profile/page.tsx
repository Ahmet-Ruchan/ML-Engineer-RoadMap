'use client'

import { useSession } from 'next-auth/react'
import { useRouter, Link } from '@/navigation'
import { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface ProfileData {
  name: string | null
  email: string
  image: string | null
  bio: string | null
  preferredLanguage: string
  level: number
  experiencePoints: number
}

interface StatsData {
  topicsCompleted: number
  quizzesPassed: number
  badgesEarned: number
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [stats, setStats] = useState<StatsData>({ topicsCompleted: 0, quizzesPassed: 0, badgesEarned: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user) {
      router.push('/login')
    } else {
      fetchProfile()
      fetchStats()
    }
  }, [session, status, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      const data = await res.json()
      if (data.success) {
        setProfile(data.data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [progressRes, badgesRes] = await Promise.all([
        fetch('/api/progress'),
        fetch('/api/badges')
      ])

      const progressData = await progressRes.json()
      const badgesData = await badgesRes.json()

      const topicsCompleted = progressData.success
        ? progressData.data.filter((p: any) => p.status === 'completed').length
        : 0

      const quizzesPassed = progressData.success
        ? progressData.data.filter((p: any) => p.quizPassed).length
        : 0

      const badgesEarned = badgesData.success
        ? badgesData.data.userBadges.length
        : 0

      setStats({ topicsCompleted, quizzesPassed, badgesEarned })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-20">Loading profile...</div>
      </div>
    )
  }

  if (!session?.user || !profile) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Profile</h1>
          <Button asChild>
            <Link href="/profile/edit">Edit Profile</Link>
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {profile.image && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Avatar</label>
                  <div className="mt-2">
                    <img
                      src={profile.image}
                      alt={profile.name || 'User avatar'}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-lg">{profile.name || 'Not set'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg">{profile.email}</p>
              </div>
              {profile.bio && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bio</label>
                  <p className="text-lg">{profile.bio}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Preferred Language</label>
                <p className="text-lg">{profile.preferredLanguage === 'tr' ? 'Türkçe' : 'English'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <div className="mt-1">
                  <Badge variant={session.user.role === 'admin' ? 'default' : 'secondary'}>
                    {session.user.role}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Learning Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">{stats.topicsCompleted}</div>
                  <div className="text-sm text-muted-foreground">Topics Completed</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">{stats.quizzesPassed}</div>
                  <div className="text-sm text-muted-foreground">Quizzes Passed</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary">{stats.badgesEarned}</div>
                  <div className="text-sm text-muted-foreground">Badges Earned</div>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Level</label>
                <div className="flex items-center gap-3 mt-2">
                  <div className="text-2xl font-bold">{profile.level}</div>
                  <div className="text-sm text-muted-foreground">
                    {profile.experiencePoints} XP
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
