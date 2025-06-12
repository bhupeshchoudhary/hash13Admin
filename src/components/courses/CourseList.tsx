'use client';

import { Course } from '@/types/courses';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BookOpen, Users, Calendar, Edit, Trash2, Star } from 'lucide-react';
import Link from 'next/link';

interface CourseListProps {
  courses: Course[];
  onDelete: (courseId: string) => void;
}

export default function CourseList({ courses, onDelete }: CourseListProps) {
  if (courses.length === 0) {
    return (
      <div className="card">
        <div className="text-center py-16">
          <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No courses found</h3>
          <p className="mt-2 text-gray-500">Get started by creating your first course.</p>
          <div className="mt-8">
            <Link
              href="/admin/courses/new"
              className="btn-primary inline-flex items-center"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Create New Course
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
            {/* Grid View for Desktop */}
            <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course._id} className="card group hover:shadow-lg transition-all duration-200">
            {/* Course Image */}
            <div className="relative mb-4">
              <div className="aspect-video bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg overflow-hidden">
                {course.backgroundImage ? (
                  <img
                    src={course.backgroundImage}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="h-12 w-12 text-primary-400" />
                  </div>
                )}
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  course.status === 'published' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {course.status || 'draft'}
                </span>
              </div>
            </div>

            {/* Course Info */}
            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{course.category}</p>
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {course.shortDescription}
              </p>

              {/* Course Stats */}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {course.enrolledStudents.toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-400" />
                    {course.rating.toFixed(1)}
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {course.createdAt ? formatDate(course.createdAt) : 'N/A'}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(course.price)}
                  </span>
                  {course.originalPrice > course.price && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      {formatCurrency(course.originalPrice)}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {course.level}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/admin/courses/${course._id}/edit`}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Edit course"
                  >
                    <Edit className="h-4 w-4" />
                  </Link>
                  
                  <button
                    onClick={() => onDelete(course._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete course"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <span className="text-xs text-gray-500">
                  {course.duration} • {course.hours}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* List View for Mobile */}
      <div className="md:hidden space-y-4">
        {courses.map((course) => (
          <div key={course._id} className="card">
            <div className="flex items-start space-x-4">
              {/* Course Image */}
              <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-lg overflow-hidden">
                {course.backgroundImage ? (
                  <img
                    src={course.backgroundImage}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BookOpen className="h-8 w-8 text-primary-400" />
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{course.category}</p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {course.enrolledStudents.toLocaleString()}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        course.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.status || 'draft'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 ml-4">
                    <Link
                      href={`/admin/courses/${course._id}/edit`}
                      className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    
                    <button
                      onClick={() => onDelete(course._id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(course.price)}
                    </span>
                    {course.originalPrice > course.price && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        {formatCurrency(course.originalPrice)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {course.level}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}