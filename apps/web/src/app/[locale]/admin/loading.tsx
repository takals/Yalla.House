export default function Loading() {
  return (
    <div className="max-w-6xl animate-pulse">
      {/* Title skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-border-default rounded-lg w-44 mb-2" />
        <div className="h-4 bg-border-default rounded w-56" />
      </div>

      {/* Big stat card — total users */}
      <div className="bg-surface rounded-card p-8 mb-8">
        <div className="h-10 bg-border-default rounded w-24 mb-3" />
        <div className="h-5 bg-border-default rounded w-32" />
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="h-10 bg-surface rounded-lg border border-border-light w-full max-w-md" />
      </div>

      {/* List skeleton */}
      <div className="bg-surface rounded-card p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-3 border-b border-border-light last:border-0"
            >
              <div className="h-10 w-10 bg-border-default rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-border-default rounded w-1/3 mb-2" />
                <div className="h-3 bg-border-default rounded w-1/4" />
              </div>
              <div className="h-6 bg-border-default rounded-lg w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
