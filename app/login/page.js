"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      // ✅ keep teacher logged in
      await setPersistence(auth, browserLocalPersistence);

      // ✅ login
      await signInWithEmailAndPassword(auth, email, password);

      // ✅ go back to where user came from
      router.replace(next);
    } catch (e) {
      setErr(e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Teacher Login</h1>
        <p className="mt-1 text-sm text-slate-600">
          Login to edit attendance. Students can only view.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-3">
          <input
            className="text-black w-full rounded-xl border px-3 py-2 outline-none focus:ring"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
          <input
            className="text-black w-full rounded-xl border px-3 py-2 outline-none focus:ring"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />

          <button
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {err && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {err}
          </p>
        )}
      </div>
    </div>
  );
}
