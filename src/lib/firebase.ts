import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

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

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export const storage = getStorage(app);

// Error handling helper
export const handleFirestoreError = (error: any) => {
  console.error('Firestore Error:', error);
  
  if (error.code === 'unavailable') {
    console.warn('Firestore is temporarily unavailable. Please check your internet connection.');
  } else if (error.code === 'permission-denied') {
    console.warn('Permission denied. Please check Firestore security rules.');
  } else if (error.code === 'not-found') {
    console.warn('Document not found.');
  } else if (error.code === 'already-exists') {
    console.warn('Document already exists.');
  }
  
  return error.message || 'An unknown error occurred';
};

export default app;