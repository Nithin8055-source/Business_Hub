
'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { X, Plus, Loader2, ArrowLeft, MoreVertical, Eye, Edit, Trash2, Download, FileText, Smile } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useUser, useRealtimeDB, useRTDBList } from '@/firebase';
import { addInvoice, updateInvoice, deleteInvoice, type Invoice, type LineItem } from '@/firebase/rtdb/invoices';
import { addTransaction } from '@/firebase/rtdb/transactions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateInvoicePdf } from '@/lib/pdf-generator';
import type { Database } from 'firebase/database';
import { deductCredits, getCreditCost } from '@/lib/credits';

type View = { type: 'list' } | { type: 'create' } | { type: 'edit'; invoiceId: string };

const InvoiceForm = ({
  initialInvoice,
  onSave,
  isSaving,
  onCancel,
}: {
  initialInvoice: Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'total'>;
  onSave: (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'total'>) => void;
  isSaving: boolean;
  onCancel: () => void;
}) => {
  const [invoice, setInvoice] = useState(initialInvoice);
  const [error, setError] = useState('');

  const handleAddItem = () => {
    setInvoice(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, price: 0 }] }));
  };

  const handleRemoveItem = (index: number) => {
    setInvoice(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }));
  };

  const handleItemChange = (index: number, field: keyof LineItem, value: string | number) => {
    const items = [...invoice.items];
    const item = { ...items[index] };
    (item[field] as any) = value;
    items[index] = item;
    setInvoice(prev => ({ ...prev, items }));
  };

  const handleFieldChange = (field: keyof Omit<Invoice, 'items' | 'invoiceDate' | 'dueDate' | 'id' | 'createdAt' | 'subtotal' | 'total'>, value: string) => {
    setInvoice(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSelectChange = (field: 'paymentMethod' | 'currency' | 'taxType', value: string) => {
    setInvoice(prev => ({ ...prev, [field]: value as any }));
  };

  const handleDateChange = (field: 'invoiceDate' | 'dueDate', value: string) => {
    setInvoice(prev => ({ ...prev, [field]: new Date(value).toISOString() }));
  }

  const handleSave = () => {
    if (!invoice.businessName.trim() || !invoice.clientName.trim()) {
      setError('Business Name and Client Name are required.');
      return;
    }
    if (invoice.items.some(item => !item.description || item.quantity <= 0 || item.price < 0)) {
        setError('All line items must have a description, quantity greater than 0, and a non-negative price.');
        return;
    }
    if(invoice.paymentMethod === 'link' && !invoice.linkPayUrl){
        setError('Payment URL is required for Link Pay.');
        return;
    }
    setError('');
    onSave(invoice);
  };
  
  const currencySymbol = invoice.currency;
  const calculateSubtotal = () => invoice.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
  const subtotal = calculateSubtotal();
  const taxAmount = invoice.taxType === 'amount' ? invoice.tax : subtotal * (invoice.tax / 100);
  const totalAmount = subtotal + taxAmount;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">📄 Create Invoice</CardTitle>
        <CardDescription>Fill out the details below to generate a new professional invoice. ({getCreditCost('invoice-generator')} credits)</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-bold text-lg">Your Business Info</h3>
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" value={invoice.businessName} onChange={e => handleFieldChange('businessName', e.target.value)} placeholder="e.g., AI-BUSINESS-HUB Inc." />
            </div>
             <div className="space-y-2">
              <Label htmlFor="businessAddress">Business Address</Label>
              <Input id="businessAddress" value={invoice.businessAddress} onChange={e => handleFieldChange('businessAddress', e.target.value)} placeholder="e.g., 123 Business Rd, City" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessContact">Contact (Email/Phone)</Label>
              <Input id="businessContact" value={invoice.businessContact || ''} onChange={e => handleFieldChange('businessContact', e.target.value)} placeholder="e.g., contact@synergy.com" />
            </div>
          </div>
          <div className="space-y-4 p-4 border rounded-lg">
             <h3 className="font-bold text-lg">Client Info</h3>
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input id="clientName" value={invoice.clientName} onChange={e => handleFieldChange('clientName', e.target.value)} placeholder="e.g., Jane Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientAddress">Client Address</Label>
              <Input id="clientAddress" value={invoice.clientAddress || ''} onChange={e => handleFieldChange('clientAddress', e.target.value)} placeholder="e.g., 456 Client Ave, City" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="clientContact">Client Contact (Email/Phone)</Label>
              <Input id="clientContact" value={invoice.clientContact || ''} onChange={e => handleFieldChange('clientContact', e.target.value)} placeholder="e.g., j.doe@personal.com" />
            </div>
          </div>
        </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
            <Label htmlFor="invoiceDate">Invoice Date</Label>
            <Input id="invoiceDate" type="date" value={format(new Date(invoice.invoiceDate), 'yyyy-MM-dd')} onChange={e => handleDateChange('invoiceDate', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="date" value={format(new Date(invoice.dueDate), 'yyyy-MM-dd')} onChange={e => handleDateChange('dueDate', e.target.value)} />
          </div>
        </div>

        <hr />
        <div className="space-y-4">
          <Label className="font-bold">Line Items 🛒</Label>
          {invoice.items.map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-end gap-2 p-2 border rounded-lg">
              <div className='flex-grow space-y-2'><Label htmlFor={`description-${index}`} className="text-xs text-muted-foreground">Description</Label><Input id={`description-${index}`} placeholder="Item description" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} /></div>
              <div className='space-y-2'><Label htmlFor={`quantity-${index}`} className="text-xs text-muted-foreground">Quantity</Label><Input id={`quantity-${index}`} type="number" placeholder="Qty" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)} className="w-full sm:w-20" min="1" /></div>
              <div className='space-y-2'><Label htmlFor={`price-${index}`} className="text-xs text-muted-foreground">Price</Label><div className='relative'><span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground'>{currencySymbol}</span><Input id={`price-${index}`} type="number" placeholder="Price" value={item.price} onChange={e => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)} className="w-full sm:w-28 pl-10" min="0" step="0.01" /></div></div>
              <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} disabled={invoice.items.length === 1}><X className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={handleAddItem}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>
        </div>
        <hr />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <Label>Tax</Label>
                <div className="flex gap-2">
                    <Input id="tax" type="number" value={invoice.tax} onChange={e => setInvoice(prev => ({...prev, tax: parseFloat(e.target.value) || 0}))} min="0" step="0.01" className="w-1/2"/>
                    <Select onValueChange={(value) => handleSelectChange('taxType', value)} defaultValue={invoice.taxType}>
                        <SelectTrigger className="w-1/2"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="percentage">% (Percentage)</SelectItem>
                            <SelectItem value="amount">Fixed Amount</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
             <div className="space-y-2">
                <Label>Currency 💲</Label>
                 <Select onValueChange={(value) => handleSelectChange('currency', value)} defaultValue={invoice.currency}>
                    <SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="INR">INR</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2 md:col-span-2">
                <Label>Payment Method</Label>
                <Select onValueChange={(value) => handleSelectChange('paymentMethod', value)} defaultValue={invoice.paymentMethod}>
                    <SelectTrigger><SelectValue placeholder="Select payment method" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="link">Link Pay</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {invoice.paymentMethod === 'link' && (
                 <div className="space-y-2 md:col-span-2"><Label htmlFor="linkPayUrl">Payment Link URL</Label><Input id="linkPayUrl" value={invoice.linkPayUrl || ''} onChange={e => handleFieldChange('linkPayUrl', e.target.value)} placeholder="https://your-payment-link.com" /></div>
            )}
        </div>
         <div className="space-y-2">
            <Label htmlFor="notes">Notes to Customer <Smile className="inline h-4 w-4" /></Label>
            <Textarea id="notes" value={invoice.notes || ''} onChange={e => handleFieldChange('notes', e.target.value)} placeholder="e.g., Thank you for your business!" />
        </div>

        <div className="flex justify-end items-center">
          <div className="text-right space-y-2 w-full max-w-xs p-4 bg-muted rounded-lg">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{currencySymbol} {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>{currencySymbol} {taxAmount.toFixed(2)}</span></div>
            <hr/>
            <div className="flex justify-between text-lg font-bold"><span >Total</span><span>{currencySymbol} {totalAmount.toFixed(2)}</span></div>
          </div>
        </div>

        {error && (<Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>)}
        <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>{isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Invoice</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function InvoicingPage() {
  const router = useRouter();
  const db = useRealtimeDB();
  const { user, loading: userLoading } = useUser();
  const { toast } = useToast();
  
  const invoicesPath = useMemo(() => {
    if (!user) return null;
    return `users/${user.uid}/invoices`;
  }, [user]);

  const { data: invoices, loading: invoicesLoading } = useRTDBList<Invoice>(invoicesPath);

  const [view, setView] = useState<View>({ type: 'list' });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveInvoice = async (invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'subtotal' | 'total'>) => {
    if (!user || !db) return;

    setIsSaving(true);
    
    if (view.type === 'create') {
        const creditResult = await deductCredits(db, user.uid, 'invoice-generator');
        if (!creditResult.success) {
            toast({ variant: 'destructive', title: 'Insufficient Credits', description: `You need ${creditResult.cost} credits to create an invoice.` });
            setIsSaving(false);
            return;
        }
        toast({ title: 'Invoice Created! 🚀', description: `${creditResult.cost} credits were used.` });
    }

    const subtotal = invoiceData.items.reduce((acc, i) => acc + (i.quantity * i.price), 0);
    const taxAmount = invoiceData.taxType === 'amount' ? invoiceData.tax : subtotal * (invoiceData.tax / 100);
    const total = subtotal + taxAmount;

    const finalInvoiceData = { ...invoiceData, subtotal, total };

    try {
        if (view.type === 'edit') {
            await updateInvoice(db as Database, user.uid, view.invoiceId, finalInvoiceData);
            toast({ title: 'Invoice Updated! 🎉' });
        } else {
            await addInvoice(db as Database, user.uid, finalInvoiceData);
            await addTransaction(db, user.uid, {
                type: 'income',
                amount: total,
                category: 'Invoice',
                description: `Invoice ${finalInvoiceData.invoiceNumber} to ${finalInvoiceData.clientName}`,
                date: finalInvoiceData.invoiceDate,
                status: 'pending',
                currency: finalInvoiceData.currency
            });
        }
        setView({ type: 'list' });
    } catch (error: any) {
        console.error("Failed to save invoice:", error);
        toast({ variant: 'destructive', title: 'Error Saving Invoice', description: error.message });
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (invoiceId: string) => {
    if (!user || !db) return;
    if (window.confirm('Are you sure you want to delete this invoice? This action is permanent.')) {
      try {
        await deleteInvoice(db, user.uid, invoiceId);
        toast({ title: 'Invoice Deleted' });
      } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
    }
  };

  const handleDownload = (invoice: Invoice) => {
    generateInvoicePdf(invoice);
  }

  const getInvoice = (id: string) => invoices?.find(inv => inv.id === id);
  
  if (userLoading || invoicesLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  const renderContent = () => {
    switch (view.type) {
      case 'create':
        return (
          <>
            <Button variant="ghost" onClick={() => setView({ type: 'list' })} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices</Button>
            <InvoiceForm
              initialInvoice={{
                invoiceNumber: `INV-${new Date().getTime().toString().slice(-6)}`,
                businessName: user.displayName || '',
                businessAddress: '',
                businessContact: user.email || '',
                clientName: '',
                clientAddress: '',
                clientContact: '',
                invoiceDate: new Date().toISOString(),
                dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
                items: [{ description: '', quantity: 1, price: 0 }],
                tax: 0,
                taxType: 'percentage',
                notes: '',
                currency: 'USD',
                paymentMethod: 'none',
                linkPayUrl: '',
                status: 'unpaid',
              }}
              onSave={handleSaveInvoice}
              isSaving={isSaving}
              onCancel={() => setView({ type: 'list' })}
            />
          </>
        );
      case 'edit': {
        const invoice = getInvoice(view.invoiceId);
        if (!invoice) return <div>Invoice not found</div>;
        return (
          <>
            <Button variant="ghost" onClick={() => setView({ type: 'list' })} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices</Button>
            <InvoiceForm
              initialInvoice={invoice}
              onSave={handleSaveInvoice}
              isSaving={isSaving}
              onCancel={() => setView({ type: 'list' })}
            />
          </>
        );
      }
      case 'list':
      default:
        return (
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <div>
                <CardTitle className="font-headline text-2xl flex items-center gap-2"><FileText />Invoices</CardTitle>
                <CardDescription>Manage your invoices here. Create, view, and send them to your clients.</CardDescription>
              </div>
              <Button onClick={() => setView({ type: 'create' })}><Plus className="mr-2 h-4 w-4" /> Create Invoice</Button>
            </CardHeader>
            <CardContent>
              {!invoices || invoices.length === 0 ? (
                <div className="text-center text-muted-foreground py-12"><p>No invoices yet. 🤷</p><p>Click "Create Invoice" to get started!</p></div>
              ) : (
                <div className="space-y-4">
                  {invoices.map(invoice => {
                    const currencySymbol = invoice.currency;
                    return (
                        <Card key={invoice.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4">
                        <div className="flex-grow">
                            <p className="font-semibold">Invoice {invoice.invoiceNumber} - {invoice.clientName}</p>
                            <p className="text-sm text-muted-foreground">Due: {format(new Date(invoice.dueDate), 'PPP')}</p>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>{invoice.status}</Badge>
                            <p className="font-semibold text-lg">{currencySymbol} {invoice.total.toFixed(2)}</p>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => router.push(`/invoice/${user.uid}_${invoice.id}`)}><Eye className="mr-2 h-4 w-4" /> View Public</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleDownload(invoice)}><Download className="mr-2 h-4 w-4" /> Download PDF</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => setView({ type: 'edit', invoiceId: invoice.id })}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => handleDelete(invoice.id)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
    }
  };

  return <div className="container mx-auto px-4 py-12">{renderContent()}</div>;
}
