'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import PlateEditor from '@/components/PlateEditor';
import { chaptersAPI } from '@/lib/api';

export default function CreateChapter() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = parseInt(params.id as string);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState([
    {
      type: 'p',
      children: [{ text: '' }],
    },
  ]);
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [order, setOrder] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated || user?.role !== 'instructor') {
    router.push('/login');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await chaptersAPI.create({
        course: courseId,
        title,
        content,
        visibility,
        order,
      });
      router.push(`/instructor/courses/${courseId}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create chapter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create New Chapter</h1>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Chapter Title
            </label>
            <input
              type="text"
              id="title"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content
            </label>
            <PlateEditor value={content} onChange={setContent} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">
                Visibility
              </label>
              <select
                id="visibility"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div>
              <label htmlFor="order" className="block text-sm font-medium text-gray-700">
                Order
              </label>
              <input
                type="number"
                id="order"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Chapter'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

