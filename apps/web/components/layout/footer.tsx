import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'

export function Footer() {
  const t = useTranslations()

  return (
    <footer className="border-t bg-background mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-lg font-bold mb-2">🚀 ML Engineer Roadmap</h3>
            <p className="text-sm text-muted-foreground">
              {t('roadmap.subtitle')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/roadmap" className="text-muted-foreground hover:text-primary">
                  {t('nav.roadmap')}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary">
                  {t('nav.dashboard')}
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-muted-foreground hover:text-primary">
                  {t('nav.resources')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  {t('footer.terms')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  )
}
