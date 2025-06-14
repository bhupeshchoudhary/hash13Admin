'use client';

import { Users, UserPlus, Search, Filter } from 'lucide-react';

export default function StudentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="mt-2 text-gray-600">Manage student enrollments and progress</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="form-input pl-10"
            />
          </div>
          <button className="btn-secondary flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="card">
        <div className="text-center py-16">
          <Users className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No students yet</h3>
          <p className="mt-2 text-gray-500">Students will appear here when they enroll in courses.</p>
        </div>
      </div>
    </div>
  );
}