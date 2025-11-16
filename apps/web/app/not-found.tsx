import { NotFoundState } from '@/components/ui/error-state'

export default function NotFound() {
  return (
    <NotFoundState
      title="Page Not Found"
      message="The page you're looking for doesn't exist or has been moved."
      backHref="/"
    />
  )
}
