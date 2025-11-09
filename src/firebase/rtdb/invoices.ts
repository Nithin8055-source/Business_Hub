
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

export type LineItem = {
  description: string;
  quantity: number;
  price: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  businessName: string;
  businessAddress: string;
  businessContact?: string;
  clientName: string;
  clientAddress?: string;
  clientContact?: string;
  invoiceDate: string;
  dueDate: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  taxType: 'percentage' | 'amount';
  total: number;
  notes?: string;
  currency: 'USD' | 'INR';
  paymentMethod: 'link' | 'none';
  linkPayUrl?: string;
  status: 'unpaid' | 'paid';
  createdAt: any;
};

// Add a new invoice for a user
export const addInvoice = async (
  db: Database,
  userId: string,
  invoiceData: Omit<Invoice, 'id' | 'createdAt'>
) => {
  const invoicesRef = ref(db, `users/${userId}/invoices`);
  const newInvoiceRef = push(invoicesRef);
  const data = { ...invoiceData, createdAt: serverTimestamp(), id: newInvoiceRef.key };
  await set(newInvoiceRef, data);
  return newInvoiceRef;
};

// Update an existing invoice
export const updateInvoice = async (
  db: Database,
  userId: string,
  invoiceId: string,
  invoiceData: Partial<Omit<Invoice, 'id' | 'createdAt'>>
) => {
  const invoiceRef = ref(db, `users/${userId}/invoices/${invoiceId}`);
  await update(invoiceRef, invoiceData);
};

// Delete an invoice
export const deleteInvoice = async (
  db: Database,
  userId: string,
  invoiceId: string
) => {
  const invoiceRef = ref(db, `users/${userId}/invoices/${invoiceId}`);
  await remove(invoiceRef);
};

// Mark an invoice as paid
export const markInvoiceAsPaid = (
  db: Database,
  userId: string,
  invoiceId: string
) => {
  const invoiceRef = ref(db, `users/${userId}/invoices/${invoiceId}`);
  return update(invoiceRef, { status: 'paid' });
};
