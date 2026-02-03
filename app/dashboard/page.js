"use client";

import { useRouter } from "next/navigation";
import RequireAuth from "../components/RequireAuth";
import { useAuth } from "../../lib/auth-context";
import { auth, db } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}

function DashboardInner() {
  const router = useRouter();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "classes"),
      where("teacherId", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      setClasses(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });

    return () => unsub();
  }, [user]);

  async function createClass(e) {
    e.preventDefault();
    if (!name.trim()) return;

    await addDoc(collection(db, "classes"), {
      name: name.trim(),
      subject: subject.trim(),
      teacherId: user.uid,
      createdAt: serverTimestamp(),
      totalStudents: 0,
      totalWorkingDays: 0,
    });

    setName("");
    setSubject("");
  }

  return (
    <div className="text-black min-h-[100dvh] bg-slate-100 p-4 pb-20">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-5 shadow">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
              <p className="text-sm text-slate-600">
                Logged in as <span className="font-medium">{user?.email}</span>
              </p>
            </div>

            <button
              onClick={async () => {
                await signOut(auth);
                router.replace("/login");
              }}
              className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
            >
              Logout
            </button>
          </div>

          <form onSubmit={createClass} className="mt-5 grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <input
                className="text-black w-full rounded-xl border px-3 py-2 outline-none focus:ring"
                placeholder='Class name (e.g., "S3 CSE A")'
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="text-black w-full rounded-xl border px-3 py-2 outline-none focus:ring"
                placeholder='Subject (optional) e.g., "Graph Theory"'
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <button className="rounded-xl bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700">
              Create Class
            </button>
          </form>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-5 shadow">
          <h2 className="text-lg font-bold">Your Classes</h2>

          {classes.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              No classes yet. Create one above.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {classes.map((c) => (
                <li key={c.id} className="rounded-xl border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      {c.subject ? (
                        <p className="text-sm text-slate-600">{c.subject}</p>
                      ) : null}
                    </div>

                    <Link
                      className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                      href={`/class/${c.id}`}
                    >
                      Open
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}
