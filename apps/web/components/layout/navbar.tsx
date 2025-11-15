'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const t = useTranslations()

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold">
              🚀 ML Roadmap
            </Link>
            <div className="hidden md:flex gap-6">
              <Link
                href="/roadmap"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {t('nav.roadmap')}
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {t('nav.dashboard')}
              </Link>
              <Link
                href="/resources"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                {t('nav.resources')}
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              {t('nav.login')}
            </Button>
            <Button size="sm">{t('nav.signup')}</Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
