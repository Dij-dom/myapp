// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  projectId: 'studio-6966152041-79123',
  appId: '1:891300300826:web:8fc8dd9767843e91bce9a3',
  apiKey: 'AIzaSyBZwxUtU-4N7s1kD76ACfzrQCK3iily54M',
  authDomain: 'studio-6966152041-79123.firebaseapp.com',
  measurementId: '',
  messagingSenderId: '891300300826',
  databaseURL: 'https://studio-6966152041-79123-default-rtdb.firebaseio.com'
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
