import { useTranslations } from 'next-intl'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@/navigation'

export default function DashboardPage() {
  const t = useTranslations()

  // Mock data - in real app, this would come from API/database
  const stats = {
    planned: 0,
    inProgress: 0,
    completed: 0,
    level: 1,
    xp: 0,
    badges: 0
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
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-6 mb-8">
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-blue-600 dark:text-blue-400">
                {t('dashboard.stats.level')}
              </CardDescription>
              <CardTitle className="text-3xl text-blue-700 dark:text-blue-300">
                {stats.level}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-purple-600 dark:text-purple-400">
                {t('dashboard.stats.xp')}
              </CardDescription>
              <CardTitle className="text-3xl text-purple-700 dark:text-purple-300">
                {stats.xp}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-amber-600 dark:text-amber-400">
                {t('dashboard.stats.badges')}
              </CardDescription>
              <CardTitle className="text-3xl text-amber-700 dark:text-amber-300">
                {stats.badges}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-orange-600 dark:text-orange-400">
                {t('dashboard.stats.planned')}
              </CardDescription>
              <CardTitle className="text-3xl text-orange-700 dark:text-orange-300">
                {stats.planned}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-cyan-50 dark:bg-cyan-950/20 border-cyan-200 dark:border-cyan-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-cyan-600 dark:text-cyan-400">
                {t('dashboard.stats.in_progress')}
              </CardDescription>
              <CardTitle className="text-3xl text-cyan-700 dark:text-cyan-300">
                {stats.inProgress}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <CardDescription className="text-green-600 dark:text-green-400">
                {t('dashboard.stats.completed')}
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
              <CardTitle>{t('dashboard.progress.title')}</CardTitle>
              <CardDescription>
                Continue where you left off
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {t('dashboard.progress.no_progress')}
                </p>
                <Button asChild>
                  <Link href="/roadmap">
                    {t('dashboard.progress.continue_learning')}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Badges */}
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.badges.title')}</CardTitle>
              <CardDescription>
                Your achievements and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {t('dashboard.badges.no_badges')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.activity.title')}</CardTitle>
            <CardDescription>
              Your latest learning activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {t('dashboard.activity.no_activity')}
              </p>
              <Button asChild variant="outline">
                <Link href="/roadmap">
                  {t('nav.roadmap')}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
