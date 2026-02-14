"use client";

export default function Skeleton({ className = "" }) {
  return (
    <div
      className={`animate-pulse rounded bg-gray-200/80 ${className}`}
      aria-hidden="true"
    />
  );
}
