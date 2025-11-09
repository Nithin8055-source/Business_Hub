
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileUp, AlertCircle } from 'lucide-react';
import { analyzeDocument, AnalyzeDocumentOutput } from '@/ai/ai-document-analysis';
import { useRouter } from 'next/navigation';
import { useUser, useRealtimeDB } from '@/firebase';
import { deductCredits, getCreditCost } from '@/lib/credits';
import { useToast } from '@/hooks/use-toast';


export default function DocumentAiPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const db = useRealtimeDB();
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeDocumentOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, userLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setAnalysis(null);
    }
  };
  
  const fileToDataUri = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to analyze.');
      return;
    }
    if (!user || !db) {
        setError('You must be logged in to use this feature.');
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    const creditResult = await deductCredits(db, user.uid, 'document-intelligence');

    if (!creditResult.success) {
        toast({ variant: 'destructive', title: 'Insufficient Credits', description: `You need ${creditResult.cost} credits to analyze a document.` });
        setIsLoading(false);
        return;
    }

    try {
      const documentDataUri = await fileToDataUri(file);
      const result = await analyzeDocument({ documentDataUri });
      setAnalysis(result);
      toast({ title: 'Analysis Complete', description: `${creditResult.cost} credits were used.` });
    } catch (err) {
      console.error(err);
      setError('An error occurred during document analysis. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (userLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Document Intelligence</CardTitle>
            <CardDescription>Upload a document (PDF, DOCX) to get an AI-powered summary and risk assessment. Cost: {getCreditCost('document-intelligence')} credits.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="document">Document File</Label>
                <div 
                  className="relative flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Input 
                    id="document" 
                    type="file" 
                    ref={fileInputRef}
                    className="sr-only"
                    onChange={handleFileChange}
                    accept=".pdf,.docx" 
                  />
                   {file ? (
                    <p className="text-center text-sm text-muted-foreground">{file.name}</p>
                   ) : (
                    <div className="text-center">
                      <FileUp className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Click to upload or drag and drop</p>
                      <p className="text-xs text-muted-foreground">PDF or DOCX</p>
                    </div>
                   )}
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading || !file}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Analyze Document
              </Button>
            </form>

            {analysis && (
              <div className="mt-8 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-headline">Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-bold">Summary</h3>
                      <p className="text-sm whitespace-pre-wrap">{analysis.summary}</p>
                    </div>
                    <hr/>
                    <div>
                      <h3 className="font-bold">Risk Assessment</h3>
                      <p className="text-sm whitespace-pre-wrap">{analysis.riskAssessment}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
