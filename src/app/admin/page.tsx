'use client';

import { useEffect, useState } from 'react';
import { CourseService } from '@/lib/courseService';
import { Course } from '@/types/courses';
import DashboardStats from '@/components/dashboard/DashboardStats';
import RecentCourses from '@/components/dashboard/RecentCourses';
import { BookOpen, Users, TrendingUp, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    const response = await CourseService.getAllCourses();
    if (response.success && response.data) {
      setCourses(response.data);
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
      value: courses.reduce((sum, course) => sum + course.enrolledStudents, 0).toLocaleString(),
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
      value: `₹${courses.reduce((sum, course) => sum + (course.price * course.enrolledStudents), 0).toLocaleString()}`,
      icon: DollarSign,
      change: '+10.18%',
      changeType: 'positive' as const,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back! Here's what's happening with your courses.</p>
      </div>

      <DashboardStats stats={stats} />
      <RecentCourses courses={courses.slice(0, 5)} />
    </div>
  );
}