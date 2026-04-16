export default function Loading() {
  return (
    <div className="max-w-6xl animate-pulse">
      {/* Title skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-border-default rounded-lg w-52 mb-2" />
        <div className="h-4 bg-border-default rounded w-60" />
      </div>

      {/* Stats row — 3 cards: assignments, viewings, hunters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-surface rounded-card p-6">
            <div className="h-8 bg-border-default rounded w-16 mb-2" />
            <div className="h-4 bg-border-default rounded w-24" />
          </div>
        ))}
      </div>

      {/* List items */}
      <div className="bg-surface rounded-card p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 py-3 border-b border-border-light last:border-0"
            >
              <div className="h-10 w-10 bg-border-default rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-border-default rounded w-3/4 mb-2" />
                <div className="h-3 bg-border-default rounded w-1/2" />
              </div>
              <div className="h-6 bg-border-default rounded-lg w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
