"use client";

import { db } from "../../../lib/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../../lib/auth-context";

export default function ClassPage() {
  const { user } = useAuth(); // might be null for students
  const params = useParams();
  const router = useRouter();
  const classId = params.id;

  const [cls, setCls] = useState(null);
  const [students, setStudents] = useState([]);
  const [summaries, setSummaries] = useState({}); // { studentId: summary }

  // Load class (PUBLIC)
  useEffect(() => {
    async function loadClass() {
      const ref = doc(db, "classes", classId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      setCls({ id: snap.id, ...snap.data() });
    }
    if (classId) loadClass();
  }, [classId]);

  // Load students list (PUBLIC)
  useEffect(() => {
    if (!classId) return;

    const q = query(
      collection(db, "classes", classId, "students"),
      orderBy("rollNo", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [classId]);

  // Load summaries (PUBLIC) — so we can show %
  useEffect(() => {
    if (!classId) return;

    const q = collection(db, "classes", classId, "summaries");
    const unsub = onSnapshot(q, (snap) => {
      const map = {};
      snap.docs.forEach((d) => (map[d.id] = d.data()));
      setSummaries(map);
    });

    return () => unsub();
  }, [classId]);

  if (!cls)
    return (
      <div className="min-h-[100dvh] bg-slate-100 text-slate-900 flex items-center justify-center p-4">
        <div className="rounded-2xl bg-white px-6 py-4 shadow flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          <div className="font-semibold">Loading…</div>
        </div>
      </div>
    );

  const isOwner = user && cls.teacherId === user.uid;

  return (
    <div className="min-h-[100dvh] bg-slate-100 p-4">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-5 shadow">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-slate-600 hover:underline"
          >
            ← Back
          </button>

          <div className="mt-2 flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{cls.name}</h1>
              {cls.subject ? (
                <p className="text-sm text-slate-600">{cls.subject}</p>
              ) : null}
            </div>

            {isOwner ? (
              <Link
                href={`/class/${classId}/manage`}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Manage
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-5 shadow">
          <h2 className="text-lg font-bold">Students ({students.length})</h2>

          {students.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              No students yet.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {students.map((s) => {
                const sum = summaries[s.id];
                const percent =
                  typeof sum?.percent === "number" ? sum.percent.toFixed(0) : "—";

                return (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-xl border p-3"
                  >
                    <div>
                      <p className="font-semibold">{s.name}</p>
                      <p className="text-sm text-slate-600">Roll: {s.rollNo}</p>
                    </div>

                    <Link
                      href={`/class/${classId}/student/${s.id}`}
                      className="rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                      {percent}% →
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
