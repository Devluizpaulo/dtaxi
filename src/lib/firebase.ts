import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBG_O5NYSVqK6Dt5wpMRGHcBhwPcgwqqZ0",
  authDomain: "dtaxisp1234.firebaseapp.com",
  projectId: "dtaxisp1234",
  storageBucket: "dtaxisp1234.firebasestorage.app",
  messagingSenderId: "340013543609",
  appId: "1:340013543609:web:f2bf0e941ca53545976b68",
  measurementId: "G-R7KXRJHXRD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
