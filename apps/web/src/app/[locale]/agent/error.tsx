'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-surface rounded-card p-10 text-center max-w-sm">
        <p className="font-bold mb-2">Something went wrong</p>
        <p className="text-sm text-[#5E6278] mb-4">We couldn&apos;t load this page. Please try again.</p>
        <button onClick={reset} className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors">
          Try again
        </button>
      </div>
    </div>
  )
}
