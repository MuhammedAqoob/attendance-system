"use client";

import RequireAuth from "../../../components/RequireAuth";
import { useAuth } from "../../../../lib/auth-context";
import { db } from "../../../../lib/firebase";
import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

function todayYYYYMMDD() {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

export default function AttendancePage() {
    return (
        <RequireAuth>
            <AttendanceInner />
        </RequireAuth>
    );
}

function AttendanceInner() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();

    const classId = params.id;
    const dateId = useMemo(() => todayYYYYMMDD(), []);

    const [cls, setCls] = useState(null);
    const [students, setStudents] = useState([]);
    const [presentSet, setPresentSet] = useState(new Set());
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState("");

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

    // Load students list
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

    // Load today's attendance doc (if exists)
    useEffect(() => {
        if (!user || !classId) return;

        const ref = doc(db, "classes", classId, "attendance", dateId);

        const unsub = onSnapshot(ref, (snap) => {
            if (!snap.exists()) {
                setPresentSet(new Set());
                return;
            }
            const data = snap.data();
            const present = Array.isArray(data.present) ? data.present : [];
            setPresentSet(new Set(present));
        });

        return () => unsub();
    }, [user, classId, dateId]);

    function toggle(id) {
        setPresentSet((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function markAllPresent() {
        setPresentSet(new Set(students.map((s) => s.id)));
    }

    function clearAll() {
        setPresentSet(new Set());
    }

    async function save() {
    setSaving(true);
    setStatus("");

    try {
        const attendanceRef = doc(
            db,
            "classes",
            classId,
            "attendance",
            dateId
        );

        // Get previous attendance
        const prevSnap = await getDoc(attendanceRef);
        const prevData = prevSnap.exists() ? prevSnap.data() : null;
        const prevPresent = new Set(prevData?.present || []);

        // Save new attendance
        await setDoc(
            attendanceRef,
            {
                present: Array.from(presentSet),
                updatedAt: serverTimestamp(),
                teacherId: user.uid,
                date: dateId,
                totalStudents: students.length,
            },
            { merge: true }
        );

        // Update summaries
        for (const s of students) {
            const studentId = s.id;
            const summaryRef = doc(
                db,
                "classes",
                classId,
                "summaries",
                studentId
            );

            const sumSnap = await getDoc(summaryRef);

            let present = 0;
            let absent = 0;
            let total = 0;
            let lastDate = null;

            if (sumSnap.exists()) {
                const data = sumSnap.data();
                present = data.present || 0;
                absent = data.absent || 0;
                total = data.total || 0;
                lastDate = data.lastDate || null;
            }

            const wasPresent = prevPresent.has(studentId);
            const isPresent = presentSet.has(studentId);

            // First save for that day
            if (lastDate !== dateId) {
                total += 1;
                if (isPresent) present += 1;
                else absent += 1;
            } else {
                // Editing same day: adjust counters
                if (wasPresent && !isPresent) {
                    present -= 1;
                    absent += 1;
                } else if (!wasPresent && isPresent) {
                    absent -= 1;
                    present += 1;
                }
            }

            const percent =
                total > 0 ? (present / total) * 100 : 0;

            await setDoc(
                summaryRef,
                {
                    name: s.name || null,
                    roll: s.rollNo || null,
                    present,
                    absent,
                    total,
                    percent,
                    lastStatus: isPresent ? "present" : "absent",
                    lastDate: dateId,
                    updatedAt: serverTimestamp(),
                },
                { merge: true }
            );
        }

        setStatus("Saved ✅");
    } catch (e) {
        setStatus(e?.message || "Save failed");
    } finally {
        setSaving(false);
        setTimeout(() => setStatus(""), 2000);
    }
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
                        onClick={() => router.back()}
                        className="text-sm text-slate-600 hover:underline"
                    >
                        ← Back
                    </button>

                    <div className="mt-2 flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold">{cls.name}</h1>
                            <p className="text-sm text-slate-600">
                                Attendance for: <span className="font-semibold">{dateId}</span>
                            </p>
                        </div>

                        <button
                            onClick={save}
                            disabled={saving}
                            className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {saving ? "Saving..." : "Save"}
                        </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            onClick={markAllPresent}
                            className="text-black rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                        >
                            Mark all present
                        </button>
                        <button
                            onClick={clearAll}
                            className="text-black rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                        >
                            Clear all
                        </button>
                        {status ? (
                            <span className="ml-auto text-sm font-semibold">{status}</span>
                        ) : null}
                    </div>
                </div>

                <div className="text-black mt-4 rounded-2xl bg-white p-5 shadow">
                    <h2 className="text-lg font-bold">
                        Students ({students.length}) — Present: {presentSet.size}
                    </h2>

                    {students.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-600">No students found.</p>
                    ) : (
                        <ul className="mt-3 grid gap-2">
                            {students.map((s) => {
                                const isPresent = presentSet.has(s.id);
                                return (
                                    <li
                                        key={s.id}
                                        className="flex items-center justify-between rounded-xl border p-3"
                                    >
                                        <div className="text-black">
                                            <p className="font-semibold">
                                                {s.name ? s.name : "Unnamed student"}
                                            </p>
                                            <p className="text-sm text-slate-600">Roll: {s.rollNo}</p>

                                        </div>


                                        <button
                                            onClick={() => toggle(s.id)}
                                            className={`rounded-xl px-3 py-2 text-sm font-semibold ${isPresent
                                                ? "bg-green-600 text-white"
                                                : "bg-slate-200 text-slate-800"
                                                }`}
                                        >
                                            {isPresent ? "Present" : "Absent"}
                                        </button>
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
