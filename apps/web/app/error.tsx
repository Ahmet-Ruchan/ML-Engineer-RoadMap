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

  // Get user-friendly error message
  const getErrorMessage = () => {
    if (error.message) {
      // Handle common error messages
      if (error.message.includes('map is not a function')) {
        return 'Data format error. Please try refreshing the page.'
      }
      if (error.message.includes('Cannot read')) {
        return 'Missing data. Please try again.'
      }
      if (error.message.includes('Network')) {
        return 'Network error. Please check your connection and try again.'
      }
      return error.message
    }
    return 'An unexpected error occurred. Please try again.'
  }

  return (
    <ErrorState
      title="Oops! Something went wrong"
      message={getErrorMessage()}
      retry={reset}
      showBackButton={true}
    />
  )
}
