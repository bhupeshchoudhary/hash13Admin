'use client';

import ImageUpload from '@/components/ui/ImageUpload';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import Link from 'next/link';

export default function ImagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="flex items-center justify-center h-10 w-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Image Manager</h1>
          <p className="mt-2 text-gray-600">Upload and manage images for your courses</p>
        </div>
      </div>

      <ImageUpload 
        folder="course-images" 
        maxFiles={20}
        onImageUploaded={(url) => {
          console.log('New image uploaded:', url);
        }}
      />

      {/* Help Section */}
      <div className="card">
        <div className="flex items-start space-x-3">
          <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Pro Tips</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Use high-quality images (1200x600px or larger) for best results</li>
              <li>Keep file sizes under 5MB for faster loading</li>
              <li>Use descriptive filenames for better organization</li>
              <li>JPG format is recommended for photos, PNG for graphics with transparency</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}