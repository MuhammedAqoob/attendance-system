export default function Loading() {
  return (
    <div className="min-h-[100dvh] bg-slate-100 p-4">
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="rounded-2xl bg-white p-5 shadow animate-pulse">
          <div className="h-4 w-20 bg-slate-200 rounded" />
          <div className="mt-3 h-6 w-48 bg-slate-200 rounded" />
          <div className="mt-2 h-4 w-56 bg-slate-200 rounded" />
          <div className="mt-4 h-10 w-28 bg-slate-200 rounded-xl" />
        </div>

        <div className="rounded-2xl bg-white p-5 shadow animate-pulse">
          <div className="h-5 w-56 bg-slate-200 rounded" />
          <div className="mt-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-3 bg-slate-50">
                <div className="h-4 w-40 bg-slate-200 rounded" />
                <div className="mt-2 h-3 w-24 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

