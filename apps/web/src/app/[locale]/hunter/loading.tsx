export default function Loading() {
  return (
    <div className="max-w-6xl animate-pulse">
      {/* Title skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-border-default rounded-lg w-48 mb-2" />
        <div className="h-4 bg-border-default rounded w-64" />
      </div>

      {/* Stats row — 3 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface rounded-card p-6">
            <div className="h-8 bg-border-default rounded w-16 mb-2" />
            <div className="h-4 bg-border-default rounded w-24" />
          </div>
        ))}
      </div>

      {/* Card-style items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface rounded-card p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 bg-border-default rounded-card" />
              <div className="flex-1">
                <div className="h-5 bg-border-default rounded w-3/4 mb-2" />
                <div className="h-3 bg-border-default rounded w-1/2" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-6 bg-border-default rounded-lg w-16" />
              <div className="h-6 bg-border-default rounded-lg w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
