import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBbXCsSagLkQfqvBSeYgd4s1ugplCZQxp4",
  authDomain: "dtaxi-sp.firebaseapp.com",
  projectId: "dtaxi-sp",
  storageBucket: "dtaxi-sp.firebasestorage.app",
  messagingSenderId: "295873272748",
  appId: "1:295873272748:web:da13cda63420f93620b809",
  measurementId: "G-WQLJGJEW8C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;
