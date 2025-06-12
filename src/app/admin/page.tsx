'use client';

import { useEffect, useState } from 'react';
import { CourseService } from '@/lib/courseService';
import { Course } from '@/types/courses';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentCourses from '@/components/dashboard/RecentCourses';
import { BookOpen, Users, TrendingUp, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await CourseService.getAllCourses();
      if (response.success && response.data) {
        setCourses(response.data);
      } else {
        setError(response.error || 'Failed to fetch courses');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Dashboard fetch error:', err);
    }
    
    setLoading(false);
  };

  const stats = [
    {
      name: 'Total Courses',
      value: courses.length.toString(),
      icon: BookOpen,
      change: '+4.75%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Students',
      value: courses.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0).toLocaleString(),
      icon: Users,
      change: '+54.02%',
      changeType: 'positive' as const,
    },
    {
      name: 'Published Courses',
      value: courses.filter(course => course.status === 'published').length.toString(),
      icon: TrendingUp,
      change: '+1.39%',
      changeType: 'positive' as const,
    },
    {
      name: 'Total Revenue',
      value: `₹${courses.reduce((sum, course) => sum + ((course.price || 0) * (course.enrolledStudents || 0)), 0).toLocaleString()}`,
      icon: DollarSign,
      change: '+10.18%',
      changeType: 'positive' as const,
    },
  ];

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading Header */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>

        {/* Loading Stats */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                <div className="ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading Recent Courses */}
        <div className="card animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCourses}
            className="btn-primary inline-flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's what's happening with your courses.
        </p>
      </div>

      <DashboardStats stats={stats} />
      <RecentCourses courses={courses.slice(0, 5)} />
    </div>
  );
}