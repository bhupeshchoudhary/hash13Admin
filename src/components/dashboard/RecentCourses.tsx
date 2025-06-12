'use client';

import { Course } from '@/types/courses';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BookOpen, Users, Calendar, Eye } from 'lucide-react';
import Link from 'next/link';

interface RecentCoursesProps {
  courses: Course[];
}

export default function RecentCourses({ courses }: RecentCoursesProps) {
  if (courses.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No courses</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new course.</p>
          <div className="mt-6">
            <Link
              href="/admin/courses/new"
              className="btn-primary"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              New Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Recent Courses</h2>
        <Link
          href="/admin/courses"
          className="text-sm text-primary-600 hover:text-primary-500 font-medium"
        >
          View all
        </Link>
      </div>
      
      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course._id}
            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {course.title}
                </p>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <Users className="h-3 w-3 mr-1" />
                    {course.enrolledStudents.toLocaleString()} students
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    {course.createdAt ? formatDate(course.createdAt) : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {formatCurrency(course.price)}
                </p>
                <p className={`text-xs px-2 py-1 rounded-full ${
                  course.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {course.status || 'draft'}
                </p>
              </div>
              <Link
                href={`/admin/courses/${course._id}/edit`}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Eye className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}