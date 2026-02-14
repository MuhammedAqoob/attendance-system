"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  // ✅ While checking auth status
  if (loading) return <div className="min-h-[100dvh]" />;


  // ✅ While redirecting
  if (!user) return null;

  return children;
}
