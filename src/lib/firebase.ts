import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getFirestore } from "firebase/firestore";

// --- REPLACE WITH YOUR ACTUAL FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyCmPwslZ5uTkdP2midSXtCllYRMluxZlIE",
  authDomain: "tutorate-2025.firebaseapp.com",
  projectId: "tutorate-2025",
  storageBucket: "tutorate-2025.appspot.com",
  messagingSenderId: "982451792331",
  appId: "1:982451792331:web:aef7d3c800dafe9e7cae4e"
};
// ------------------------------------------------

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export initialized services
const auth = getAuth(app);
const functions = getFunctions(app, "us-central1");
const db = getFirestore(app);

export { app, auth, functions, db };
