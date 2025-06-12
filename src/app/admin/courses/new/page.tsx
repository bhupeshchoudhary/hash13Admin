'use client';

import CourseForm from '@/components/courses/CourseForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewCoursePage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="mt-2 text-gray-600">Fill in the details to create a new course</p>
        </div>
      </div>

      <CourseForm />
    </div>
  );
}