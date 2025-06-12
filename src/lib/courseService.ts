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
  writeBatch
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
      // Convert empty strings to empty string for optional fields (don't use null)
      if (typeof value === 'string' && value === '' && 
          ['paymentLink', 'backgroundImage', 'certificateImage'].includes(key)) {
        cleaned[key] = '';
      } else {
        cleaned[key] = value;
      }
    }
  }
  
  return cleaned;
};

export class CourseService {
  // Create a new course
  static async createCourse(courseData: NewCourse): Promise<CourseResponse> {
    try {
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
        learningOutcomes: Array.isArray(courseData.learningOutcomes) ? courseData.learningOutcomes : [],
        features: Array.isArray(courseData.features) ? courseData.features : [],
        skills: Array.isArray(courseData.skills) ? courseData.skills : [],
        requirements: Array.isArray(courseData.requirements) ? courseData.requirements : [],
        module: Array.isArray(courseData.module) ? courseData.module : [],
        highlights: Array.isArray(courseData.highlights) ? courseData.highlights : [],
        project: Array.isArray(courseData.project) ? courseData.project : [],
        programFor: Array.isArray(courseData.programFor) ? courseData.programFor : [],
        // Ensure strings are not undefined
        title: courseData.title || '',
        slug: courseData.slug || '',
        shortDescription: courseData.shortDescription || '',
        category: courseData.category || '',
        level: courseData.level || 'beginner',
        language: courseData.language || '',
        duration: courseData.duration || '',
        hours: courseData.hours || '',
        programBy: courseData.programBy || 'Admin',
        lastUpdated: courseData.lastUpdated || new Date().toISOString(),
        paymentLink: courseData.paymentLink || '',
        backgroundImage: courseData.backgroundImage || '',
        certificateImage: courseData.certificateImage || '',
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
      
      console.log('Creating course with cleaned data:', cleanedData);
      
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

  // Get all courses
  static async getAllCourses(): Promise<CoursesResponse> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
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
        updatedAt: data.updatedAt?.toDate() || new Date()
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

  // Update course
  static async updateCourse(courseId: string, courseData: Partial<Course>): Promise<CourseResponse> {
    try {
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
        // Ensure numeric fields are properly typed
        ...(courseData.rating !== undefined && { rating: Number(courseData.rating) }),
        ...(courseData.totalRatings !== undefined && { totalRatings: Number(courseData.totalRatings) }),
        ...(courseData.enrolledStudents !== undefined && { enrolledStudents: Number(courseData.enrolledStudents) }),
        ...(courseData.price !== undefined && { price: Number(courseData.price) }),
        ...(courseData.originalPrice !== undefined && { originalPrice: Number(courseData.originalPrice) }),
      };

      // Clean the data before sending
      const cleanedData = cleanCourseData(updateData);
      
      console.log('Updating course with cleaned data:', cleanedData);

      await updateDoc(docRef, cleanedData);

      const updatedCourse: Course = {
        ...courseData,
        _id: courseId,
        updatedAt: new Date()
      } as Course;

      return {
        success: true,
        data: updatedCourse
      };
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
      const q = query(collection(db, COLLECTION_NAME), where('_id', '==', courseId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return {
          success: false,
          error: 'Course not found'
        };
      }

      const docRef = querySnapshot.docs[0].ref;
      await deleteDoc(docRef);

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

  // Upload image with better error handling
  static async uploadImage(file: File, path: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      // Validate file
      if (!file) {
        return { success: false, error: 'No file provided' };
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        return { success: false, error: 'File size must be less than 5MB' };
      }
      
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
      }
      
      const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const storageRef = ref(storage, `${path}/${filename}`);
      
      console.log('Uploading image:', filename);
      
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        url: downloadURL
      };
    } catch (error: any) {
      console.error('Error uploading image:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload image'
      };
    }
  }

  // Delete image
  static async deleteImage(imageUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
      
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
}