'use client'

import { useEffect } from 'react'
import { ErrorState } from '@/components/ui/error-state'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Application error:', error)
  }, [error])

  return (
    <ErrorState
      title="Oops! Something went wrong"
      message={error.message || 'An unexpected error occurred. Please try again.'}
      retry={reset}
    />
  )
}
