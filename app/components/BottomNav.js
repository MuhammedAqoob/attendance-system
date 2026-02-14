"use client";

import { memo, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/history", label: "History", icon: "🗓️" },
  { href: "/dashboard", label: "Dashboard", icon: "🛠️" },
];

function BottomNavInner() {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState(null);

  useEffect(() => setPendingHref(null), [pathname]);

  const activeHref = pendingHref ?? pathname;
  const items = useMemo(() => tabs, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow">
      <div className="max-w-6xl mx-auto flex justify-around py-2">
        {items.map((t) => {
          const active = activeHref === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              prefetch
              onClick={() => {
                if (pathname !== t.href) setPendingHref(t.href);
              }}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg select-none ${
                active ? "text-blue-700 font-semibold" : "text-gray-600"
              }`}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              <span className="text-xs leading-none">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default memo(BottomNavInner);
