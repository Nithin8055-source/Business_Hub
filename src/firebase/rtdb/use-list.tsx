
'use client';

import { useState, useEffect } from 'react';
import {
  ref,
  onValue,
  off,
  query,
  type Database,
} from 'firebase/database';
import { useRealtimeDB } from '../provider';

export function useRTDBList<T>(path: string | null) {
  const db = useRealtimeDB();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !path) {
      setData(null);
      setLoading(false);
      return;
    }

    const listRef = ref(db, path);
    const listQuery = query(listRef);

    const handleValue = (snapshot: any) => {
      const val = snapshot.val();
      if (val) {
        // Convert object of objects to array of objects
        const list = Object.keys(val).map(key => ({
          ...val[key],
          id: key,
        }));
        setData(list as T[]);
      } else {
        setData([]);
      }
      setLoading(false);
    };

    onValue(listQuery, handleValue, (error) => {
        console.error(error);
        setLoading(false);
    });

    return () => {
      off(listQuery, 'value', handleValue);
    };
  }, [db, path]);

  return { data, loading };
}
