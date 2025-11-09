'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import { coursesAPI, Course } from '@/lib/api';
import Link from 'next/link';

export default function InstructorCourses() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'instructor') {
      router.push('/');
      return;
    }
    loadCourses();
  }, [isAuthenticated, user]);

  const loadCourses = async () => {
    try {
      const data = await coursesAPI.list();
      setCourses(data);
    } catch (error) {
      console.error('Failed to load courses:', error);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <Link
            href="/instructor/courses/create"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Create New Course
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                <Link
                  href={`/instructor/courses/${course.id}`}
                  className="block w-full bg-indigo-600 text-white text-center px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  View Course
                </Link>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No courses yet. Create your first course!</p>
            <Link
              href="/instructor/courses/create"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Create Course
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

