// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Replace these values with your actual Firebase Web Project configuration keys
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "nelcyra-exports.firebaseapp.com",
  projectId: "nelcyra-exports",
  storageBucket: "nelcyra-exports.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase app instance safely for server-side rendering (SSR) environments
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Export the Firestore database entry pointer
export const db = getFirestore(app);