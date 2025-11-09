
'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: Error) => {
      // In a real app, you'd likely want to log this to a service
      // or display a more user-friendly message.
      // For this dev environment, we'll throw to show the Next.js overlay.
      if (process.env.NODE_ENV === 'development') {
        console.error("Caught Firestore Permission Error:", error.message);
        // Throwing the error will make it visible in the Next.js error overlay
        throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.removeListener('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
