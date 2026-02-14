export default function Loading() {
  const PAGE_SIZE = 20;

  return (
    <main className="min-h-screen pb-20 p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-10 w-44 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border rounded-xl p-4 bg-gray-50 animate-pulse">
                <div className="h-5 w-36 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-52 bg-gray-200 rounded" />
              </div>
            ))}
          </div>

          {/* Helper line placeholder */}
          <div className="mt-4 h-4 w-72 bg-gray-200 rounded animate-pulse" />
          <div className="mt-2 h-4 w-56 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </main>
  );
}
