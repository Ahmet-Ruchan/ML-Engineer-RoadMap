'use client'

import { useTranslations } from 'next-intl'
import { useSession, signOut } from 'next-auth/react'
import { Link } from '@/navigation'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const t = useTranslations()
  const { data: session, status } = useSession()

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
              <Link
                href="/search"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Search
              </Link>
              {session && (
                <>
                  <Link
                    href="/bookmarks"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Bookmarks
                  </Link>
                  <Link
                    href="/badges"
                    className="text-sm font-medium hover:text-primary transition-colors"
                  >
                    Badges
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="text-sm text-muted-foreground">{t('common.loading')}</div>
            ) : session ? (
              <>
                {session.user?.role === 'admin' && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin">Admin</Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/profile">Profile</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">{t('nav.login')}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">{t('nav.signup')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
