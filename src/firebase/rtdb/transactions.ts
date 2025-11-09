'use client';
import {
  ref,
  push,
  update,
  remove,
  serverTimestamp,
  type Database,
  set,
} from 'firebase/database';

export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: 'USD' | 'INR';
  category: string;
  description?: string;
  date: string;
  status: 'paid' | 'pending';
  createdAt?: any;
};

// Add a new transaction for a user
export const addTransaction = async (
  db: Database,
  userId: string,
  transactionData: Omit<Transaction, 'id' | 'createdAt'>
) => {
  const transactionsRef = ref(db, `users/${userId}/transactions`);
  const newTransactionRef = push(transactionsRef);
  const data = { ...transactionData, createdAt: serverTimestamp(), id: newTransactionRef.key };
  await set(newTransactionRef, data);
  return newTransactionRef;
};

// Delete a transaction
export const deleteTransaction = async (
  db: Database,
  userId: string,
  transactionId: string
) => {
  const transactionRef = ref(db, `users/${userId}/transactions/${transactionId}`);
  await remove(transactionRef);
};
