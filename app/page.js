'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PercentRing from './components/PercentRing';

export default function Home() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState('');
  const [topStudents, setTopStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // load classes
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'classes'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setClasses(list);
        if (list.length) setClassId(list[0].id);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // load summaries for selected class, take top 4 by percent
  useEffect(() => {
    const loadTop = async () => {
      if (!classId) return;
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'classes', classId, 'summaries'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        list.sort((a, b) => (b.percent ?? 0) - (a.percent ?? 0));
        setTopStudents(list.slice(0, 4));
      } finally {
        setLoading(false);
      }
    };
    loadTop();
  }, [classId]);

  const selectedClass = useMemo(
    () => classes.find(c => c.id === classId),
    [classes, classId]
  );

  return (
    <main className="min-h-screen pb-20 p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📊 Attendance</h1>

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

        {/* Classes list */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {classes.map(c => (
            <Link
              key={c.id}
              href={`/class/${c.id}`}
              className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition"
            >
              <div className="text-xl font-semibold text-gray-800">{c.name || c.id}</div>
              <div className="text-gray-600 mt-1">Tap to view students →</div>
            </Link>
          ))}
        </div>

        {/* Top students */}
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              🏆 Top attendance
            </h2>
            <div className="text-sm text-gray-600">
              {selectedClass?.name ? `Class: ${selectedClass.name}` : ''}
            </div>
          </div>

          {loading ? (
            <div className="text-gray-700">Loading…</div>
          ) : topStudents.length === 0 ? (
            <div className="text-gray-700">
              No summaries yet. Teacher needs to mark attendance at least once.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topStudents.map(s => (
                <Link
                  key={s.id}
                  href={`/class/${classId}/student/${s.id}`}
                  className="border rounded-xl p-4 hover:shadow-md transition bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <PercentRing percent={s.percent ?? 0} />
                    <div>
                      <div className="font-semibold text-gray-800">{s.name || 'Student'}</div>
                      <div className="text-sm text-gray-600">{s.roll || s.id}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        P:{s.present ?? 0} A:{s.absent ?? 0} T:{s.total ?? 0}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

    </main>
  );
}
