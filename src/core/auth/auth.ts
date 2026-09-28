import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "./firebase";

const DEMO_USER_KEY = "astro_cms_demo_session";

export interface AppUser {
  email: string | null;
  uid: string;
  isDemo?: boolean;
}

export async function login(email: string, password: string): Promise<AppUser> {
  const cleanEmail = email.trim().toLowerCase();

  // Demo Admin Credentials Bypass
  if (
    cleanEmail === "admin@pempekilen.com" && password === "admin123" ||
    cleanEmail === "admin@example.com" && password === "admin123"
  ) {
    const demoUser: AppUser = {
      email: cleanEmail,
      uid: "demo-admin-uid-99",
      isDemo: true,
    };
    if (typeof window !== "undefined") {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
      window.dispatchEvent(new Event("auth_state_change"));
    }
    return demoUser;
  }

  // Attempt real Firebase Login
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return {
      email: credential.user.email,
      uid: credential.user.uid,
      isDemo: false,
    };
  } catch (err: any) {
    // If Firebase is using placeholder key, give clear hint
    if (import.meta.env.PUBLIC_FIREBASE_API_KEY === undefined || import.meta.env.PUBLIC_FIREBASE_API_KEY === "AIzaSy_demo_api_key_placeholder") {
      throw new Error("Gunakan akun Demo: Email 'admin@pempekilen.com' & Password 'admin123', atau atur Firebase di file .env.");
    }
    throw err;
  }
}

export async function logout(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DEMO_USER_KEY);
    window.dispatchEvent(new Event("auth_state_change"));
  }
  try {
    await fbSignOut(auth);
  } catch {}
}

export async function getIdToken(): Promise<string | null> {
  if (typeof window !== "undefined") {
    const demo = localStorage.getItem(DEMO_USER_KEY);
    if (demo) return "demo-mock-id-token";
  }
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return await currentUser.getIdToken();
}

export function subscribeAuth(callback: (user: AppUser | null) => void) {
  const checkState = () => {
    if (typeof window !== "undefined") {
      const demo = localStorage.getItem(DEMO_USER_KEY);
      if (demo) {
        try {
          callback(JSON.parse(demo));
          return;
        } catch {}
      }
    }
  };

  // Check demo session first
  checkState();

  if (typeof window !== "undefined") {
    window.addEventListener("auth_state_change", checkState);
  }

  // Also subscribe to Firebase
  return onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      callback({
        email: fbUser.email,
        uid: fbUser.uid,
        isDemo: false,
      });
    } else {
      if (typeof window !== "undefined" && localStorage.getItem(DEMO_USER_KEY)) {
        return; // Retain demo user
      }
      callback(null);
    }
  });
}
