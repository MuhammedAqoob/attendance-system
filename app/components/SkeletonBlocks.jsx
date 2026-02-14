"use client";

import Skeleton from "./Skeleton";

export function CardSkeleton({ lines = 2 }) {
  return (
    <div className="bg-white rounded-xl shadow p-5">
      <Skeleton className="h-5 w-40" />
      <div className="mt-3 grid gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full max-w-[260px]" />
        ))}
      </div>
    </div>
  );
}

export function ListRowSkeleton() {
  return (
    <div className="rounded-xl border p-3 bg-white">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-24 mt-2" />
    </div>
  );
}

export function GridSkeleton({ count = 4 }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border rounded-xl p-4 bg-gray-50 h-[88px]">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </div>
  );
}
