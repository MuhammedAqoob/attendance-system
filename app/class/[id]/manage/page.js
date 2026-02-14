"use client";

import RequireAuth from "../../../components/RequireAuth";
import { useAuth } from "../../../../lib/auth-context";
import { db } from "../../../../lib/firebase";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
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
  const [classLoading, setClassLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(true);

  const searchParams = useSearchParams();
  const from = searchParams.get("from"); // "dashboard" | "class" | null

  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const classId = params.id;

  const [cls, setCls] = useState(null);
  const [students, setStudents] = useState([]);

  // edit class
  const [editName, setEditName] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [savingClass, setSavingClass] = useState(false);
  const [msg, setMsg] = useState("");

  // add student
  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);

  // Load class + verify ownership
  useEffect(() => {
    let alive = true;

    async function loadClass() {
      setClassLoading(true);
      try {
        const ref = doc(db, "classes", classId);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;

        const data = snap.data();
        if (data.teacherId !== user.uid) {
          router.replace("/dashboard");
          return;
        }

        if (!alive) return;

        setCls({ id: snap.id, ...data });
        setEditName(data.name || "");
        setEditSubject(data.subject || "");
      } finally {
        if (alive) setClassLoading(false);
      }
    }

    if (user && classId) loadClass();

    return () => {
      alive = false;
    };
  }, [user, classId, router]);


  // Load students
  useEffect(() => {
    if (!user || !classId) return;

    setStudentsLoading(true);

    const q = query(
      collection(db, "classes", classId, "students"),
      orderBy("rollNo", "asc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        setStudents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setStudentsLoading(false);
      },
      () => {
        setStudentsLoading(false);
      }
    );

    return () => unsub();
  }, [user, classId]);


  async function updateClassInfo(e) {
    e.preventDefault();
    if (!editName.trim()) return;

    setSavingClass(true);
    setMsg("");

    try {
      await updateDoc(doc(db, "classes", classId), {
        name: editName.trim(),
        subject: editSubject.trim(),
        updatedAt: serverTimestamp(),
      });
      setMsg("Class updated ✅");
    } catch (err) {
      setMsg(err?.message || "Failed to update class");
    } finally {
      setSavingClass(false);
      setTimeout(() => setMsg(""), 2000);
    }
  }

  async function addStudent(e) {
    e.preventDefault();
    if (!studentName.trim() || !rollNo.trim()) return;

    setAddingStudent(true);
    setMsg("");

    try {
      await addDoc(collection(db, "classes", classId, "students"), {
        name: studentName.trim(),
        rollNo: rollNo.trim(),
        createdAt: serverTimestamp(),
      });

      setStudentName("");
      setRollNo("");
      setMsg("Student added ✅");
    } catch (err) {
      setMsg(err?.message || "Failed to add student");
    } finally {
      setAddingStudent(false);
      setTimeout(() => setMsg(""), 2000);
    }
  }

  async function deleteStudent(studentId) {
    const ok = confirm("Delete this student? This cannot be undone.");
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "classes", classId, "students", studentId));
      // also delete summary (if exists)
      await deleteDoc(doc(db, "classes", classId, "summaries", studentId));
    } catch (err) {
      alert(err?.message || "Failed to delete student");
    }
  }

  async function deleteCollection(pathParts) {
    const colRef = collection(db, ...pathParts);
    const snap = await getDocs(colRef);
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  }

  async function deleteClass() {
    const ok = confirm(
      "Delete this class AND all students/attendance/summaries? This cannot be undone."
    );
    if (!ok) return;

    try {
      // delete subcollections first
      await deleteCollection(["classes", classId, "students"]);
      await deleteCollection(["classes", classId, "summaries"]);
      await deleteCollection(["classes", classId, "attendance"]);

      // then delete the class doc
      await deleteDoc(doc(db, "classes", classId));

      router.push("/dashboard");
    } catch (err) {
      alert(err?.message || "Failed to delete class");
    }
  }

  if (classLoading || !cls) {
    return (
      <div className="min-h-[100dvh] bg-slate-100 p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {/* Top card skeleton */}
          <div className="rounded-2xl bg-white p-5 shadow animate-pulse">
            <div className="h-4 w-20 bg-slate-200 rounded" />
            <div className="mt-3 h-7 w-48 bg-slate-200 rounded" />
            <div className="mt-2 h-4 w-64 bg-slate-200 rounded" />
            <div className="mt-4 h-10 w-56 bg-slate-200 rounded-xl" />
            <div className="mt-5 grid gap-3">
              <div className="h-10 bg-slate-200 rounded-xl" />
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          </div>

          {/* Students card skeleton */}
          <div className="rounded-2xl bg-white p-5 shadow animate-pulse">
            <div className="h-5 w-40 bg-slate-200 rounded" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl border bg-slate-50" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-[100dvh] bg-slate-100 p-4">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white p-5 shadow">
          <button
            onClick={() => {
              if (from === "dashboard") router.push("/dashboard");
              else router.push(`/class/${classId}`);
            }}
            className="text-sm text-slate-600 hover:underline"
          >
            ← Back
          </button>

          <h1 className="mt-2 text-2xl font-bold">{cls.name}</h1>
          {cls.subject ? (
            <p className="text-sm text-slate-600">{cls.subject}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => router.push(`/class/${classId}/attendance`)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Take Attendance (Today)
            </button>

            {msg ? <span className="text-sm font-semibold">{msg}</span> : null}
          </div>

          {/* Edit class info */}
          <form onSubmit={updateClassInfo} className="mt-5 grid gap-3">
            <div className="grid gap-2 md:grid-cols-2">
              <input
                className="text-black w-full rounded-xl border px-3 py-2 outline-none focus:ring"
                placeholder="Class name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
              <input
                className="text-black w-full rounded-xl border px-3 py-2 outline-none focus:ring"
                placeholder="Subject (optional)"
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
              />
            </div>
            <button
              disabled={savingClass}
              className="rounded-xl bg-blue-600 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {savingClass ? "Saving..." : "Save Class Info"}
            </button>
          </form>

          {/* Add student */}
          <form onSubmit={addStudent} className="mt-6 grid gap-3">
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
            <button
              disabled={addingStudent}
              className="rounded-xl bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {addingStudent ? "Adding..." : "Add Student"}
            </button>
          </form>
        </div>

        {/* Students list */}
        <div className="mt-4 rounded-2xl bg-white p-5 shadow">
          <h2 className="text-lg font-bold">Students ({students.length})</h2>

          {studentsLoading ? (
            <ul className="mt-3 grid gap-2 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <li key={i} className="flex items-center justify-between rounded-xl border p-3 bg-slate-50">
                  <div>
                    <div className="h-4 w-40 bg-slate-200 rounded" />
                    <div className="mt-2 h-3 w-24 bg-slate-200 rounded" />
                  </div>
                  <div className="h-9 w-20 bg-slate-200 rounded-xl" />
                </li>
              ))}
            </ul>
          ) : students.length === 0 ? (
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
                  <button
                    onClick={() => deleteStudent(s.id)}
                    className="rounded-xl border px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}

        </div>

        {/* Danger zone */}
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-5 shadow">
          <h3 className="font-bold text-red-700">Danger Zone</h3>
          <p className="mt-1 text-sm text-red-700">
            Deleting a class will remove students, summaries, and attendance.
          </p>

          <button
            onClick={deleteClass}
            className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Delete Class
          </button>

          <p className="mt-2 text-xs text-red-700">
            Note: This client-side delete works best for small data. For big classes / many days,
            a server-side delete (Cloud Function) is the proper way.
          </p>
        </div>
      </div>
    </div>
  );
}
