
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3, Zap, Briefcase, CreditCard } from 'lucide-react';
import { getCreditCost } from '@/lib/credits';

export default function AccountingInfoPage() {
  const router = useRouter();
  const cost = getCreditCost('accounting-ai');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => router.push('/info')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Info
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-primary" /> Accounting Dashboard
            </CardTitle>
            <CardDescription>Track your business finances with visual reports and AI-powered insights.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-muted-foreground">
            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><Briefcase className="h-5 w-5" /> How It Helps Your Business</h2>
              <p>A clear understanding of your finances is the backbone of any successful business. The Accounting Dashboard provides a centralized place to track all your income and expenses. With visual charts for currency breakdowns and monthly trends, you can easily monitor your financial health. The integrated AI Financial Analyst acts as your personal advisor, offering actionable suggestions to increase profitability based on your real data.</p>
            </div>
            
            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><Zap className="h-5 w-5" /> Step-by-Step Guide</h2>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <span className="font-semibold text-foreground">Automatic Tracking:</span> When you create an invoice using the Invoice Generator, it is automatically added as a 'pending' income transaction.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Add Manual Transactions:</span> Click 'Add Transaction' to manually log any other income or expense. You can specify the type, amount, currency, category, and date.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Analyze Your Financials:</span> The dashboard automatically generates charts showing your income vs. expenses for both USD and INR, as well as a monthly overview of your performance.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Get AI Insights:</span> Use the AI Financial Analyst section to ask specific questions about your finances (e.g., "Where can I cut costs?") or get general advice. The AI will analyze your transaction history and provide tailored suggestions.
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><CreditCard className="h-5 w-5" /> Credit System</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><span className="font-bold text-foreground">Viewing Dashboard & Adding Transactions:</span> Free. Managing and viewing your financial data does not cost any credits.</li>
                <li><span className="font-bold text-foreground">AI Financial Analyst:</span> Requesting insights from the AI analyst costs <span className="font-bold text-primary">{cost} credits</span> per query. This fee applies each time you click 'Get AI Insights'.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
