"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

function monthKeyFromYYYYMMDD(dateId) {
  // dateId: "YYYY-MM-DD"
  if (!dateId || dateId.length < 7) return "";
  return dateId.slice(0, 7); // "YYYY-MM"
}

function monthLabel(yyyyMm) {
  // "YYYY-MM" -> "Feb 2026"
  const [y, m] = yyyyMm.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const idx = Number(m) - 1;
  if (!y || idx < 0 || idx > 11) return yyyyMm;
  return `${months[idx]} ${y}`;
}

export default function HistoryPage() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  // month filter
  const [month, setMonth] = useState("all"); // "all" or "YYYY-MM"
  const PAGE_SIZE = 20;

  // load classes
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "classes"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setClasses(list);

        // restore last selected class
        const saved = sessionStorage.getItem("historyClassId");
        const found = saved && list.some((c) => c.id === saved);

        if (found) setClassId(saved);
        else if (list.length) setClassId(list[0].id);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // load attendance days for selected class
  useEffect(() => {
    const loadDays = async () => {
      if (!classId) return;
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, "classes", classId, "attendance"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

        // sort by date string descending (works because YYYY-MM-DD)
        list.sort((a, b) => (a.id < b.id ? 1 : -1));
        setDays(list);

        // reset month filter when switching class (optional, but feels sane)
        setMonth("all");
      } finally {
        setLoading(false);
      }
    };
    loadDays();
  }, [classId]);

  // persist selected class
  useEffect(() => {
    if (classId) sessionStorage.setItem("historyClassId", classId);
  }, [classId]);

  // build month options from existing days
  const monthOptions = useMemo(() => {
    const set = new Set();
    for (const d of days) {
      const mk = monthKeyFromYYYYMMDD(d.id);
      if (mk) set.add(mk);
    }
    // newest month first
    return Array.from(set).sort((a, b) => (a < b ? 1 : -1));
  }, [days]);

  // filtered + limited list
  const visibleDays = useMemo(() => {
    const filtered =
      month === "all"
        ? days
        : days.filter((d) => monthKeyFromYYYYMMDD(d.id) === month);

    // if "all", show only first PAGE_SIZE
    if (month === "all") return filtered.slice(0, PAGE_SIZE);

    // if month selected, show whole month
    return filtered;
  }, [days, month]);

  return (
    <main className="min-h-screen pb-20 p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🗓️ History</h1>

          <div className="flex items-center gap-2">
            {/* Class selector */}
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="px-3 py-2 border rounded-lg text-gray-900"
              disabled={!classes.length}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name || c.id}
                </option>
              ))}
            </select>

            {/* Month filter */}
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="px-3 py-2 border rounded-lg text-gray-900"
              disabled={days.length === 0}
              title="Filter by month"
            >
              <option value="all">Latest {PAGE_SIZE}</option>
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {monthLabel(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          {loading ? (
            <div className="text-gray-700">Loading…</div>
          ) : days.length === 0 ? (
            <div className="text-gray-700">No attendance submitted yet.</div>
          ) : (
            <>
              {/* small helper text */}
              <div className="mb-3 text-sm text-gray-600">
                {month === "all"
                  ? `Showing latest ${Math.min(PAGE_SIZE, days.length)} of ${days.length} days`
                  : `Showing ${visibleDays.length} day(s) for ${monthLabel(month)}`}
              </div>

              <div className="space-y-3">
                {visibleDays.map((d) => (
                  <div
                    key={d.id}
                    className="border rounded-xl p-4 bg-gray-50 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-gray-800">{d.id}</div>
                      <div className="text-sm text-gray-600">
                        Total students: {d.totalStudents ?? "—"}
                      </div>
                    </div>

                    <Link
                      href={`/class/${classId}/attendance/${d.id}`}
                      className="text-blue-700 hover:underline text-sm"
                    >
                      View →
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
