export default function Loading() {
  return (
    <div className="min-h-[100dvh] bg-slate-100 text-slate-900 flex items-center justify-center p-4">
      <div className="rounded-2xl bg-white px-6 py-5 shadow">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          <div className="font-semibold">Loading attendance…</div>
        </div>
      </div>
    </div>
  );
}
