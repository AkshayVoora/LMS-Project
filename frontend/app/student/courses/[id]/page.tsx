'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import { coursesAPI, chaptersAPI, Course, Chapter } from '@/lib/api';
import Link from 'next/link';

export default function StudentCourseDetail() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.id as string);
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') {
      router.push('/login');
      return;
    }
    loadData();
  }, [courseId, isAuthenticated]);

  const loadData = async () => {
    try {
      const [courseData, chaptersData] = await Promise.all([
        coursesAPI.get(courseId),
        coursesAPI.getChapters(courseId),
      ]);
      setCourse(courseData);
      setChapters(chaptersData);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load course');
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

  if (error || !course) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Course not found'}</p>
          <Link
            href="/student/enrolled"
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Back to My Courses
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link
            href="/student/enrolled"
            className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
          >
            ← Back to My Courses
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 mt-2">{course.description}</p>
        </div>

        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Chapters</h2>

        <div className="space-y-4">
          {chapters.map((chapter) => (
            <Link
              key={chapter.id}
              href={`/student/chapters/${chapter.id}`}
              className="block bg-white shadow rounded-lg p-5 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-medium text-gray-900">{chapter.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {chapter.visibility === 'public' ? 'Public' : 'Private'}
              </p>
            </Link>
          ))}
        </div>

        {chapters.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No public chapters available in this course.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

