import { useTranslations } from 'next-intl'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function DashboardPage() {
  const t = useTranslations()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{t('nav.dashboard')}</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Track your learning progress and achievements
        </p>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">0</CardTitle>
              <CardDescription>{t('status.planned')}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">0</CardTitle>
              <CardDescription>{t('status.in_progress')}</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">0</CardTitle>
              <CardDescription>{t('status.completed')}</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest learning activities</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-8">
              No activities yet. Start your learning journey!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
