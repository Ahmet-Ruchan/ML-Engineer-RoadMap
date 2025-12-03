'use client'

import { useRouter } from 'next/navigation'
import { Button } from './button'
import { Card, CardContent } from './card'

interface ErrorStateProps {
  title?: string
  message?: string
  retry?: () => void
  showBackButton?: boolean
  backHref?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this page.',
  retry,
  showBackButton = true,
  backHref
}: ErrorStateProps) {
  const router = useRouter()

  const handleGoBack = () => {
    if (backHref) {
      router.push(backHref)
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground mb-6 text-center">{message}</p>
            <div className="flex gap-4 flex-wrap justify-center">
              {retry && (
                <Button onClick={retry}>Try Again</Button>
              )}
              {showBackButton && (
                <Button variant="outline" onClick={handleGoBack}>
                  Go Back
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push('/')}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function NotFoundState({
  title = 'Not Found',
  message = 'The page you are looking for does not exist.',
  backHref = '/'
}: {
  title?: string
  message?: string
  backHref?: string
}) {
  const router = useRouter()

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(backHref)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="text-6xl mb-4">404</div>
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground mb-6 text-center">{message}</p>
            <div className="flex gap-4 flex-wrap justify-center">
              <Button variant="outline" onClick={handleGoBack}>
                Go Back
              </Button>
              <Button onClick={() => router.push(backHref)}>
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function EmptyState({
  icon = '📭',
  title = 'No items found',
  message,
  action
}: {
  icon?: string
  title?: string
  message?: string
  action?: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        {message && (
          <p className="text-muted-foreground mb-6 text-center">{message}</p>
        )}
        {action}
      </CardContent>
    </Card>
  )
}
