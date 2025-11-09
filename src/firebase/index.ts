
'use client';

import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore, initializeFirestore } from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';
import { firebaseConfig } from './config';
import { FirebaseProvider, useFirebase, useFirebaseApp, useAuth, useFirestore, useRealtimeDB } from './provider';
import { FirebaseClientProvider } from './client-provider';
import { useRTDBList } from './rtdb/use-list';
import { useRTDBValue } from './rtdb/use-value';
import { useUser } from './auth/use-user';

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  database: Database;
};

let instances: FirebaseInstances;

// This function initializes Firebase and applies the necessary settings.
// It's structured to prevent re-initialization and race conditions.
function initializeFirebase() {
  if (instances) {
    return instances;
  }

  try {
    const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const auth: Auth = getAuth(app);
    // This is the critical fix. We are initializing Firestore with settings
    // that force long-polling, which is more reliable in restricted network environments.
    const firestore: Firestore = initializeFirestore(app, {
        experimentalForceLongPolling: true,
        useFetchStreams: false,
    });
    const database: Database = getDatabase(app);
    
    instances = { app, auth, firestore, database };
    return instances;

  } catch (e) {
    console.error("Firebase initialization error", e);
    // Provide null-like instances to prevent app crash on initialization failure.
    const app = {} as FirebaseApp;
    const auth = {} as Auth;
    const firestore = {} as Firestore;
    const database = {} as Database;
    instances = { app, auth, firestore, database };
    return instances;
  }
}

// Call initialization immediately so instances are ready for import.
initializeFirebase();

export function getFirebaseInstances(): FirebaseInstances {
    // This function now simply returns the already initialized instances.
    return instances;
}

export {
    FirebaseProvider,
    FirebaseClientProvider,
    useRTDBList,
    useRTDBValue,
    useUser,
    useFirebase,
    useFirebaseApp,
    useAuth,
    useFirestore,
    useRealtimeDB,
};
