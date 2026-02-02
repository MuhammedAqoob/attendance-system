'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function Home() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'classes'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setClasses(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="text-4xl font-bold text-gray-800">📊 Attendance Dashboard</h1>

          <Link
            href="/teacher/mark"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Teacher: Mark Attendance
          </Link>
        </div>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-gray-700">Loading classes…</div>
        ) : classes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-gray-700">
            No classes found. Add a class in Firestore collection <b>classes</b>.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {classes.map(c => (
              <Link
                key={c.id}
                href={`/class/${c.id}`}
                className="bg-white rounded-lg shadow p-6 hover:shadow-xl transition"
              >
                <div className="text-2xl font-semibold text-gray-800">{c.name || c.id}</div>
                <div className="text-gray-600 mt-2">Tap to view all students attendance →</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
