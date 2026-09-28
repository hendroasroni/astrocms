import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const apiKey = import.meta.env.PUBLIC_FIREBASE_API_KEY || "AIzaSy_demo_api_key_placeholder";

const firebaseConfig = {
  apiKey,
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: import.meta.env.PUBLIC_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId: import.meta.env.PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID || "1:1234567890:web:abcdef",
};

export const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = getAuth(app);
