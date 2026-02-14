"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PercentRing from "./components/PercentRing";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user } = useAuth();

  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");

  const [topStudents, setTopStudents] = useState([]);

  const [classesLoading, setClassesLoading] = useState(true);
  const [topLoading, setTopLoading] = useState(true);


  const [role, setRole] = useState("guest"); // "teacher" | "student" | "guest"
  const [roleLoading, setRoleLoading] = useState(true);

  // Determine role: if logged in and owns at least one class => teacher, else student
  useEffect(() => {
    const detectRole = async () => {
      setRoleLoading(true);

      try {
        if (!user) {
          setRole("guest");
          return;
        }

        const q = query(
          collection(db, "classes"),
          where("teacherId", "==", user.uid),
          limit(1)
        );
        const snap = await getDocs(q);

        setRole(snap.docs.length > 0 ? "teacher" : "student");
      } catch {
        // if anything fails, don't block UI
        setRole(user ? "student" : "guest");
      } finally {
        setRoleLoading(false);
      }
    };

    detectRole();
  }, [user]);

  // load classes
  useEffect(() => {
    const load = async () => {
      setClassesLoading(true);
      try {
        const snap = await getDocs(collection(db, "classes"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setClasses(list);
        if (list.length) setClassId((prev) => prev || list[0].id);
      } finally {
        setClassesLoading(false);
      }
    };
    load();
  }, []);


  // load summaries for selected class, take top 4 by percent
  useEffect(() => {
    const loadTop = async () => {
      if (!classId) return;
      setTopLoading(true);
      try {
        const q = query(
          collection(db, "classes", classId, "summaries"),
          orderBy("percent", "desc"),
          limit(4)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setTopStudents(list);
      } finally {
        setTopLoading(false);
      }
    };
    loadTop();
  }, [classId]);


  const selectedClass = useMemo(
    () => classes.find((c) => c.id === classId),
    [classes, classId]
  );

  const roleLabel = useMemo(() => {
    if (roleLoading) return "Checking login…";
    if (role === "teacher") return `Logged in as Teacher`;
    if (role === "student") return `Logged in as Student`;
    return "Not logged in (Students)";
  }, [role, roleLoading, user]);

  return (
    <main className="min-h-screen pb-20 p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-800">📊 Attendance</h1>

          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="px-3 py-2 border rounded-lg text-gray-900"
            disabled={classesLoading || !classes.length}
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name || c.id}
              </option>
            ))}
          </select>
        </div>

        {/* Login status */}
        <div className="mb-6 text-sm text-gray-700">
          <span className="inline-flex min-w-[220px] items-center gap-2 rounded-full border bg-white px-3 py-1">
            <span
              className={`h-2 w-2 rounded-full ${roleLoading ? "bg-gray-400" : role === "teacher"
                ? "bg-green-600"
                : role === "student"
                  ? "bg-blue-600"
                  : "bg-slate-400"
                }`}
            />
            {roleLabel}
          </span>
        </div>

        {/* Classes list */}
        {/* Classes list */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {classesLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow p-5 h-[96px] animate-pulse"
              >
                <div className="h-5 w-40 bg-gray-200 rounded" />
                <div className="h-4 w-56 bg-gray-200 rounded mt-3" />
              </div>
            ))
          ) : (
            classes.map((c) => (
              <Link
                key={c.id}
                href={`/class/${c.id}`}
                className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition"
              >
                <div className="text-xl font-semibold text-gray-800">
                  {c.name || c.id}
                </div>
                <div className="text-gray-600 mt-1">Tap to view students →</div>
              </Link>
            ))
          )}
        </div>


        {/* Top students */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">🏆 Top attendance</h2>
            <div className="text-sm text-gray-600">
              {selectedClass?.name ? `Class: ${selectedClass.name}` : ""}
            </div>
          </div>

          {topLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="border rounded-xl p-4 bg-gray-50 h-[88px] animate-pulse"
                >
                  <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : topStudents.length === 0 ? (
            <div className="text-gray-700">
              No summaries yet. Teacher needs to mark attendance at least once.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topStudents.map((s) => (
                <div key={s.id} className="border rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center gap-3">
                    <PercentRing percent={s.percent ?? 0} />
                    <div>
                      <div className="font-semibold text-gray-800">
                        {s.name || "Student"}
                      </div>
                      <div className="text-sm text-gray-600">{s.roll || s.id}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        P:{s.present ?? 0} A:{s.absent ?? 0} T:{s.total ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
