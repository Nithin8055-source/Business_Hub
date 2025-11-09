
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Rocket, ExternalLink, FileText, Presentation, Workflow, Download } from 'lucide-react';
import { 
  generateStartupWorkflow,
  StartupWorkflowOutput
} from '@/ai/ai-startup-generator';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useUser, useRealtimeDB } from '@/firebase';
import { useRouter } from 'next/navigation';
import { deductCredits, getCreditCost } from '@/lib/credits';
import { useToast } from '@/hooks/use-toast';

export default function StartupGeneratorPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const db = useRealtimeDB();
  const { toast } = useToast();

  const [idea, setIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StartupWorkflowOutput | null>(null);
  const cost = getCreditCost('startup-generator');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) {
      setError('Please enter a startup idea.');
      return;
    }
    if (!user || !db) {
      router.push('/auth/signin');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const creditResult = await deductCredits(db, user.uid, 'startup-generator');
    if (!creditResult.success) {
      toast({ variant: 'destructive', title: 'Insufficient Credits', description: `You need ${creditResult.cost} credits to use the Startup Generator.` });
      setIsLoading(false);
      return;
    }

    try {
      const workflowResult = await generateStartupWorkflow({ idea });
      setResult(workflowResult);
      toast({ title: 'Startup Assets Generated!', description: `${creditResult.cost} credits were used.` });
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the startup assets. Please try again.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownloadText = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Failed to download image:', error);
      setError('Could not download the logo. Please try again.');
    }
  };


  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2"><Rocket /> Startup Generator</CardTitle>
            <CardDescription>Describe your startup idea, and our AI will generate a business plan, logo, pitch deck, and execution workflow for you. ({cost} credits)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="idea">Your Startup Idea</Label>
                <Textarea
                  id="idea"
                  placeholder="e.g., A platform that connects local farmers directly with consumers using a subscription model."
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={4}
                  disabled={isLoading}
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading || userLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Generating...' : 'Generate Startup Assets'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {isLoading && !result && (
           <Card className="mt-8">
             <CardHeader>
               <Skeleton className="h-8 w-3/4" />
             </CardHeader>
             <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <h3 className="font-bold text-lg mb-2">Business Plan</h3>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 mt-4">Execution Workflow</h3>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg mb-2">Logo</h3>
                        <Skeleton className="aspect-square w-full rounded-lg" />
                        <h3 className="font-bold text-lg mb-2 mt-4">Pitch Deck</h3>
                        <Skeleton className="h-10 w-full" />
                    </div>
                </div>
             </CardContent>
           </Card>
        )}

        {result && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="font-headline">Your Startup: {result.startupName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg flex items-center gap-2"><FileText /> Business Plan</h3>
                                <Button variant="outline" size="sm" onClick={() => handleDownloadText(result.businessPlan, `${result.startupName}-BusinessPlan.txt`)}>
                                    <Download className="mr-2 h-4 w-4" /> Download
                                </Button>
                            </div>
                            <div className="prose prose-sm max-w-none text-card-foreground whitespace-pre-wrap">{result.businessPlan}</div>
                        </div>
                        <div>
                           <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg flex items-center gap-2"><Workflow /> Execution Workflow</h3>
                                 <Button variant="outline" size="sm" onClick={() => handleDownloadText(result.workflow, `${result.startupName}-Workflow.txt`)}>
                                    <Download className="mr-2 h-4 w-4" /> Download
                                </Button>
                            </div>
                            <div className="prose prose-sm max-w-none text-card-foreground whitespace-pre-wrap">{result.workflow}</div>
                        </div>
                    </div>
                    <div className="space-y-6">
                         <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold text-lg">Logo</h3>
                                <Button variant="outline" size="sm" onClick={() => handleDownloadImage(result.logoImageUrl, `${result.startupName}-Logo.jpg`)}>
                                    <Download className="mr-2 h-4 w-4" /> Download
                                </Button>
                            </div>
                            <div className="aspect-square relative w-full rounded-lg overflow-hidden border">
                                <Image src={result.logoImageUrl} alt={`${result.startupName} Logo`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" data-ai-hint="logo"/>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Presentation /> Pitch Deck</h3>
                            <Button asChild className="w-full">
                                <a href={result.pitchDeckUrl} target="_blank" rel="noopener noreferrer">
                                View Pitch Deck <ExternalLink className="ml-2 h-4 w-4" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
