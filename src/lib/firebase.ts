// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add your own Firebase configuration from your Firebase project settings
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY,
  authDomain: "hackathon-2025-bill-split.firebaseapp.com",
  projectId: "hackathon-2025-bill-split",
  storageBucket: "hackathon-2025-bill-split.appspot.com",
  messagingSenderId: "912019911607",
  appId: "1:912019911607:web:e34b271b581ccc5f34ee32",
  measurementId: "G-NE8HKJ7YGM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
