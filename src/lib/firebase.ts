import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCHdeJBSCOQCAQuWi1o3g327vbp-ygKQyQ",
  authDomain: "hash13.firebaseapp.com",
  projectId: "hash13",
  storageBucket: "hash13.firebasestorage.app",
  messagingSenderId: "893896634724",
  appId: "1:893896634724:web:77799cc345636b6f5cca71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);

// Test Firebase initialization
console.log('Firebase initialized successfully');
console.log('Storage bucket:', firebaseConfig.storageBucket);

// Enhanced error handling helper
export const handleFirestoreError = (error: any): string => {
  console.error('Firestore Error:', error);
  
  // Handle specific error codes
  switch (error.code) {
    case 'unavailable':
      return 'Service temporarily unavailable. Please check your internet connection.';
    case 'permission-denied':
      return 'Permission denied. Please check your access rights.';
    case 'not-found':
      return 'Document not found.';
    case 'already-exists':
      return 'Document already exists.';
    case 'invalid-argument':
      return 'Invalid data provided.';
    case 'failed-precondition':
      return 'Operation failed due to precondition.';
    case 'aborted':
      return 'Operation was aborted.';
    case 'out-of-range':
      return 'Document ID out of range.';
    case 'unauthenticated':
      return 'Authentication required.';
    case 'resource-exhausted':
      return 'Resource quota exceeded.';
    case 'cancelled':
      return 'Operation was cancelled.';
    case 'data-loss':
      return 'Data loss detected.';
    case 'unknown':
      return 'Unknown error occurred.';
    case 'internal':
      return 'Internal server error.';
    case 'unimplemented':
      return 'Operation not implemented.';
    case 'deadline-exceeded':
      return 'Operation deadline exceeded.';
    default:
      return error.message || 'An unexpected error occurred';
  }
};

export default app;