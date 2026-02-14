export default function Loading() {
  return (
    <div className="min-h-[100dvh] bg-slate-100 p-6">
      <div className="mx-auto max-w-4xl space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-10 w-28 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        {/* Big card */}
        <div className="bg-white rounded-2xl shadow p-5 animate-pulse">
          <div className="h-5 w-56 bg-slate-200 rounded" />
          <div className="mt-3 h-4 w-72 bg-slate-200 rounded" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
