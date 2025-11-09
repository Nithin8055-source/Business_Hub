'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser, useRealtimeDB } from '@/firebase';
import { ref, get } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Users, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

type Room = {
  id: string;
  name: string;
  companyName: string;
  creator: string;
  maxMembers: number;
  participants: Record<string, { uid: string; displayName: string; photoURL: string; }>;
};

function JoinRoom() {
  const { user, loading: userLoading } = useUser();
  const db = useRealtimeDB();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const roomId = searchParams.get('roomId');
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    if (!db || !roomId) {
      setError('No Room ID provided.');
      setLoading(false);
      return;
    }

    const fetchRoom = async () => {
      const roomRef = ref(db, `rooms/${roomId}`);
      try {
        const snapshot = await get(roomRef);
        if (snapshot.exists()) {
          setRoom({ id: snapshot.key, ...snapshot.val() });
        } else {
          setError('Room not found. Please check the ID and try again.');
        }
      } catch (err) {
        console.error('Failed to fetch room:', err);
        setError('An error occurred while fetching room details.');
        toast({ variant: 'destructive', title: 'Database Error' });
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [db, roomId, user, userLoading, router, toast]);

  const handleJoin = () => {
    if (!room || !user) return;
    const participantCount = room.participants ? Object.keys(room.participants).length : 0;
    if (participantCount >= room.maxMembers && !room.participants?.[user.uid]) {
        toast({
            variant: 'destructive',
            title: 'Room is Full',
            description: 'This room has reached its maximum capacity.',
        });
        return;
    }
    router.push(`/collaboration?roomId=${roomId}`);
  };

  if (loading || userLoading) {
    return <div className="flex justify-center items-center h-[calc(100vh-theme(spacing.14))]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  const participantCount = room?.participants ? Object.keys(room.participants).length : 0;

  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {error ? (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive"/> Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">{error}</p>
              <Button asChild className="w-full mt-4">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </CardContent>
          </>
        ) : room ? (
          <>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">{room.name}</CardTitle>
              <CardDescription>{room.companyName || 'No company specified'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-md bg-muted">
                <span className="text-muted-foreground">Room ID</span>
                <span className="font-mono">{room.id}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-md bg-muted">
                <span className="text-muted-foreground">Participants</span>
                <div className="flex items-center gap-2">
                    <Users className="h-5 w-5"/>
                    <span>{participantCount} / {room.maxMembers}</span>
                </div>
              </div>
               <Button onClick={handleJoin} className="w-full font-headline" size="lg">
                Join Room
              </Button>
               <Button variant="link" asChild className="w-full">
                <Link href="/dashboard">Cancel</Link>
              </Button>
            </CardContent>
          </>
        ) : null}
      </Card>
    </div>
  );
}

export default function JoinPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
            <JoinRoom />
        </Suspense>
    )
}
