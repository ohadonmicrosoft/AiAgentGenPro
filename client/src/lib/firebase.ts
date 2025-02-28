import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";
import { getAnalytics, isSupported } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDzCFi1YlcMYNfZ0_I0uECf5UGljFqebG4",
  authDomain: "ai-agent-gen-pro.firebaseapp.com",
  projectId: "ai-agent-gen-pro",
  storageBucket: "ai-agent-gen-pro.firebasestorage.app",
  messagingSenderId: "977931434163",
  appId: "1:977931434163:web:f91959ce07d84e419bd8c6",
  measurementId: "G-9XL86THRM5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const functions = getFunctions(app);

// Connect to emulators in development environment
if (import.meta.env.DEV) {
  // Check if we should connect to emulators
  const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';
  
  if (useEmulators) {
    console.log('Connecting to Firebase emulators...');
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectStorageEmulator(storage, 'localhost', 9199);
    connectFunctionsEmulator(functions, 'localhost', 5001);
  }
}

// Initialize analytics if available
let analytics = null;

export const initAnalytics = async () => {
  if (await isSupported()) {
    analytics = getAnalytics(app);
    return analytics;
  }
  return null;
};

export { app, auth, db, storage, functions, analytics }; 