'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import { enrollmentsAPI, Enrollment } from '@/lib/api';
import Link from 'next/link';

export default function EnrolledCourses() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'student') {
      router.push('/');
      return;
    }
    loadEnrollments();
  }, [isAuthenticated, user]);

  const loadEnrollments = async () => {
    try {
      const data = await enrollmentsAPI.list();
      setEnrollments(data);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Enrolled Courses</h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{enrollment.course.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{enrollment.course.description}</p>
                <p className="text-xs text-gray-400 mb-4">
                  Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                </p>
                <Link
                  href={`/student/courses/${enrollment.course.id}`}
                  className="block w-full bg-indigo-600 text-white text-center px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>

        {enrollments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">You haven't enrolled in any courses yet.</p>
            <Link
              href="/student/courses"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

