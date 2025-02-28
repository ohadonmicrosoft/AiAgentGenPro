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
  measurementId: "G-9XL86THRM5",
};

// Initialize Firebase with error handling
let app;
let auth;
let db;
let storage;
let functions;
let analytics = null;

try {
  app = initializeApp(firebaseConfig);
  console.log("Firebase app initialized successfully");
  
  // Initialize Firebase services with error handling
  try {
    auth = getAuth(app);
    console.log("Firebase Auth initialized successfully");
  } catch (authError) {
    console.error("Error initializing Firebase Auth:", authError);
    // Create a fallback auth instance to prevent app crashes
    auth = { currentUser: null };
  }
  
  try {
    db = getFirestore(app);
    console.log("Firebase Firestore initialized successfully");
  } catch (dbError) {
    console.error("Error initializing Firestore:", dbError);
    // Create a minimal fallback db object
    db = {};
  }
  
  try {
    storage = getStorage(app);
    console.log("Firebase Storage initialized successfully");
  } catch (storageError) {
    console.error("Error initializing Firebase Storage:", storageError);
    storage = {};
  }
  
  try {
    functions = getFunctions(app);
    console.log("Firebase Functions initialized successfully");
  } catch (functionsError) {
    console.error("Error initializing Firebase Functions:", functionsError);
    functions = {};
  }
  
  // Connect to emulators in development environment
  if (import.meta.env.DEV) {
    try {
      // Check if we should connect to emulators
      const useEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";

      if (useEmulators) {
        console.log("Connecting to Firebase emulators...");
        try {
          connectAuthEmulator(auth, "http://localhost:9099");
          console.log("Connected to Auth emulator");
        } catch (e) {
          console.error("Failed to connect to Auth emulator:", e);
        }
        
        try {
          connectFirestoreEmulator(db, "localhost", 8080);
          console.log("Connected to Firestore emulator");
        } catch (e) {
          console.error("Failed to connect to Firestore emulator:", e);
        }
        
        try {
          connectStorageEmulator(storage, "localhost", 9199);
          console.log("Connected to Storage emulator");
        } catch (e) {
          console.error("Failed to connect to Storage emulator:", e);
        }
        
        try {
          connectFunctionsEmulator(functions, "localhost", 5001);
          console.log("Connected to Functions emulator");
        } catch (e) {
          console.error("Failed to connect to Functions emulator:", e);
        }
      }
    } catch (emulatorError) {
      console.error("Error setting up emulators:", emulatorError);
    }
  }
} catch (firebaseError) {
  console.error("Error initializing Firebase:", firebaseError);
  
  // Create fallback objects to prevent app crashes
  app = {};
  auth = { currentUser: null };
  db = {};
  storage = {};
  functions = {};
  
  // Show error in UI if possible
  const errorContainer = document.getElementById('error-container');
  const fallbackElement = document.getElementById('fallback-ui');
  
  if (errorContainer && fallbackElement) {
    errorContainer.style.display = 'block';
    fallbackElement.style.display = 'block';
    errorContainer.textContent = `Firebase initialization error: ${firebaseError.message}`;
  }
}

// Initialize analytics if available
export const initAnalytics = async () => {
  try {
    if (await isSupported()) {
      analytics = getAnalytics(app);
      console.log("Firebase Analytics initialized successfully");
      return analytics;
    }
  } catch (analyticsError) {
    console.error("Error initializing Firebase Analytics:", analyticsError);
  }
  return null;
};

export { app, auth, db, storage, functions, analytics };
