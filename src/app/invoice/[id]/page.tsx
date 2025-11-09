
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRealtimeDB, useRTDBValue } from '@/firebase';
import { markInvoiceAsPaid, type Invoice } from '@/firebase/rtdb/invoices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, ArrowLeft, Copy, CheckCircle, ShieldCheck, Download, Link as LinkIcon, Smile } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { generateInvoicePdf } from '@/lib/pdf-generator';

export default function InvoicePublicPage() {
  const router = useRouter();
  const params = useParams();
  const db = useRealtimeDB();
  const { toast } = useToast();
  const { id } = params;
  
  const [userId, invoiceId] = typeof id === 'string' ? id.split('_') : [null, null];

  const dbPath = userId && invoiceId ? `users/${userId}/invoices/${invoiceId}` : null;
  const { data: invoice, loading } = useRTDBValue<Invoice>(dbPath);

  const [isUpdating, setIsUpdating] = useState(false);
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${type} Copied!` });
  };
  
  const handleMarkAsPaid = async () => {
    if (!db || !userId || !invoiceId) return;
    setIsUpdating(true);
    try {
      await markInvoiceAsPaid(db, userId, invoiceId);
      toast({ title: 'Payment Confirmed! 🎉', description: 'The invoice has been marked as paid.' });
    } catch(e: any) {
        console.error(e);
        toast({variant: "destructive", title: 'Error', description: 'Could not update invoice status.'});
    } finally {
        setIsUpdating(false);
    }
  }
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-screen">
          <Card className="w-full max-w-md text-center">
             <CardHeader>
                <CardTitle>Invoice Not Found</CardTitle>
                <CardDescription>The requested invoice could not be found. It may have been deleted or the link is incorrect.</CardDescription>
            </CardHeader>
             <CardContent>
                 <Button onClick={() => router.push('/invoicing')}><ArrowLeft className="mr-2 h-4 w-4"/> Go Back</Button>
            </CardContent>
          </Card>
      </div>
    );
  }

  const isPaid = invoice.status === 'paid';
  const currencySymbol = invoice.currency;
  const taxAmount = invoice.taxType === 'amount' ? invoice.tax : (invoice.items.reduce((acc, item) => acc + item.quantity * item.price, 0)) * (invoice.tax / 100);
  const subtotal = invoice.items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  const total = subtotal + taxAmount;

  return (
    <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-4">
                    <Button variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => generateInvoicePdf(invoice)}><Download className="mr-2 h-4 w-4"/> Download PDF</Button>
                        <Button variant="outline" onClick={() => copyToClipboard(window.location.href, "Invoice Link")}><Copy className="mr-2 h-4 w-4"/> Copy Link</Button>
                    </div>
                </div>

                {isPaid && (
                    <Alert className="mb-4 border-green-500 text-green-700 bg-green-50">
                        <CheckCircle className="h-4 w-4 !text-green-700" />
                        <AlertTitle className="font-bold">Payment Confirmed</AlertTitle>
                        <AlertDescription>
                            This invoice was marked as paid on {format(new Date(), 'PPP')}. Thank you for your business!
                        </AlertDescription>
                    </Alert>
                )}

                <Card className="overflow-hidden shadow-lg">
                    <CardContent className="p-8">
                        <header className="flex justify-between items-start mb-10">
                            <div>
                                <h1 className="text-3xl font-headline flex items-center gap-2">
                                  Invoice {invoice.invoiceNumber}
                                </h1>
                                <div className="text-muted-foreground mt-1">
                                    <p>Date: {format(new Date(invoice.invoiceDate), 'PPP')}</p>
                                    <p>Due: {format(new Date(invoice.dueDate), 'PPP')}</p>
                                </div>
                            </div>
                            <Badge variant={isPaid ? "default" : "destructive"} className="text-lg px-4 py-1">{invoice.status.toUpperCase()}</Badge>
                        </header>

                        <div className="grid md:grid-cols-2 gap-8 mb-10">
                            <div>
                                <h3 className="font-semibold text-muted-foreground mb-2">From</h3>
                                <p className="font-bold">{invoice.businessName}</p>
                                <p>{invoice.businessAddress}</p>
                                <p>{invoice.businessContact}</p>
                            </div>
                            <div className="md:text-right">
                                <h3 className="font-semibold text-muted-foreground mb-2">To</h3>
                                <p className="font-bold">{invoice.clientName}</p>
                                <p>{invoice.clientAddress}</p>
                                <p>{invoice.clientContact}</p>
                            </div>
                        </div>

                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted"><th className="text-left py-2 px-4">Description</th><th className="py-2 px-4 text-center">Qty</th><th className="py-2 px-4 text-right">Price</th><th className="py-2 px-4 text-right">Total</th></tr>
                            </thead>
                            <tbody>
                                {invoice.items.map((item, index) => (
                                <tr key={index} className="border-b"><td className="py-3 px-4">{item.description}</td><td className="text-center py-3 px-4">{item.quantity}</td><td className="text-right py-3 px-4">{currencySymbol} {item.price.toFixed(2)}</td><td className="text-right py-3 px-4 font-medium">{currencySymbol} {(item.quantity * item.price).toFixed(2)}</td></tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="flex justify-end mt-6">
                            <div className="w-full max-w-sm space-y-2">
                                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{currencySymbol} {subtotal.toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Tax ({invoice.taxType === 'percentage' ? `${invoice.tax}%` : 'fixed'})</span><span>{currencySymbol} {taxAmount.toFixed(2)}</span></div>
                                <hr/>
                                <div className="flex justify-between text-xl font-bold"><span >Total</span><span>{currencySymbol} {total.toFixed(2)}</span></div>
                            </div>
                        </div>
                        
                        {invoice.notes && (
                            <div className="mt-10 pt-6 border-t">
                                <h3 className="font-semibold mb-2 flex items-center gap-2"><Smile /> A Note for You</h3>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
                            </div>
                        )}
                    </CardContent>

                    {!isPaid && (
                        <CardFooter className="bg-muted/50 p-6 flex-col sm:flex-row justify-center items-center gap-4">
                            {invoice.paymentMethod === 'link' && invoice.linkPayUrl && <Button asChild size="lg"><a href={invoice.linkPayUrl} target="_blank" rel="noopener noreferrer"><LinkIcon className="mr-2"/> Pay Now</a></Button>}
                            
                            <Button onClick={handleMarkAsPaid} variant="outline" disabled={isUpdating}>
                                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <ShieldCheck className="mr-2 h-4 w-4" />}
                                I have paid
                            </Button>
                        </CardFooter>
                    )}
                </Card>
                 <p className="text-center text-xs text-muted-foreground mt-8">
                    © {new Date().getFullYear()} {invoice.businessName}. All Rights Reserved.
                </p>
            </div>
        </div>
    </div>
  );
}

    