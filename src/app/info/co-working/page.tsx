
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UsersRound, Zap, Briefcase, CreditCard } from 'lucide-react';
import { getCreditCost } from '@/lib/credits';

export default function CoWorkingInfoPage() {
  const router = useRouter();
  const cost = getCreditCost('co-working-room');

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => router.push('/info')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Info
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl flex items-center gap-3">
              <UsersRound className="h-8 w-8 text-primary" /> Co-working Rooms
            </CardTitle>
            <CardDescription>Real-time collaboration spaces for your team and clients.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-muted-foreground">
            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><Briefcase className="h-5 w-5" /> How It Helps Your Business</h2>
              <p>Virtual co-working rooms break down communication barriers, allowing for instant feedback, brainstorming sessions, and project discussions. Use them to onboard new clients, sync with your team on a critical project, or host virtual meetups. This fosters a more connected and efficient work environment, regardless of where your team members are located.</p>
            </div>
            
            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><Zap className="h-5 w-5" /> Step-by-Step Guide</h2>
              <ol className="list-decimal list-inside space-y-3">
                <li>
                  <span className="font-semibold text-foreground">Navigate to the Dashboard:</span> From the main menu, go to the Co-working Dashboard.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Create a Room:</span> Fill in a 'Room Name', an optional 'Company Name', and set the maximum number of members. Click 'Create Room'. A unique Room ID will be generated.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Share the ID:</span> Copy the generated Room ID and share it with the colleagues or clients you want to invite.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Join a Room:</span> On the dashboard, paste a Room ID into the 'Join an Existing Room' field and click 'Join Room'.
                </li>
                <li>
                  <span className="font-semibold text-foreground">Collaborate:</span> Once inside, you can chat in real-time, see who is currently in the room, and use the AI Meeting Assistant to summarize your discussions into actionable notes.
                </li>
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="font-headline text-xl text-foreground flex items-center gap-2"><CreditCard className="h-5 w-5" /> Credit System</h2>
              <ul className="list-disc list-inside space-y-2">
                <li><span className="font-bold text-foreground">Creating a Room:</span> Costs <span className="font-bold text-primary">{cost} credits</span>. This is a one-time fee per room creation.</li>
                <li><span className="font-bold text-foreground">Joining a Room:</span> Free for all participants.</li>
                <li><span className="font-bold text-foreground">AI Meeting Summary:</span> Using the AI assistant to summarize the chat transcript is an AI feature and costs <span className="font-bold text-primary">{getCreditCost('document-intelligence')} credits</span> per use.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
