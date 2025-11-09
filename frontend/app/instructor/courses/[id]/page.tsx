'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import { coursesAPI, chaptersAPI, Course, Chapter } from '@/lib/api';
import Link from 'next/link';

export default function CourseDetail() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.id as string);
  const [course, setCourse] = useState<Course | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'instructor') {
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
    } catch (error) {
      console.error('Failed to load course:', error);
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

  if (!course) {
    return (
      <Layout>
        <div className="text-center py-12">Course not found</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <Link
            href="/instructor/dashboard"
            className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          <p className="text-gray-600 mt-2">{course.description}</p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Chapters</h2>
          <Link
            href={`/instructor/courses/${courseId}/chapters/create`}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
          >
            Add Chapter
          </Link>
        </div>

        <div className="space-y-4">
          {chapters.map((chapter) => (
            <div key={chapter.id} className="bg-white shadow rounded-lg p-5">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{chapter.title}</h3>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded ${
                      chapter.visibility === 'public' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {chapter.visibility}
                    </span>
                    <span>Order: {chapter.order}</span>
                  </div>
                </div>
                <Link
                  href={`/instructor/chapters/${chapter.id}/edit`}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>

        {chapters.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No chapters yet. Add your first chapter!</p>
            <Link
              href={`/instructor/courses/${courseId}/chapters/create`}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Add Chapter
            </Link>
          </div>
        )}
      </div>
    </Layout>
  );
}

