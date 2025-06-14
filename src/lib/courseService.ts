import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  doc, 
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  where,
  writeBatch,
  limit as firestoreLimit,
  startAfter,
  DocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage, handleFirestoreError } from './firebase';
import { Course, NewCourse, CoursesResponse, CourseResponse } from '@/types/courses';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'courses';

// Helper function to clean data before sending to Firestore
const cleanCourseData = (data: any) => {
  const cleaned: any = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Skip undefined values and functions
    if (value !== undefined && typeof value !== 'function') {
      // Handle different data types appropriately
      if (value === null) {
        // Convert null to appropriate default values
        if (['paymentLink', 'backgroundImage', 'certificateImage', 'globalStatus', 'startDate'].includes(key)) {
          cleaned[key] = '';
        } else if (['learningOutcomes', 'features', 'skills', 'requirements', 'module', 'highlights', 'project', 'programFor'].includes(key)) {
          cleaned[key] = [];
        } else if (['rating', 'totalRatings', 'enrolledStudents', 'price', 'originalPrice'].includes(key)) {
          cleaned[key] = 0;
        } else {
          cleaned[key] = '';
        }
      } else if (Array.isArray(value)) {
        // Ensure arrays are properly formatted
        cleaned[key] = value.filter(item => item !== null && item !== undefined);
      } else if (typeof value === 'string') {
        // Trim strings and handle empty values
        cleaned[key] = value.trim();
      } else if (typeof value === 'object' && value.constructor === Object) {
        // Recursively clean nested objects
        cleaned[key] = cleanCourseData(value);
      } else {
        cleaned[key] = value;
      }
    }
  }
  
  return cleaned;
};

