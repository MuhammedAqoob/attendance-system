'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AttendanceList() {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const q = query(
        collection(db, 'attendance'),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      const querySnapshot = await getDocs(q);
      const records = [];

      querySnapshot.forEach((doc) => {
        records.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">
          Recent Attendance
        </h2>

        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg animate-pulse"
            >
              <div className="flex-1">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-56 bg-gray-200 rounded mt-2" />
              </div>

              <div className="h-6 w-20 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }


  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">
        Recent Attendance
      </h2>

      {attendanceRecords.length === 0 ? (
        <p className="text-gray-500">No attendance records yet.</p>
      ) : (
        <div className="space-y-3">
          {attendanceRecords.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{record.name}</h3>
                <p className="text-sm text-gray-500">
                  {formatTimestamp(record.timestamp)}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  record.status
                )}`}
              >
                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
