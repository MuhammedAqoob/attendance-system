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
    const [classLoading, setClassLoading] = useState(true);
    const [studentsLoading, setStudentsLoading] = useState(true);

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
        let alive = true;

        async function loadClass() {
            setClassLoading(true);
            try {
                const ref = doc(db, "classes", classId);
                const snap = await getDoc(ref);
                if (!snap.exists()) {
                    if (alive) setCls(null);
                    return;
                }

                const data = snap.data();
                if (data.teacherId !== user.uid) {
                    if (alive) setClassLoading(false);
                    router.replace("/dashboard");
                    return;
                }


                if (alive) setCls({ id: snap.id, ...data });
            } finally {
                if (alive) setClassLoading(false);
            }
        }

        if (user && classId) loadClass();

        return () => {
            alive = false;
        };
    }, [user, classId, router]);


    // Load students list
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
                // on error, stop loading so UI doesn't hang forever
                setStudentsLoading(false);
            }
        );

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


    if (classLoading) {
        return (
            <div className="min-h-[100dvh] bg-slate-100 p-4">
                <div className="mx-auto max-w-3xl space-y-4">
                    {/* Top card skeleton */}
                    <div className="rounded-2xl bg-white p-5 shadow animate-pulse">
                        <div className="h-4 w-20 bg-slate-200 rounded" />
                        <div className="mt-3 h-6 w-52 bg-slate-200 rounded" />
                        <div className="mt-2 h-4 w-56 bg-slate-200 rounded" />
                        <div className="mt-4 flex flex-wrap gap-2">
                            <div className="h-10 w-28 bg-slate-200 rounded-xl" />
                            <div className="h-10 w-32 bg-slate-200 rounded-xl" />
                            <div className="h-10 w-24 bg-slate-200 rounded-xl ml-auto" />
                        </div>
                    </div>

                    {/* Students card skeleton */}
                    <div className="rounded-2xl bg-white p-5 shadow animate-pulse">
                        <div className="h-5 w-64 bg-slate-200 rounded" />
                        <ul className="mt-4 grid gap-2">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <li key={i} className="flex items-center justify-between rounded-xl border p-3 bg-slate-50">
                                    <div>
                                        <div className="h-4 w-40 bg-slate-200 rounded" />
                                        <div className="mt-2 h-3 w-24 bg-slate-200 rounded" />
                                    </div>
                                    <div className="h-9 w-24 bg-slate-200 rounded-xl" />
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }


    if (!cls) {
        return (
            <div className="min-h-[100dvh] bg-slate-100 text-slate-900 flex items-center justify-center p-4">
                <div className="rounded-2xl bg-white px-6 py-4 shadow">
                    <div className="font-semibold">Class not found.</div>
                    <button
                        onClick={() => router.replace("/dashboard")}
                        className="mt-3 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }


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

                    {studentsLoading ? (
                        <ul className="mt-3 grid gap-2">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <li
                                    key={i}
                                    className="flex items-center justify-between rounded-xl border p-3 animate-pulse"
                                >
                                    <div>
                                        <div className="h-4 w-40 bg-slate-200 rounded" />
                                        <div className="mt-2 h-3 w-24 bg-slate-200 rounded" />
                                    </div>
                                    <div className="h-9 w-24 bg-slate-200 rounded-xl" />
                                </li>
                            ))}
                        </ul>
                    ) : students.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-600">No students found.</p>
                    ) : (
                        <ul className="mt-3 grid gap-2">
                            {students.map((s) => {
                                const isPresent = presentSet.has(s.id);
                                return (
                                    <li key={s.id} className="flex items-center justify-between rounded-xl border p-3">
                                        <div className="text-black">
                                            <p className="font-semibold">{s.name ? s.name : "Unnamed student"}</p>
                                            <p className="text-sm text-slate-600">Roll: {s.rollNo}</p>
                                        </div>
                                        <button
                                            onClick={() => toggle(s.id)}
                                            className={`rounded-xl px-3 py-2 text-sm font-semibold ${isPresent ? "bg-green-600 text-white" : "bg-slate-200 text-slate-800"
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
