export default function Loading() {
  return (
    <div className="min-h-[100dvh] bg-slate-100 p-4">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-5 shadow">
          <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-64 animate-pulse rounded bg-slate-200" />
          <div className="mt-6 grid gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl border bg-slate-50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
