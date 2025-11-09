
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Rocket, Zap, Briefcase, CreditCard } from 'lucide-react';
import { getCreditCost } from '@/lib/credits';

export default function StartupGeneratorInfoPage() {
  const router = useRouter();
  const cost = getCreditCost('startup-generator');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => router.push('/info')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Info
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl flex items-center gap-3">
              <Rocket className="h-8 w-8 text-primary" /> Startup Generator
            </CardTitle>
            <CardDescription>Turn your fleeting ideas into actionable business plans.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-muted-foreground">
            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><Briefcase className="h-5 w-5" /> How It Helps Your Business</h2>
              <p>The journey from idea to execution is one of the hardest parts of starting a business. The Startup Generator bridges this gap by taking your core concept and transforming it into a structured set of assets. It provides a business name, a solid business plan, an execution workflow, a placeholder logo, and a link to a pitch deck template. This gives you a massive head start, saving you weeks of research and planning.</p>
            </div>
            
            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><Zap className="h-5 w-5" /> Step-by-Step Guide</h2>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <span className="font-semibold text-foreground">Navigate to the Feature:</span> From the main dashboard, select 'Startup Generator'.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Describe Your Idea:</span> In the text area, write a detailed description of your startup idea. The more detail you provide, the better the AI's output will be.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Generate Assets:</span> Click the 'Generate Startup Assets' button.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Review and Download:</span> The AI will generate a complete startup package, including a name, business plan, workflow, logo, and a link to a pitch deck. You can download the text-based assets and the logo image directly from the results card.
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><CreditCard className="h-5 w-5" /> Credit System</h2>
              <p>Generating a full set of startup assets costs <span className="font-bold text-primary">{cost} credits</span>. This single fee includes the business plan, workflow, logo, and pitch deck link.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
