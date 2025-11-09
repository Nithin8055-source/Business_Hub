
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Zap, Briefcase, CreditCard } from 'lucide-react';
import { getCreditCost } from '@/lib/credits';

export default function EmailGeneratorInfoPage() {
  const router = useRouter();
  const cost = getCreditCost('email-generator');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => router.push('/info')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Info
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl flex items-center gap-3">
              <Mail className="h-8 w-8 text-primary" /> AI Email Generator
            </CardTitle>
            <CardDescription>Craft the perfect professional email in seconds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-muted-foreground">
            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><Briefcase className="h-5 w-5" /> How It Helps Your Business</h2>
              <p>Writer's block is a real productivity killer. The AI Email Generator helps you overcome it by crafting well-written, professional emails for any situation. Whether you're following up with a client, sending a marketing announcement, or writing a formal request, the AI can generate a polished draft based on your goal. This saves time, improves communication quality, and ensures your messaging is always on point.</p>
            </div>
            
            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><Zap className="h-5 w-5" /> Step-by-Step Guide</h2>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <span className="font-semibold text-foreground">Navigate to the Feature:</span> From the main dashboard, select 'AI Email Generator'.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Describe Your Goal:</span> In the prompt box, clearly explain the purpose of the email (e.g., "Follow up with a client after a demo," "Announce a new product feature").
                </li>
                <li>
                  <span className="font-semibold text-foreground">Choose a Tone:</span> Select a tone from the dropdown menu (Formal, Friendly, or Marketing) that best fits the context of your email.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Generate Email:</span> Click the 'Generate Email' button. The AI will create a subject line and body for you.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Use Your Email:</span> You can then Copy the content, Save it to your account for future reference, or open it directly in Gmail to send it.
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><CreditCard className="h-5 w-5" /> Credit System</h2>
              <p>Generating one email (subject and body) costs <span className="font-bold text-primary">{cost} credits</span>. This allows you to generate high-quality drafts for all your communication needs.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
