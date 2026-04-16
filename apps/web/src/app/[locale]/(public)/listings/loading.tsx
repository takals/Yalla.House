export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto animate-pulse">
      {/* Title skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-border-default rounded-lg w-48 mb-2" />
        <div className="h-4 bg-border-default rounded w-72" />
      </div>

      {/* Grid of 6 property card skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-surface rounded-card overflow-hidden">
            {/* Image placeholder */}
            <div className="h-48 bg-border-default w-full" />
            {/* Text + price */}
            <div className="p-4">
              <div className="h-5 bg-border-default rounded w-3/4 mb-2" />
              <div className="h-3 bg-border-default rounded w-full mb-3" />
              <div className="flex items-center justify-between">
                <div className="h-5 bg-border-default rounded w-24" />
                <div className="h-6 bg-border-default rounded-lg w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
