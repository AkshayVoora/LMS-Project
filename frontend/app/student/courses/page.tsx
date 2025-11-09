'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import { coursesAPI, Course } from '@/lib/api';

export default function StudentCourses() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (user?.role !== 'student') {
      router.push('/');
      return;
    }
    loadCourses();
  }, [isAuthenticated, user]);

  const loadCourses = async () => {
    try {
      const data = await coursesAPI.list();
      setCourses(data);
    } catch (error: any) {
      setError('Failed to load courses');
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCourse = async (courseId: number) => {
    try {
      await coursesAPI.join(courseId);
      alert('Successfully joined the course!');
      loadCourses();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to join course');
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Courses</h1>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg font-medium text-gray-900 mb-2">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{course.description}</p>
                <p className="text-xs text-gray-400 mb-4">Instructor: {course.instructor.email}</p>
                <button
                  onClick={() => handleJoinCourse(course.id)}
                  className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Join Course
                </button>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No courses available at the moment.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

