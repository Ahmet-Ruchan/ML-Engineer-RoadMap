export function LoadingCard() {
  return (
    <div className="border rounded-lg p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-6 bg-muted rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="h-10 w-20 bg-muted rounded"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-muted rounded w-full"></div>
        <div className="h-3 bg-muted rounded w-5/6"></div>
      </div>
    </div>
  )
}

export function LoadingGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-8">
          {/* Header skeleton */}
          <div className="space-y-4">
            <div className="h-10 bg-muted rounded w-2/3"></div>
            <div className="h-5 bg-muted rounded w-1/2"></div>
          </div>

          {/* Content skeleton */}
          <div className="space-y-4">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        </div>
      </div>
    </div>
  )
}
