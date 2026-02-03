"use client";

import { db } from "../../../../../lib/firebase";
import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    orderBy,
    query,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AttendanceDayPage() {
    const params = useParams();
    const router = useRouter();

    const classId = params.id;
    const dateId = params.date;

    const [cls, setCls] = useState(null);
    const [students, setStudents] = useState([]);
    const [presentSet, setPresentSet] = useState(new Set());
    const [loading, setLoading] = useState(true);

    // Load class (public)
    useEffect(() => {
        async function loadClass() {
            const ref = doc(db, "classes", classId);
            const snap = await getDoc(ref);
            if (snap.exists()) setCls({ id: snap.id, ...snap.data() });
        }
        if (classId) loadClass();
    }, [classId]);

    // Load students (public)
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

    // Load attendance for that date (public)
    useEffect(() => {
        if (!classId || !dateId) return;

        setLoading(true);
        const ref = doc(db, "classes", classId, "attendance", dateId);

        const unsub = onSnapshot(ref, (snap) => {
            if (!snap.exists()) {
                setPresentSet(new Set());
                setLoading(false);
                return;
            }
            const data = snap.data();
            const present = Array.isArray(data.present) ? data.present : [];
            setPresentSet(new Set(present));
            setLoading(false);
        });

        return () => unsub();
    }, [classId, dateId]);

    const presentCount = useMemo(() => presentSet.size, [presentSet]);
    const absentCount = useMemo(
        () => Math.max(0, students.length - presentSet.size),
        [students.length, presentSet]
    );

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


                    <h1 className="mt-2 text-2xl font-bold">{cls.name}</h1>
                    <p className="text-sm text-slate-600">
                        Attendance date: <span className="font-semibold">{dateId}</span>
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="rounded-xl border bg-green-50 p-3">
                            <div className="text-sm text-slate-600">Present</div>
                            <div className="text-2xl font-bold text-green-700">{presentCount}</div>
                        </div>
                        <div className="rounded-xl border bg-red-50 p-3">
                            <div className="text-sm text-slate-600">Absent</div>
                            <div className="text-2xl font-bold text-red-700">{absentCount}</div>
                        </div>
                        <div className="rounded-xl border bg-slate-50 p-3">
                            <div className="text-sm text-slate-600">Total</div>
                            <div className="text-2xl font-bold text-slate-900">{students.length}</div>
                        </div>
                    </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white p-5 shadow">
                    <h2 className="text-lg font-bold">
                        Students ({students.length})
                    </h2>

                    {loading ? (
                        <p className="mt-2 text-sm text-slate-600">Loading attendance…</p>
                    ) : students.length === 0 ? (
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
                                        <div>
                                            <p className="font-semibold">{s.name || "Unnamed"}</p>
                                            <p className="text-sm text-slate-600">Roll: {s.rollNo}</p>
                                        </div>

                                        <span
                                            className={`rounded-xl px-3 py-2 text-sm font-semibold ${isPresent
                                                    ? "bg-green-600 text-white"
                                                    : "bg-red-600 text-white"
                                                }`}
                                        >
                                            {isPresent ? "Present" : "Absent"}
                                        </span>
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
