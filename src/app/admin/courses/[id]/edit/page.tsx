'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CourseService } from '@/lib/courseService';
import { Course } from '@/types/courses';
import CourseForm from '@/components/courses/CourseForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function EditCoursePage() {
  const params = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchCourse(params.id as string);
    }
  }, [params.id]);

  const fetchCourse = async (courseId: string) => {
    setLoading(true);
    const response = await CourseService.getCourseById(courseId);
    if (response.success && response.data) {
      setCourse(response.data);
    } else {
      toast.error(response.error || 'Failed to fetch course');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
        <p className="mt-2 text-gray-600">The course you're looking for doesn't exist.</p>
        <Link href="/admin/courses" className="btn-primary mt-4 inline-block">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/courses"
          className="flex items-center justify-center h-10 w-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
          <p className="mt-2 text-gray-600">Update course details</p>
        </div>
      </div>

      <CourseForm initialData={course} />
    </div>
  );
}