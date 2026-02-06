"use client";

import RequireAuth from "../../../components/RequireAuth";
import { useAuth } from "../../../../lib/auth-context";
import { db } from "../../../../lib/firebase";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useEffect, useState } from "react";

export default function ManagePage() {
  return (
    <RequireAuth>
      <ManageInner />
    </RequireAuth>
  );
}

function ManageInner() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from"); // "dashboard" | "class" | null

  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const classId = params.id;

  const [cls, setCls] = useState(null);
  const [students, setStudents] = useState([]);

  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");

  // Load class + verify ownership
  useEffect(() => {
    async function loadClass() {
      const ref = doc(db, "classes", classId);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;

      const data = snap.data();
      if (data.teacherId !== user.uid) {
        router.replace("/dashboard");
        return;
      }
      setCls({ id: snap.id, ...data });
    }

    if (user && classId) loadClass();
  }, [user, classId, router]);

  // Load students
  useEffect(() => {
    if (!user || !classId) return;

    const q = query(
      collection(db, "classes", classId, "students"),
      orderBy("rollNo", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user, classId]);

  async function addStudent(e) {
    e.preventDefault();
    if (!studentName.trim() || !rollNo.trim()) return;

    await addDoc(collection(db, "classes", classId, "students"), {
      name: studentName.trim(),
      rollNo: rollNo.trim(),
      createdAt: serverTimestamp(),
    });

    // NOTE: later we will also create summary doc here (recommended)
    setStudentName("");
    setRollNo("");
  }

  if (!cls)
    return (
      <div className="min-h-[100dvh] bg-slate-100 text-slate-900 flex items-center justify-center p-4">
        <div className="rounded-2xl bg-white px-6 py-4 shadow flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
          <div className="font-semibold">Loading…</div>
        </div>
      </div>
    );

  return (
    <div className="min-h-[100dvh] bg-slate-100 p-4">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-5 shadow">
          <button
            onClick={() => {
              if (from === "dashboard") router.push("/dashboard");
              else router.push(`/class/${classId}`); // default = class page
            }}
            className="text-sm text-slate-600 hover:underline"
          >
            ← Back
          </button>



          <h1 className="mt-2 text-2xl font-bold">{cls.name}</h1>

          {cls.subject ? (
            <p className="text-sm text-slate-600">{cls.subject}</p>
          ) : null}

          <button
            onClick={() => router.push(`/class/${classId}/attendance`)}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Take Attendance (Today)
          </button>

          <form onSubmit={addStudent} className="mt-5 grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <input
                className="text-black w-full rounded-xl border px-3 py-2 outline-none focus:ring"
                placeholder="Student name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
              <input
                className="text-black w-full rounded-xl border px-3 py-2 outline-none focus:ring"
                placeholder="Roll No"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
              />
            </div>
            <button className="rounded-xl bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700">
              Add Student
            </button>
          </form>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-5 shadow">
          <h2 className="text-lg font-bold">Students ({students.length})</h2>

          {students.length === 0 ? (
            <p className="mt-2 text-sm text-slate-600">
              No students yet. Add some above.
            </p>
          ) : (
            <ul className="mt-3 grid gap-2">
              {students.map((s) => (
                <li key={s.id} className="flex items-center justify-between rounded-xl border p-3">
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-sm text-slate-600">Roll: {s.rollNo}</p>
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
