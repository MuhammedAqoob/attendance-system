export default function Loading() {
  return (
    <div className="min-h-[100dvh] bg-slate-100 p-4">
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Header card skeleton */}
        <div className="rounded-2xl bg-white p-5 shadow animate-pulse">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <div className="mt-3 h-6 w-48 bg-slate-200 rounded" />
          <div className="mt-2 h-4 w-56 bg-slate-200 rounded" />

          <div className="mt-4 grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-slate-50 p-3">
                <div className="h-3 w-16 bg-slate-200 rounded" />
                <div className="mt-2 h-6 w-10 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Students card skeleton */}
        <div className="rounded-2xl bg-white p-5 shadow animate-pulse">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <ul className="mt-4 grid gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-xl border p-3 bg-slate-50"
              >
                <div>
                  <div className="h-4 w-40 bg-slate-200 rounded" />
                  <div className="mt-2 h-3 w-24 bg-slate-200 rounded" />
                </div>
                <div className="h-9 w-24 bg-slate-200 rounded-xl" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
