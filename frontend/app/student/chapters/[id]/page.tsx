'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Layout from '@/components/Layout';
import { chaptersAPI, Chapter } from '@/lib/api';
import Link from 'next/link';

export default function ChapterViewer() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const chapterId = parseInt(params.id as string);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'student') {
      router.push('/login');
      return;
    }
    loadChapter();
  }, [chapterId, isAuthenticated]);

  const loadChapter = async () => {
    try {
      const data = await chaptersAPI.get(chapterId);
      setChapter(data);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load chapter');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (content: any) => {
    if (!content || !Array.isArray(content)) {
      return <p className="text-gray-500">No content available.</p>;
    }

    return content.map((node: any, index: number) => {
      if (node.type === 'p') {
        return (
          <p key={index} className="mb-4">
            {node.children?.map((child: any, childIndex: number) => {
              let text = child.text || '';
              if (child.bold) text = <strong key={childIndex}>{text}</strong>;
              if (child.italic) text = <em key={childIndex}>{text}</em>;
              if (child.underline) text = <u key={childIndex}>{text}</u>;
              if (child.code) text = <code key={childIndex} className="bg-gray-100 px-1 rounded">{text}</code>;
              return <span key={childIndex}>{text}</span>;
            })}
          </p>
        );
      }
      if (node.type === 'h1') {
        return (
          <h1 key={index} className="text-3xl font-bold mb-4 mt-6">
            {node.children?.map((child: any) => child.text).join('')}
          </h1>
        );
      }
      if (node.type === 'h2') {
        return (
          <h2 key={index} className="text-2xl font-semibold mb-3 mt-5">
            {node.children?.map((child: any) => child.text).join('')}
          </h2>
        );
      }
      if (node.type === 'h3') {
        return (
          <h3 key={index} className="text-xl font-semibold mb-2 mt-4">
            {node.children?.map((child: any) => child.text).join('')}
          </h3>
        );
      }
      if (node.type === 'ul') {
        return (
          <ul key={index} className="list-disc list-inside mb-4">
            {node.children?.map((item: any, itemIndex: number) => (
              <li key={itemIndex}>{item.children?.map((child: any) => child.text).join('')}</li>
            ))}
          </ul>
        );
      }
      if (node.type === 'ol') {
        return (
          <ol key={index} className="list-decimal list-inside mb-4">
            {node.children?.map((item: any, itemIndex: number) => (
              <li key={itemIndex}>{item.children?.map((child: any) => child.text).join('')}</li>
            ))}
          </ol>
        );
      }
      if (node.type === 'blockquote') {
        return (
          <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic mb-4">
            {node.children?.map((child: any) => child.text).join('')}
          </blockquote>
        );
      }
      return null;
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  if (error || !chapter) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error || 'Chapter not found'}</p>
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
      <div className="px-4 py-6 sm:px-0 max-w-4xl mx-auto">
        <div className="mb-6">
          <Link
            href={`/student/courses/${chapter.course}`}
            className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
          >
            ← Back to Course
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{chapter.title}</h1>
        </div>

        <div className="bg-white shadow rounded-lg p-8 prose max-w-none">
          {renderContent(chapter.content)}
        </div>
      </div>
    </Layout>
  );
}

