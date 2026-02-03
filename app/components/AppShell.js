"use client";

import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";

export default function AppShell({ children }) {
  const pathname = usePathname();

  // Hide nav on login page (and optionally others)
  const hideNav = pathname === "/login";

  return (
    <div className={hideNav ? "" : "pb-20"}>
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
}
