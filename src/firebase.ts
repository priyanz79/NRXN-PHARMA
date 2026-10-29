import AsyncStorage from '@react-native-async-storage/async-storage';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth, initializeAuth, Persistence } from 'firebase/auth';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

if (firebaseConfigured) {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig as Record<string, string>);
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    try {
      const { getReactNativePersistence } = require('@firebase/auth') as { getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence };
      auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
    } catch {
      auth = getAuth(app);
    }
  }
}

export function requireFirebaseAuth() {
  if (!auth) throw new Error('Firebase is not configured yet. Add the NRXN Firebase project settings and restart the app.');
  return auth;
}

export { auth };
