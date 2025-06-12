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
  where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { Course, NewCourse, CoursesResponse, CourseResponse } from '@/types/courses';
import { v4 as uuidv4 } from 'uuid';

const COLLECTION_NAME = 'courses';

export class CourseService {
  // Create a new course
  static async createCourse(courseData: NewCourse): Promise<CourseResponse> {
    try {
      const courseWithId = {
        ...courseData,
        _id: uuidv4(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: courseData.status || 'draft'
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), courseWithId);
      
      const createdCourse: Course = {
        ...courseWithId,
        createdAt: new Date(),
        updatedAt: new Date()
      } as Course;

      return {
        success: true,
        data: createdCourse
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create course'
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
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as Course);
      });

      return {
        success: true,
        data: courses
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch courses'
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
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      } as Course;

      return {
        success: true,
        data: course
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch course'
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
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updateData);

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
      return {
        success: false,
        error: error.message || 'Failed to update course'
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
      return {
        success: false,
        error: error.message || 'Failed to delete course'
      };
    }
  }

  // Upload image
  static async uploadImage(file: File, path: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const filename = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `${path}/${filename}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return {
        success: true,
        url: downloadURL
      };
    } catch (error: any) {
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
      return {
        success: false,
        error: error.message || 'Failed to delete image'
      };
    }
  }
}