export default function Loading() {
  return (
    <div className="min-h-[100dvh] bg-slate-100 p-4 pb-20">
      <div className="mx-auto max-w-3xl space-y-4">
        {/* Top card */}
        <div className="rounded-2xl bg-white p-5 shadow animate-pulse">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-200 rounded" />
              <div className="h-4 w-64 bg-slate-200 rounded" />
            </div>
            <div className="h-10 w-24 bg-slate-200 rounded-xl" />
          </div>

          <div className="mt-5 grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <div className="h-10 w-full bg-slate-200 rounded-xl" />
              <div className="h-10 w-full bg-slate-200 rounded-xl" />
            </div>
            <div className="h-10 w-40 bg-slate-200 rounded-xl" />
          </div>
        </div>

        {/* Classes card */}
        <div className="rounded-2xl bg-white p-5 shadow animate-pulse">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="mt-4 grid gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-3 bg-slate-50">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-slate-200 rounded" />
                    <div className="h-3 w-32 bg-slate-200 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-24 bg-slate-200 rounded-xl" />
                    <div className="h-9 w-24 bg-slate-200 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
