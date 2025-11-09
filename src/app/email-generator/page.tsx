
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Mail, Wand2, Copy, Save, Send } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateEmail } from '@/ai/ai-email-generator';
import type { GenerateEmailOutput, GenerateEmailInput } from '@/ai/schemas/email-generator';
import { useToast } from '@/hooks/use-toast';
import { useUser, useRealtimeDB } from '@/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';
import { useRouter } from 'next/navigation';
import { deductCredits, getCreditCost } from '@/lib/credits';

export default function EmailGeneratorPage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const db = useRealtimeDB();
  const { toast } = useToast();

  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState<GenerateEmailInput['tone']>('friendly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateEmailOutput | null>(null);
  const cost = getCreditCost('email-generator');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please describe the purpose of your email.');
      return;
    }
    if (!user || !db) {
      router.push('/auth/signin');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    const creditResult = await deductCredits(db, user.uid, 'email-generator');

    if (!creditResult.success) {
        toast({ variant: 'destructive', title: 'Insufficient Credits', description: `You need ${creditResult.cost} credits to generate an email.` });
        setIsLoading(false);
        return;
    }

    try {
      const emailResult = await generateEmail({ prompt, tone });
      setResult(emailResult);
      toast({ title: 'Email Generated!', description: `${creditResult.cost} credits were used.` });
    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the email. Please try again.');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    if (!result) return;
    const emailContent = `Subject: ${result.subject}\n\n${result.body}`;
    navigator.clipboard.writeText(emailContent);
    toast({ title: 'Email Copied!' });
  };
  
  const handleSaveEmail = async () => {
    if (!result || !user || !db) return;
    const emailsRef = ref(db, `users/${user.uid}/emails`);
    try {
      await push(emailsRef, {
        ...result,
        prompt,
        tone,
        createdAt: serverTimestamp(),
      });
      toast({ title: 'Email Saved!' });
    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Failed to save email' });
    }
  };

  const handleSendViaGmail = () => {
    if (!result) return;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(result.subject)}&body=${encodeURIComponent(result.body)}`;
    window.open(gmailUrl, '_blank');
  };

  if (userLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto grid gap-8 grid-cols-1 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center gap-2"><Wand2 /> AI Email Generator</CardTitle>
            <CardDescription>Describe your email's purpose, choose a tone, and let AI craft the perfect message for you. ({cost} credits)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">What is the goal of this email?</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., Follow up with a potential client after a great meeting."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
                <Select value={tone} onValueChange={(value: GenerateEmailInput['tone']) => setTone(value)} disabled={isLoading}>
                    <SelectTrigger id="tone"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="formal">Formal</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                </Select>
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4"/>}
                {isLoading ? 'Generating...' : 'Generate Email'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
           <CardHeader>
            <CardTitle className="font-headline text-2xl">Generated Email</CardTitle>
             <CardDescription>Review, copy, or save your AI-generated email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="space-y-4">
                  <div className="space-y-2">
                      <Label>Subject</Label>
                      <div className="border rounded-md p-3 h-10 bg-muted animate-pulse" />
                  </div>
                  <div className="space-y-2">
                      <Label>Body</Label>
                      <div className="border rounded-md p-3 h-60 bg-muted animate-pulse" />
                  </div>
              </div>
            )}
            {result && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <p id="subject" className="border rounded-md p-3 text-sm bg-muted">{result.subject}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="body">Body</Label>
                  <div id="body" className="border rounded-md p-3 text-sm h-60 overflow-y-auto whitespace-pre-wrap bg-muted">{result.body}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleCopyToClipboard}><Copy className="mr-2 h-4 w-4"/> Copy</Button>
                    <Button variant="outline" onClick={handleSaveEmail}><Save className="mr-2 h-4 w-4"/> Save</Button>
                    <Button onClick={handleSendViaGmail}><Send className="mr-2 h-4 w-4"/> Send via Gmail</Button>
                </div>
              </div>
            )}
            {!isLoading && !result && <div className="text-center text-muted-foreground py-20">Your generated email will appear here.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
