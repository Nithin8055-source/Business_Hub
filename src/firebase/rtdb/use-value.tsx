
'use client';

import { useState, useEffect } from 'react';
import {
  ref,
  onValue,
  off,
  type Database,
} from 'firebase/database';
import { useRealtimeDB } from '../provider';

export function useRTDBValue<T>(path: string | null) {
  const db = useRealtimeDB();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !path) {
      setData(null);
      setLoading(false);
      return;
    }

    const valueRef = ref(db, path);

    const handleValue = (snapshot: any) => {
      const val = snapshot.val();
      if (val) {
        setData({ ...val, id: snapshot.key } as T);
      } else {
        setData(null);
      }
      setLoading(false);
    };

    onValue(valueRef, handleValue, (error) => {
        console.error(error);
        setLoading(false);
    });

    return () => {
      off(valueRef, 'value', handleValue);
    };
  }, [db, path]);

  return { data, loading };
}
