import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

interface FirebaseConfigOptions {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

// Determine environment configuration
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env || {};
const envConfig: FirebaseConfigOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID,
};

const hasValidConfig = Boolean(
  envConfig.apiKey &&
  envConfig.projectId &&
  envConfig.apiKey.length > 5
);

export const isFirebaseConfigured = hasValidConfig;

if (hasValidConfig) {
  try {
    if (!getApps().length) {
      app = initializeApp({
        apiKey: envConfig.apiKey,
        authDomain: envConfig.authDomain || `${envConfig.projectId}.firebaseapp.com`,
        projectId: envConfig.projectId,
        storageBucket: envConfig.storageBucket || `${envConfig.projectId}.appspot.com`,
        messagingSenderId: envConfig.messagingSenderId,
        appId: envConfig.appId,
      });
    } else {
      app = getApps()[0];
    }

    authInstance = getAuth(app);
    // Firestore setup with optional databaseId
    dbInstance = envConfig.firestoreDatabaseId
      ? getFirestore(app, envConfig.firestoreDatabaseId)
      : getFirestore(app);
  } catch (error) {
    console.warn('Firebase initialization notice:', error);
  }
}

export const firebaseApp = app;
export const auth = authInstance;
export const db = dbInstance;

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  projectId: string | null;
  authDomain: string | null;
  missingFields: string[];
}

export function getFirebaseConfigStatus(): FirebaseConfigStatus {
  const missing: string[] = [];
  if (!envConfig.apiKey) missing.push('VITE_FIREBASE_API_KEY');
  if (!envConfig.projectId) missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!envConfig.appId) missing.push('VITE_FIREBASE_APP_ID');

  return {
    isConfigured: hasValidConfig,
    projectId: envConfig.projectId || null,
    authDomain: envConfig.authDomain || null,
    missingFields: missing,
  };
}
