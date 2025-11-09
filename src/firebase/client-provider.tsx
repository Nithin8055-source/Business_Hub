'use client';

import React from 'react';
import { getFirebaseInstances } from './index';
import { FirebaseProvider } from './provider';

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // getFirebaseInstances now returns pre-initialized instances,
  // ensuring no race conditions.
  const instances = getFirebaseInstances();
  
  return <FirebaseProvider {...instances}>{children}</FirebaseProvider>;
}
