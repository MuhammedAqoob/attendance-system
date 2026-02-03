'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/history', label: 'History', icon: '🗓️' },
  { href: '/dashboard', label: 'Dashboard', icon: '🛠️' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-6xl mx-auto flex justify-around py-2">
        {tabs.map(t => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg ${
                active ? 'text-blue-700 font-semibold' : 'text-gray-600'
              }`}
            >
              <span className="text-lg">{t.icon}</span>
              <span className="text-xs">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