// Helper function to validate course data
const validateCourseData = (courseData: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!courseData.title || courseData.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!courseData.shortDescription || courseData.shortDescription.trim().length === 0) {
    errors.push('Short description is required');
  }
  
  if (!courseData.category || courseData.category.trim().length === 0) {
    errors.push('Category is required');
  }
  
  if (!courseData.level || !['beginner', 'intermediate', 'advanced'].includes(courseData.level)) {
    errors.push('Valid level is required (beginner, intermediate, or advanced)');
  }
  
  if (!courseData.language || courseData.language.trim().length === 0) {
    errors.push('Language is required');
  }
  
  if (!courseData.duration || courseData.duration.trim().length === 0) {
    errors.push('Duration is required');
  }
  
  if (!courseData.hours || courseData.hours.trim().length === 0) {
    errors.push('Hours is required');
  }
  
  if (courseData.price < 0 || isNaN(courseData.price)) {
    errors.push('Price must be a valid number (0 or greater)');
  }
  
  if (courseData.originalPrice < 0 || isNaN(courseData.originalPrice)) {
    errors.push('Original price must be a valid number (0 or greater)');
  }
  
  if (courseData.originalPrice > 0 && courseData.price > courseData.originalPrice) {
    errors.push('Price cannot be greater than original price');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export class CourseService {
  // Create a new course
  static async createCourse(courseData: NewCourse): Promise<CourseResponse> {
    try {
      // Validate course data
      const validation = validateCourseData(courseData);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Validation failed: ${validation.errors.join(', ')}`
        };
      }

      const courseId = uuidv4();
      
      const courseWithMetadata = {
        ...courseData,
        _id: courseId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: courseData.status || 'draft',
        // Ensure these fields are numbers
        rating: Number(courseData.rating) || 0,
        totalRatings: Number(courseData.totalRatings) || 0,
        enrolledStudents: Number(courseData.enrolledStudents) || 0,
        price: Number(courseData.price) || 0,
        originalPrice: Number(courseData.originalPrice) || 0,
        // Ensure arrays are properly initialized
        learningOutcomes: Array.isArray(courseData.learningOutcomes) ? courseData.learningOutcomes.filter(item => item && item.trim()) : [],
        features: Array.isArray(courseData.features) ? courseData.features.filter(item => item && item.trim()) : [],
        skills: Array.isArray(courseData.skills) ? courseData.skills.filter(item => item && item.trim()) : [],
        requirements: Array.isArray(courseData.requirements) ? courseData.requirements.filter(item => item && item.trim()) : [],
        module: Array.isArray(courseData.module) ? courseData.module : [],
        highlights: Array.isArray(courseData.highlights) ? courseData.highlights : [],
        project: Array.isArray(courseData.project) ? courseData.project : [],
        programFor: Array.isArray(courseData.programFor) ? courseData.programFor : [],
        // Ensure strings are not undefined
        title: courseData.title?.trim() || '',
        slug: courseData.slug?.trim() || courseData.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '',
        shortDescription: courseData.shortDescription?.trim() || '',
        category: courseData.category?.trim() || '',
        level: courseData.level || 'beginner',
        language: courseData.language?.trim() || '',
        duration: courseData.duration?.trim() || '',
        hours: courseData.hours?.trim() || '',
        programBy: courseData.programBy?.trim() || 'Admin',
        lastUpdated: courseData.lastUpdated || new Date().toISOString(),
        paymentLink: courseData.paymentLink?.trim() || '',
        backgroundImage: courseData.backgroundImage?.trim() || '',
        certificateImage: courseData.certificateImage?.trim() || '',
        globalStatus: courseData.globalStatus?.trim() || '',
        startDate: courseData.startDate?.trim() || '',
        // Ensure toolsData has proper structure
        toolsData: courseData.toolsData || {
          sectionTitle: '',
          category: '',
          toolsCount: '0',
          displayImage: '',
          tools: []
        }
      };

      // Clean the data before sending
      const cleanedData = cleanCourseData(courseWithMetadata);
      
      console.log('Creating course with cleaned data:', {
        title: cleanedData.title,
        status: cleanedData.status,
        price: cleanedData.price
      });
      
      const docRef = await addDoc(collection(db, COLLECTION_NAME), cleanedData);
      
      const createdCourse: Course = {
        ...cleanedData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Course;

      return {
        success: true,
        data: createdCourse
      };
    } catch (error: any) {
      console.error('Error creating course:', error);
      const errorMessage = handleFirestoreError(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Get all courses with optional pagination and filtering
  static async getAllCourses(options?: {
    pageSize?: number;
    lastDoc?: DocumentSnapshot;
    status?: 'draft' | 'published';
    category?: string;
    searchTerm?: string;
  }): Promise<CoursesResponse> {
    try {
      let q = query(collection(db, COLLECTION_NAME));
      
      // Add filters
      if (options?.status) {
        q = query(q, where('status', '==', options.status));
      }
      
      if (options?.category) {
        q = query(q, where('category', '==', options.category));
      }
      
      // Add ordering
      q = query(q, orderBy('createdAt', 'desc'));
      
      // Add pagination
      if (options?.pageSize) {
        q = query(q, firestoreLimit(options.pageSize));
      }
      
      if (options?.lastDoc) {
        q = query(q, startAfter(options.lastDoc));
      }
      
      const querySnapshot = await getDocs(q);
      
      const courses: Course[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const course: Course = {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          // Ensure required fields have default values
          rating: Number(data.rating) || 0,
          totalRatings: Number(data.totalRatings) || 0,
          enrolledStudents: Number(data.enrolledStudents) || 0,
          price: Number(data.price) || 0,
          originalPrice: Number(data.originalPrice) || 0,
          learningOutcomes: Array.isArray(data.learningOutcomes) ? data.learningOutcomes : [],
          features: Array.isArray(data.features) ? data.features : [],
          skills: Array.isArray(data.skills) ? data.skills : [],
          requirements: Array.isArray(data.requirements) ? data.requirements : [],
          module: Array.isArray(data.module) ? data.module : [],
          highlights: Array.isArray(data.highlights) ? data.highlights : [],
          project: Array.isArray(data.project) ? data.project : [],
          programFor: Array.isArray(data.programFor) ? data.programFor : [],
          toolsData: data.toolsData || {
            sectionTitle: '',
            category: '',
            toolsCount: '0',
            displayImage: '',
            tools: []
          }
        } as Course;
        
        // Apply search filter on client side (for simplicity)
        if (options?.searchTerm) {
          const searchLower = options.searchTerm.toLowerCase();
          const matchesSearch = 
            course.title.toLowerCase().includes(searchLower) ||
            course.category.toLowerCase().includes(searchLower) ||
            course.shortDescription.toLowerCase().includes(searchLower) ||
            course.programBy.toLowerCase().includes(searchLower);
          
          if (matchesSearch) {
            courses.push(course);
          }
        } else {
          courses.push(course);
        }
      });

      return {
        success: true,
        data: courses,
        pagination: {
          total: courses.length,
          page: 1,
          pages: 1
        }
      };
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      const errorMessage = handleFirestoreError(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Get course by ID
  static async getCourseById(courseId: string): Promise<CourseResponse> {
    try {
      if (!courseId || courseId.trim() === '') {
        return {
          success: false,
          error: 'Course ID is required'
        };
      }

      const q = query(collection(db, COLLECTION_NAME), where('_id', '==', courseId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return {
          success: false,
          error: 'Course not found'
        };
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const course: Course = {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        // Ensure required fields have default values
        rating: Number(data.rating) || 0,
        totalRatings: Number(data.totalRatings) || 0,
        enrolledStudents: Number(data.enrolledStudents) || 0,
        price: Number(data.price) || 0,
        originalPrice: Number(data.originalPrice) || 0,
        learningOutcomes: Array.isArray(data.learningOutcomes) ? data.learningOutcomes : [],
        features: Array.isArray(data.features) ? data.features : [],
        skills: Array.isArray(data.skills) ? data.skills : [],
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        module: Array.isArray(data.module) ? data.module : [],
        highlights: Array.isArray(data.highlights) ? data.highlights : [],
        project: Array.isArray(data.project) ? data.project : [],
        programFor: Array.isArray(data.programFor) ? data.programFor : [],
        toolsData: data.toolsData || {
          sectionTitle: '',
          category: '',
          toolsCount: '0',
          displayImage: '',
          tools: []
        }
      } as Course;

      return {
        success: true,
        data: course
      };
    } catch (error: any) {
      console.error('Error fetching course:', error);
      const errorMessage = handleFirestoreError(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Get course by slug
  static async getCourseBySlug(slug: string): Promise<CourseResponse> {
    try {
      if (!slug || slug.trim() === '') {
        return {
          success: false,
          error: 'Course slug is required'
        };
      }

      const q = query(collection(db, COLLECTION_NAME), where('slug', '==', slug));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return {
          success: false,
          error: 'Course not found'
        };
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();
      const course: Course = {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Course;

      return {
        success: true,
        data: course
      };
    } catch (error: any) {
      console.error('Error fetching course by slug:', error);
      const errorMessage = handleFirestoreError(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Update course
  static async updateCourse(courseId: string, courseData: Partial<Course>): Promise<CourseResponse> {
    try {
      if (!courseId || courseId.trim() === '') {
        return {
          success: false,
          error: 'Course ID is required'
        };
      }

      // Validate updated data if it contains required fields
      if (courseData.title || courseData.shortDescription || courseData.category) {
        const validation = validateCourseData({
          title: courseData.title || 'temp',
          shortDescription: courseData.shortDescription || 'temp',
          category: courseData.category || 'temp',
          level: courseData.level || 'beginner',
          language: courseData.language || 'temp',
          duration: courseData.duration || 'temp',
          hours: courseData.hours || 'temp',
          price: courseData.price || 0,
          originalPrice: courseData.originalPrice || 0
        });
        
        if (!validation.isValid) {
          return {
            success: false,
            error: `Validation failed: ${validation.errors.join(', ')}`
          };
        }
      }

      const q = query(collection(db, COLLECTION_NAME), where('_id', '==', courseId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return {
          success: false,
          error: 'Course not found'
        };
      }

      const docRef = querySnapshot.docs[0].ref;
      
      const updateData = {
        ...courseData,
        updatedAt: serverTimestamp(),
        lastUpdated: new Date().toISOString(),
        // Ensure numeric fields are properly typed
        ...(courseData.rating !== undefined && { rating: Number(courseData.rating) }),
        ...(courseData.totalRatings !== undefined && { totalRatings: Number(courseData.totalRatings) }),
        ...(courseData.enrolledStudents !== undefined && { enrolledStudents: Number(courseData.enrolledStudents) }),
        ...(courseData.price !== undefined && { price: Number(courseData.price) }),
        ...(courseData.originalPrice !== undefined && { originalPrice: Number(courseData.originalPrice) }),
        // Ensure arrays are properly filtered
        ...(courseData.learningOutcomes && { 
          learningOutcomes: Array.isArray(courseData.learningOutcomes) 
            ? courseData.learningOutcomes.filter(item => item && item.trim()) 
            : [] 
        }),
        ...(courseData.features && { 
          features: Array.isArray(courseData.features) 
            ? courseData.features.filter(item => item && item.trim()) 
            : [] 
        }),
        ...(courseData.skills && { 
          skills: Array.isArray(courseData.skills) 
            ? courseData.skills.filter(item => item && item.trim()) 
            : [] 
        }),
        ...(courseData.requirements && { 
          requirements: Array.isArray(courseData.requirements) 
            ? courseData.requirements.filter(item => item && item.trim()) 
            : [] 
        }),
        // Update slug if title changed
        ...(courseData.title && { 
          slug: courseData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') 
        })
      };

      // Clean the data before sending
      const cleanedData = cleanCourseData(updateData);
      
      console.log('Updating course with cleaned data:', {
        courseId,
        fieldsUpdated: Object.keys(cleanedData)
      });

      await updateDoc(docRef, cleanedData);

      // Fetch the updated course
      const updatedCourseResponse = await this.getCourseById(courseId);
      
      if (updatedCourseResponse.success) {
        return updatedCourseResponse;
      } else {
        return {
          success: true,
          data: {
            ...courseData,
            _id: courseId,
            updatedAt: new Date()
          } as Course
        };
      }
    } catch (error: any) {
      console.error('Error updating course:', error);
      const errorMessage = handleFirestoreError(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Delete course
  static async deleteCourse(courseId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!courseId || courseId.trim() === '') {
        return {
          success: false,
          error: 'Course ID is required'
        };
      }

      const q = query(collection(db, COLLECTION_NAME), where('_id', '==', courseId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return {
          success: false,
          error: 'Course not found'
        };
      }

      const docRef = querySnapshot.docs[0].ref;
      const courseData = querySnapshot.docs[0].data();
      
      // Delete associated images from storage
      if (courseData.backgroundImage) {
        try {
          await this.deleteImage(courseData.backgroundImage);
        } catch (imageError) {
          console.warn('Failed to delete background image:', imageError);
        }
      }
      
      if (courseData.certificateImage) {
        try {
          await this.deleteImage(courseData.certificateImage);
        } catch (imageError) {
          console.warn('Failed to delete certificate image:', imageError);
        }
      }

      await deleteDoc(docRef);
      
      console.log('Course deleted successfully:', courseId);

      return {
        success: true
      };
    } catch (error: any) {
      console.error('Error deleting course:', error);
      const errorMessage = handleFirestoreError(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Bulk delete courses
  static async deleteCourses(courseIds: string[]): Promise<{ success: boolean; error?: string; deletedCount?: number }> {
    try {
      if (!courseIds || courseIds.length === 0) {
        return {
          success: false,
          error: 'Course IDs are required'
        };
      }

      const batch = writeBatch(db);
      let deletedCount = 0;

      for (const courseId of courseIds) {
        const q = query(collection(db, COLLECTION_NAME), where('_id', '==', courseId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          batch.delete(docRef);
          deletedCount++;
        }
      }

      if (deletedCount === 0) {
        return {
          success: false,
          error: 'No courses found to delete'
        };
      }

      await batch.commit();

      return {
        success: true,
        deletedCount
      };
    } catch (error: any) {
      console.error('Error bulk deleting courses:', error);
      const errorMessage = handleFirestoreError(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Upload image via API endpoint
static async uploadImage(file: File, path: string): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    console.log('Starting image upload via API...');
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file
    if (!file) {
      return { success: false, error: 'No file provided' };
    }
    
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: 'File size must be less than 10MB' };
    }
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        error: `File type ${file.type} not allowed. Only JPEG, PNG, WebP, and GIF images are allowed` 
      };
    }

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', path);

    console.log('Sending request to upload API...');

    // Send to API
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }

    const result = await response.json();
    console.log('Upload successful:', result);

    return {
      success: true,
      url: result.url
    };

  } catch (error: any) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message || 'Failed to upload image'
    };
  }
}
  // Delete image from storage
  static async deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!imageUrl || !imageUrl.includes('firebase')) {
        return {
          success: false,
          error: 'Invalid image URL'
        };
      }

      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      
      console.log('Image deleted successfully:', imageUrl);
      
      return {
        success: true
      };
    } catch (error: any) {
      console.error('Error deleting image:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete image'
      };
    }
  }

  // Get courses by category
  static async getCoursesByCategory(category: string, pageSize?: number): Promise<CoursesResponse> {
    try {
      if (!category || category.trim() === '') {
        return {
          success: false,
          error: 'Category is required'
        };
      }

      let q = query(
        collection(db, COLLECTION_NAME),
        where('category', '==', category),
        where('status', '==', 'published'),
        orderBy('createdAt', 'desc')
      );

      if (pageSize) {
        q = query(q, firestoreLimit(pageSize));
      }

      const querySnapshot = await getDocs(q);
      
      const courses: Course[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        courses.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Course);
      });

      return {
        success: true,
        data: courses
      };
    } catch (error: any) {
      console.error('Error fetching courses by category:', error);
      const errorMessage = handleFirestoreError(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Get published courses only
  static async getPublishedCourses(pageSize?: number): Promise<CoursesResponse> {
    return this.getAllCourses({ 
      status: 'published', 
      pageSize: pageSize || 50 
    });
  }

  // Get draft courses only
  static async getDraftCourses(pageSize?: number): Promise<CoursesResponse> {
    return this.getAllCourses({ 
      status: 'draft', 
      pageSize: pageSize || 50 
    });
  }

  // Search courses
  static async searchCourses(searchTerm: string, options?: {
    pageSize?: number;
    category?: string;
    level?: string;
    status?: 'draft' | 'published';
  }): Promise<CoursesResponse> {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return this.getAllCourses(options);
      }

      return this.getAllCourses({
        ...options,
        searchTerm: searchTerm.trim()
      });
    } catch (error: any) {
      console.error('Error searching courses:', error);
      const errorMessage = handleFirestoreError(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Get course statistics
  static async getCourseStats(): Promise<{
    success: boolean;
    data?: {
      totalCourses: number;
      publishedCourses: number;
      draftCourses: number;
      totalStudents: number;
      totalRevenue: number;
      categories: { [key: string]: number };
      levels: { [key: string]: number };
    };
    error?: string;
  }> {
    try {
      const response = await this.getAllCourses();
      
      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || 'Failed to fetch courses for statistics'
        };
      }

      const courses = response.data;
      const stats = {
        totalCourses: courses.length,
        publishedCourses: courses.filter(c => c.status === 'published').length,
        draftCourses: courses.filter(c => c.status === 'draft').length,
        totalStudents: courses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0),
        totalRevenue: courses.reduce((sum, c) => sum + ((c.price || 0) * (c.enrolledStudents || 0)), 0),
        categories: {} as { [key: string]: number },
        levels: {} as { [key: string]: number }
      };

      // Calculate category distribution
      courses.forEach(course => {
        if (course.category) {
          stats.categories[course.category] = (stats.categories[course.category] || 0) + 1;
        }
      });

      // Calculate level distribution
      courses.forEach(course => {
        if (course.level) {
          stats.levels[course.level] = (stats.levels[course.level] || 0) + 1;
        }
      });

      return {
        success: true,
        data: stats
      };
    } catch (error: any) {
      console.error('Error fetching course statistics:', error);
      const errorMessage = handleFirestoreError(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Update course status (publish/unpublish)
  static async updateCourseStatus(courseId: string, status: 'draft' | 'published'): Promise<CourseResponse> {
    try {
      if (!courseId || courseId.trim() === '') {
        return {
          success: false,
          error: 'Course ID is required'
        };
      }

      if (!['draft', 'published'].includes(status)) {
        return {
          success: false,
          error: 'Status must be either "draft" or "published"'
        };
      }

      return this.updateCourse(courseId, { 
        status,
        lastUpdated: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Error updating course status:', error);
      const errorMessage = handleFirestoreError(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Duplicate course
  static async duplicateCourse(courseId: string, newTitle?: string): Promise<CourseResponse> {
    try {
      const originalCourse = await this.getCourseById(courseId);
      
      if (!originalCourse.success || !originalCourse.data) {
        return {
          success: false,
          error: originalCourse.error || 'Original course not found'
        };
      }

      const course = originalCourse.data;
      const duplicatedCourse: NewCourse = {
        ...course,
        title: newTitle || `${course.title} (Copy)`,
        slug: (newTitle || `${course.title} (Copy)`).toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        status: 'draft',
        enrolledStudents: 0,
        rating: 0,
        totalRatings: 0,
        lastUpdated: new Date().toISOString()
      };

      // Remove fields that shouldn't be duplicated
      delete (duplicatedCourse as any)._id;
      delete (duplicatedCourse as any).createdAt;
      delete (duplicatedCourse as any).updatedAt;

      return this.createCourse(duplicatedCourse);
    } catch (error: any) {
      console.error('Error duplicating course:', error);
      const errorMessage = handleFirestoreError(error);
      return {
        success: false,
        error: errorMessage
      };
    }
  }
}