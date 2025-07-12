import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDA8t1v8IhN8HjicX0xvVS8GVCvZXesr2A",
  authDomain: "dtaxisp.firebaseapp.com",
  projectId: "dtaxisp",
  storageBucket: "dtaxisp.firebasestorage.app",
  messagingSenderId: "86958884423",
  appId: "1:86958884423:web:2f8292b6d514e999241362",
  measurementId: "G-0D7SZ1CQTG"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
