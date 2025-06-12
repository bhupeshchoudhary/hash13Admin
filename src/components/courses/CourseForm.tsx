'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CourseService } from '@/lib/courseService';
import { Course, NewCourse } from '@/types/courses';
import { 
  Save, 
  Eye, 
  Upload, 
  X, 
  Plus, 
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

const courseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  shortDescription: z.string().min(1, 'Short description is required').max(500, 'Description is too long'),
  category: z.string().min(1, 'Category is required'),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.string().min(1, 'Language is required'),
  duration: z.string().min(1, 'Duration is required'),
  hours: z.string().min(1, 'Hours is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  originalPrice: z.number().min(0, 'Original price must be 0 or greater'),
  paymentLink: z.string().optional(),
  backgroundImage: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  initialData?: Course;
}

export default function CourseForm({ initialData }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [learningOutcomes, setLearningOutcomes] = useState<string[]>(
    initialData?.learningOutcomes || ['']
  );
  const [features, setFeatures] = useState<string[]>(
    initialData?.features || ['']
  );
  const [skills, setSkills] = useState<string[]>(
    initialData?.skills || ['']
  );
  const [requirements, setRequirements] = useState<string[]>(
    initialData?.requirements || ['']
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: initialData?.title || '',
      shortDescription: initialData?.shortDescription || '',
      category: initialData?.category || '',
      level: (initialData?.level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
      language: initialData?.language || '',
      duration: initialData?.duration || '',
      hours: initialData?.hours || '',
      price: initialData?.price || 0,
      originalPrice: initialData?.originalPrice || 0,
      paymentLink: initialData?.paymentLink || '',
      backgroundImage: initialData?.backgroundImage || '',
      status: (initialData?.status as 'draft' | 'published') || 'draft',
    }
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const response = await CourseService.uploadImage(file, 'courses');
      if (response.success && response.url) {
        setValue('backgroundImage', response.url);
        toast.success('Image uploaded successfully');
      } else {
        toast.error(response.error || 'Failed to upload image');
      }
    } catch (error) {
      toast.error('Failed to upload image');
    }
    setImageUploading(false);
  };

  const handleArrayField = (
    array: string[],
    setArray: (arr: string[]) => void,
    index: number,
    value: string
  ) => {
    const newArray = [...array];
    newArray[index] = value;
    setArray(newArray);
  };

  const addArrayItem = (array: string[], setArray: (arr: string[]) => void) => {
    setArray([...array, '']);
  };

  const removeArrayItem = (array: string[], setArray: (arr: string[]) => void, index: number) => {
    setArray(array.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CourseFormData) => {
    setLoading(true);
    
    try {
      const courseData: NewCourse = {
        title: data.title.trim(),
        slug: data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        shortDescription: data.shortDescription.trim(),
        category: data.category.trim(),
        level: data.level,
        language: data.language.trim(),
        duration: data.duration.trim(),
        hours: data.hours.trim(),
        price: Number(data.price),
        originalPrice: Number(data.originalPrice),
        paymentLink: data.paymentLink?.trim() || '',
        backgroundImage: data.backgroundImage?.trim() || '',
        status: data.status,
        rating: initialData?.rating || 0,
        totalRatings: initialData?.totalRatings || 0,
        enrolledStudents: initialData?.enrolledStudents || 0,
        programBy: 'Admin',
        lastUpdated: new Date().toISOString(),
        learningOutcomes: learningOutcomes.filter(item => item.trim() !== ''),
        features: features.filter(item => item.trim() !== ''),
        skills: skills.filter(item => item.trim() !== ''),
        requirements: requirements.filter(item => item.trim() !== ''),
        module: initialData?.module || [],
        highlights: initialData?.highlights || [],
        certificateImage: initialData?.certificateImage || '',
        project: initialData?.project || [],
        programFor: initialData?.programFor || [],
        toolsData: initialData?.toolsData || {
          sectionTitle: '',
          category: '',
          toolsCount: '0',
          displayImage: '',
          tools: []
        }
      };

      let response;
      if (initialData?._id) {
        response = await CourseService.updateCourse(initialData._id, courseData);
      } else {
        response = await CourseService.createCourse(courseData);
      }

      if (response.success) {
        toast.success(`Course ${initialData ? 'updated' : 'created'} successfully`);
        router.push('/admin/courses');
      } else {
        toast.error(response.error || `Failed to ${initialData ? 'update' : 'create'} course`);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(`Failed to ${initialData ? 'update' : 'create'} course`);
    }
    
    setLoading(false);
  };

  const backgroundImage = watch('backgroundImage');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title *
            </label>
            <input
              {...register('title')}
              type="text"
              className="form-input"
              placeholder="Enter course title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description *
            </label>
            <textarea
              {...register('shortDescription')}
              rows={4}
              className="form-textarea"
              placeholder="Brief description of the course"
            />
            {errors.shortDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.shortDescription.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <input
              {...register('category')}
              type="text"
              className="form-input"
              placeholder="e.g., Programming, Design, Marketing"
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Level *
            </label>
            <select {...register('level')} className="form-input">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            {errors.level && (
              <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language *
            </label>
            <input
              {...register('language')}
              type="text"
              className="form-input"
              placeholder="e.g., English, Hindi"
            />
            {errors.language && (
              <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <select {...register('status')} className="form-input">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Details</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration *
            </label>
            <input
              {...register('duration')}
              type="text"
              className="form-input"
              placeholder="e.g., 8 weeks, 3 months"
            />
            {errors.duration && (
              <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Hours *
            </label>
            <input
              {...register('hours')}
              type="text"
              className="form-input"
              placeholder="e.g., 40 hours, 60+ hours"
            />
            {errors.hours && (
              <p className="mt-1 text-sm text-red-600">{errors.hours.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (₹) *
            </label>
            <input
              {...register('price', { valueAsNumber: true })}
              type="number"
              min="0"
              className="form-input"
              placeholder="0"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Original Price (₹) *
            </label>
            <input
              {...register('originalPrice', { valueAsNumber: true })}
              type="number"
              min="0"
              className="form-input"
              placeholder="0"
            />
            {errors.originalPrice && (
              <p className="mt-1 text-sm text-red-600">{errors.originalPrice.message}</p>
            )}
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Link
            </label>
            <input
              {...register('paymentLink')}
              type="url"
              className="form-input"
              placeholder="https://example.com/payment"
            />
            {errors.paymentLink && (
              <p className="mt-1 text-sm text-red-600">{errors.paymentLink.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Course Image */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Image</h2>
        
        <div className="space-y-4">
          {backgroundImage && (
            <div className="relative">
              <img
                src={backgroundImage}
                alt="Course background"
                className="h-48 w-full object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => setValue('backgroundImage', '')}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            <label className="btn-secondary cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              {imageUploading ? 'Uploading...' : 'Upload Image'}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={imageUploading}
              />
            </label>
            
            <div className="flex-1">
              <input
                {...register('backgroundImage')}
                type="url"
                className="form-input"
                placeholder="Or enter image URL"
              />
              {errors.backgroundImage && (
                <p className="mt-1 text-sm text-red-600">{errors.backgroundImage.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Outcomes */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Learning Outcomes</h2>
        
        <div className="space-y-3">
          {learningOutcomes.map((outcome, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={outcome}
                onChange={(e) => handleArrayField(learningOutcomes, setLearningOutcomes, index, e.target.value)}
                className="form-input flex-1"
                placeholder="What will students learn?"
              />
              {learningOutcomes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem(learningOutcomes, setLearningOutcomes, index)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem(learningOutcomes, setLearningOutcomes)}
            className="btn-secondary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Learning Outcome
          </button>
        </div>
      </div>

      {/* Course Features */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Features</h2>
        
        <div className="space-y-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleArrayField(features, setFeatures, index, e.target.value)}
                className="form-input flex-1"
                placeholder="Course feature or benefit"
              />
              {features.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem(features, setFeatures, index)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem(features, setFeatures)}
            className="btn-secondary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </button>
        </div>
      </div>

      {/* Skills */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Skills Students Will Gain</h2>
        
        <div className="space-y-3">
          {skills.map((skill, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={skill}
                onChange={(e) => handleArrayField(skills, setSkills, index, e.target.value)}
                className="form-input flex-1"
                placeholder="Skill or technology"
              />
              {skills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem(skills, setSkills, index)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem(skills, setSkills)}
            className="btn-secondary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </button>
        </div>
      </div>

      {/* Requirements */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Prerequisites</h2>
        
        <div className="space-y-3">
          {requirements.map((requirement, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={requirement}
                onChange={(e) => handleArrayField(requirements, setRequirements, index, e.target.value)}
                className="form-input flex-1"
                placeholder="What students need to know beforehand"
              />
              {requirements.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem(requirements, setRequirements, index)}
                  className="p-2 text-red-500 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem(requirements, setRequirements)}
            className="btn-secondary flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Requirement
          </button>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-between pt-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="btn-secondary"
        >
          Cancel
        </button>
        
        <div className="flex items-center space-x-4">
          {watch('status') === 'published' && (
            <button
              type="button"
              onClick={() => setValue('status', 'draft')}
              className="btn-secondary flex items-center"
            >
              <Eye className="h-4 w-4 mr-2" />
              Save as Draft
            </button>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : initialData ? 'Update Course' : 'Create Course'}
          </button>
        </div>
      </div>
    </form>
  );
}