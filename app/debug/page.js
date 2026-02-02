"use client";

import { useAuth } from "../../lib/auth-context";

export default function DebugPage() {
  const { user, loading } = useAuth();

  return (
    <div style={{ padding: 20, fontFamily: "monospace" }}>
      <h1>Auth Debug</h1>
      <p>loading: {String(loading)}</p>
      <p>user: {user ? user.email : "null"}</p>
    </div>
  );
}
