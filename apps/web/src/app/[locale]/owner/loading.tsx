export default function Loading() {
  return (
    <div className="max-w-6xl animate-pulse">
      {/* Title skeleton */}
      <div className="mb-6">
        <div className="h-8 bg-border-default rounded-lg w-56 mb-2" />
        <div className="h-4 bg-border-default rounded w-72" />
      </div>

      {/* Stats row — 4 cards: listings, viewings, offers, messages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-surface rounded-card p-6">
            <div className="h-8 bg-border-default rounded w-16 mb-2" />
            <div className="h-4 bg-border-default rounded w-24" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="bg-surface rounded-card p-6">
        {/* Table header */}
        <div className="flex items-center gap-6 pb-4 mb-4 border-b border-border-light">
          <div className="h-4 bg-border-default rounded w-32" />
          <div className="h-4 bg-border-default rounded w-24" />
          <div className="h-4 bg-border-default rounded w-20" />
          <div className="h-4 bg-border-default rounded w-20" />
          <div className="h-4 bg-border-default rounded w-16" />
        </div>
        {/* Table rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-6 py-4 border-b border-border-light last:border-0"
          >
            <div className="h-4 bg-border-default rounded w-32" />
            <div className="h-4 bg-border-default rounded w-24" />
            <div className="h-4 bg-border-default rounded w-20" />
            <div className="h-4 bg-border-default rounded w-20" />
            <div className="h-6 bg-border-default rounded-lg w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
