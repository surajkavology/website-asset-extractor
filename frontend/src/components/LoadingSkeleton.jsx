export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 mt-8 fade-in">
      <div className="flex gap-2">
        {[120, 80, 90, 70, 85, 75, 100].map((w, i) => (
          <div key={i} className="skeleton h-10 rounded-full" style={{ width: w }} />
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-2">
            <div className="skeleton w-full h-40 mb-2" />
            <div className="skeleton h-3 w-3/4 mb-1" />
            <div className="skeleton h-3 w-1/2" />
          </div>
        ))}
      </div>

      <div className="card p-4 space-y-3">
        <div className="skeleton h-5 w-40" />
        <div className="flex gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton w-10 h-10 rounded-full" />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="card p-4 space-y-3">
          <div className="skeleton h-5 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-4 w-full" />
          ))}
        </div>
        <div className="card p-4 space-y-3">
          <div className="skeleton h-5 w-32" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
