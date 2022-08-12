// Import the functions you need from the SDKs you need
import type { FirebaseApp } from "firebase/app";
import type { setUserId as fSetUserId, setUserProperties as fSetUserProperties, logEvent as fLogEvent } from 'firebase/analytics'

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app: FirebaseApp | null = null;
export let setUserId: typeof fSetUserId | null;
export let setUserProperties: typeof fSetUserProperties | null;
export let logEvent: typeof fLogEvent | null;

// Initialize Firebase
export async function loadFirebase(): Promise<FirebaseApp> {
  if (!app) {
    app = (await import('firebase/app')).initializeApp(firebaseConfig);
  }
  return app;
}

export const loadAnalytics = async () => {
  if (!app)
    throw Error('Firebase app not initialized');

  const { getAnalytics, setUserId: fSetUserId, setUserProperties: fSetUserProperties, logEvent: fLogEvent } = await import('firebase/analytics');
  const analytics = getAnalytics(app);

  setUserId = fSetUserId;
  setUserProperties = fSetUserProperties;
  logEvent = fLogEvent;

  return analytics;
}
