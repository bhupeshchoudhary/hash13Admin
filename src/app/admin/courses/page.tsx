'use client';

import { useEffect, useState } from 'react';
import { CourseService } from '@/lib/courseService';
import { Course } from '@/types/courses';
import CourseList from '@/components/courses/CourseList';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, statusFilter]);

  const fetchCourses = async () => {
    setLoading(true);
    const response = await CourseService.getAllCourses();
    if (response.success && response.data) {
      setCourses(response.data);
    } else {
      toast.error(response.error || 'Failed to fetch courses');
    }
    setLoading(false);
  };

  const filterCourses = () => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter);
    }

    setFilteredCourses(filtered);
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    const response = await CourseService.deleteCourse(courseId);
    if (response.success) {
      setCourses(courses.filter(course => course._id !== courseId));
      toast.success('Course deleted successfully');
    } else {
      toast.error(response.error || 'Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="mt-2 text-gray-600">Manage all your courses in one place</p>
        </div>
        <Link
          href="/admin/courses/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Course
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="form-input sm:w-48"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      <CourseList
        courses={filteredCourses}
        onDelete={handleDeleteCourse}
      />
    </div>
  );
}