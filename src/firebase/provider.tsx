'use client';

import React, { createContext, useContext } from 'react';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import type { Database } from 'firebase/database';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

type FirebaseInstances = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  database: Database;
};

const FirebaseContext = createContext<FirebaseInstances | null>(null);

export const FirebaseProvider = ({
  children,
  ...instances
}: {
  children: React.ReactNode;
} & FirebaseInstances) => {
  // Ensure that we have a valid app instance before rendering the provider.
  // This prevents children from trying to use a null/undefined context.
  if (!instances.app?.options?.apiKey) {
    return <>{children}</>;
  }
  return (
    <FirebaseContext.Provider value={instances}>
      {children}
      <FirebaseErrorListener />
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseInstances | null => useContext(FirebaseContext);
export const useFirebaseApp = (): FirebaseApp | null => useContext(FirebaseContext)?.app ?? null;
export const useAuth = (): Auth | null => useContext(FirebaseContext)?.auth ?? null;
export const useFirestore = (): Firestore | null => useContext(FirebaseContext)?.firestore ?? null;
export const useRealtimeDB = (): Database | null => useContext(FirebaseContext)?.database ?? null;
