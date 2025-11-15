import { useTranslations } from 'next-intl'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ResourcesPage() {
  const t = useTranslations()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">{t('nav.resources')}</h1>
        <p className="text-lg text-muted-foreground mb-12">
          Curated learning resources for your ML journey
        </p>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Books</CardTitle>
              <CardDescription>
                Essential books for Machine Learning and AI
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Online Courses</CardTitle>
              <CardDescription>
                Top-rated courses from leading platforms
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Articles & Tutorials</CardTitle>
              <CardDescription>
                In-depth articles and hands-on tutorials
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
