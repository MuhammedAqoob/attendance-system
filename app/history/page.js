'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function HistoryPage() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  // load classes
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'classes'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setClasses(list);

        // restore last selected class
        const saved = sessionStorage.getItem("historyClassId");
        const found = saved && list.some(c => c.id === saved);

        if (found) setClassId(saved);
        else if (list.length) setClassId(list[0].id);

      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // load attendance days
  useEffect(() => {
    const loadDays = async () => {
      if (!classId) return;
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'classes', classId, 'attendance'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // sort by date string descending
        list.sort((a, b) => (a.id < b.id ? 1 : -1));
        setDays(list);
      } finally {
        setLoading(false);
      }
    };
    loadDays();
  }, [classId]);
  
  useEffect(() => {
    if (classId) {
      sessionStorage.setItem("historyClassId", classId);
    }
  }, [classId]);


  return (
    <main className="min-h-screen pb-20 p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">🗓️ History</h1>

          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="px-3 py-2 border rounded-lg text-gray-900"
            disabled={!classes.length}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name || c.id}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow p-5">
          {loading ? (
            <div className="text-gray-700">Loading…</div>
          ) : days.length === 0 ? (
            <div className="text-gray-700">No attendance submitted yet.</div>
          ) : (
            <div className="space-y-3">
              {days.map(d => (
                <div
                  key={d.id}
                  className="border rounded-xl p-4 bg-gray-50 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-gray-800">{d.id}</div>
                    <div className="text-sm text-gray-600">
                      Total students: {d.totalStudents ?? '—'}
                    </div>
                  </div>

                  {/* Optional link if you want to open that day's record page */}
                  <Link
                    href={`/class/${classId}/attendance`}
                    className="text-blue-700 hover:underline text-sm"
                  >
                    View →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>


    </main>
  );
}
