
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Zap, Briefcase, CreditCard } from 'lucide-react';
import { getCreditCost } from '@/lib/credits';

export default function DocumentIntelligenceInfoPage() {
  const router = useRouter();
  const cost = getCreditCost('document-intelligence');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => router.push('/info')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Info
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" /> Document Intelligence
            </CardTitle>
            <CardDescription>AI-powered analysis for your business and legal documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-muted-foreground">
            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><Briefcase className="h-5 w-5" /> How It Helps Your Business</h2>
              <p>Reviewing dense documents like contracts, partnership agreements, or terms of service is time-consuming and prone to human error. Document Intelligence uses AI to quickly scan your documents, provide a concise summary of the key points, and flag potential risks or unfavorable clauses. This saves you valuable time, reduces legal costs, and empowers you to make more informed decisions.</p>
            </div>
            
            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><Zap className="h-5 w-5" /> Step-by-Step Guide</h2>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <span className="font-semibold text-foreground">Navigate to the Feature:</span> From the main dashboard, select 'Document Intelligence'.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Upload Your Document:</span> Click on the upload area to select a PDF or DOCX file from your computer.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Analyze:</span> Once a file is selected, click the 'Analyze Document' button.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Review Results:</span> The AI will process the document and generate two sections: a 'Summary' of the document's main purpose and key clauses, and a 'Risk Assessment' that highlights potential issues or areas that require closer attention.
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><CreditCard className="h-5 w-5" /> Credit System</h2>
              <p>Analyzing one document costs <span className="font-bold text-primary">{cost} credits</span>. This is a flat fee per document, regardless of the number of pages.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
