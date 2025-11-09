
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ReceiptText, Zap, Briefcase, CreditCard } from 'lucide-react';
import { getCreditCost } from '@/lib/credits';

export default function InvoicingInfoPage() {
  const router = useRouter();
  const cost = getCreditCost('invoice-generator');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => router.push('/info')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Info
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl flex items-center gap-3">
              <ReceiptText className="h-8 w-8 text-primary" /> Invoice Generator
            </CardTitle>
            <CardDescription>Create, manage, and send professional invoices effortlessly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-muted-foreground">
            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><Briefcase className="h-5 w-5" /> How It Helps Your Business</h2>
              <p>Professional invoicing is crucial for maintaining cash flow and presenting a polished brand image. This tool simplifies the entire process, from creation to tracking. It automatically logs created invoices as 'pending' income in your Accounting Dashboard, giving you a clear view of your finances. You can generate public, shareable links and downloadable PDFs for your clients, making the payment process smooth and professional.</p>
            </div>
            
            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><Zap className="h-5 w-5" /> Step-by-Step Guide</h2>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <span className="font-semibold text-foreground">Navigate to the Feature:</span> From the main dashboard, select 'Invoice Generator'.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Create a New Invoice:</span> Click 'Create Invoice' to open the form.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Fill in Details:</span> Add your business info, your client's info, invoice dates, and line items for the services or products sold.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Configure Payment:</span> Set the currency, tax, and payment method. If you select 'Link Pay', provide a URL to your payment gateway (e.g., Stripe, PayPal).
                </li>
                 <li>
                  <span className="font-semibold text-foreground">Save and Manage:</span> After saving, the invoice appears in your list. From here, you can View the public page, Download a PDF, Edit, or Delete it.
                </li>
                 <li>
                  <span className="font-semibold text-foreground">Share with Client:</span> Click 'View Public' to get a shareable link to the invoice that your client can view and pay.
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><CreditCard className="h-5 w-5" /> Credit System</h2>
              <p>Creating a new invoice costs <span className="font-bold text-primary">{cost} credits</span>. This is a one-time fee per invoice. Editing, viewing, and downloading existing invoices is free.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
