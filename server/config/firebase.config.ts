import { appConfig } from './app.config';

/**
 * Firebase configuration object
 */
export const firebaseConfig = {
  /**
   * Firebase database URL
   */
  databaseURL: process.env.FIREBASE_DATABASE_URL || '',
  
  /**
   * Firebase storage bucket
   */
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  
  /**
   * Firebase service account (for server-side operations)
   */
  serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || undefined,
  
  /**
   * Whether to use Firebase emulators for local development
   */
  useEmulator: process.env.USE_FIREBASE_EMULATOR === 'true',
  
  /**
   * Firebase emulator ports
   */
  emulatorPorts: {
    auth: parseInt(process.env.FIREBASE_AUTH_EMULATOR_PORT || '9099', 10),
    firestore: parseInt(process.env.FIREBASE_FIRESTORE_EMULATOR_PORT || '8080', 10),
    functions: parseInt(process.env.FIREBASE_FUNCTIONS_EMULATOR_PORT || '5001', 10),
    storage: parseInt(process.env.FIREBASE_STORAGE_EMULATOR_PORT || '9199', 10),
  },
}; 