
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useRealtimeDB } from '@/firebase';
import { ref, set, serverTimestamp } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, LogIn, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { nanoid } from 'nanoid';
import { Label } from '@/components/ui/label';
import { deductCredits, getCreditCost } from '@/lib/credits';

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const db = useRealtimeDB();
  const router = useRouter();
  const { toast } = useToast();

  const [newRoomName, setNewRoomName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [maxMembers, setMaxMembers] = useState(10);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

  const [joinRoomId, setJoinRoomId] = useState('');

  const coWorkingCost = getCreditCost('co-working-room');

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || !user || !db) return;

    setIsCreatingRoom(true);
    const creditResult = await deductCredits(db, user.uid, 'co-working-room');

    if (!creditResult.success) {
      toast({
        variant: 'destructive',
        title: 'Insufficient Credits',
        description: `You need ${creditResult.cost} credits to create a room.`,
      });
      setIsCreatingRoom(false);
      return;
    }

    const roomId = nanoid(6);
    const roomsRef = ref(db, `rooms/${roomId}`);
    
    const roomData = {
      name: newRoomName,
      companyName: companyName,
      maxMembers: maxMembers,
      creator: user.uid,
      createdAt: serverTimestamp(),
      participants: {
        [user.uid]: {
            uid: user.uid,
            displayName: user.displayName || 'Anonymous',
            photoURL: user.photoURL || ''
        },
      },
    };

    try {
      await set(roomsRef, roomData);
      setNewRoomName('');
      setCompanyName('');
      setMaxMembers(10);
      setCreatedRoomId(roomId);
      toast({
        title: 'Room Created!',
        description: `Your unique room ID is ${roomId}. Share it with your team! ${creditResult.cost > 0 ? `${creditResult.cost} credits were used.` : ''}`,
      });
    } catch (error) {
      console.error('Error creating room:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the room. Please try again.',
      });
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomId.trim() || !user || !db) {
      toast({ variant: 'destructive', title: 'Please enter a Room ID.' });
      return;
    }
    
    router.push(`/join?roomId=${joinRoomId}`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Room ID Copied!' });
  };
  
  if (userLoading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!user) {
    router.push('/auth/signin');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <Card>
          <CardHeader>
              <CardTitle className="font-headline text-3xl">Co-working Dashboard</CardTitle>
              <CardDescription>Create a new co-working space or join an existing one.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-8">
              <div>
                  <h2 className="text-xl font-headline mb-4">Create a New Room ({coWorkingCost > 0 ? `${coWorkingCost} credits` : 'Free'})</h2>
                  {!createdRoomId ? (
                      <form onSubmit={handleCreateRoom} className="space-y-4">
                          <div>
                              <Label htmlFor="roomName">Room Name</Label>
                              <Input
                                  id="roomName"
                                  placeholder="e.g., Q4 Project Sync"
                                  value={newRoomName}
                                  onChange={(e) => setNewRoomName(e.target.value)}
                                  disabled={isCreatingRoom}
                                  required
                              />
                          </div>
                          <div>
                              <Label htmlFor="companyName">Company Name (Optional)</Label>
                              <Input
                                  id="companyName"
                                  placeholder="e.g., AI-BUSINESS-HUB Inc."
                                  value={companyName}
                                  onChange={(e) => setCompanyName(e.target.value)}
                                  disabled={isCreatingRoom}
                              />
                          </div>
                          <div>
                              <Label htmlFor="maxMembers">Max Members</Label>
                              <Input
                                  id="maxMembers"
                                  type="number"
                                  value={maxMembers}
                                  onChange={(e) => setMaxMembers(Math.max(2, parseInt(e.target.value) || 2))}
                                  disabled={isCreatingRoom}
                                  min="2"
                                  required
                              />
                          </div>
                          <Button type="submit" className="w-full" disabled={isCreatingRoom || !newRoomName.trim()}>
                              {isCreatingRoom ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                              Create Room
                          </Button>
                      </form>
                  ) : (
                      <div className="p-4 border rounded-lg bg-muted flex flex-col items-center text-center">
                          <h3 className="font-bold text-lg">Your Room is Ready!</h3>
                          <p className="text-muted-foreground text-sm mt-1 mb-4">Share this ID with your team to let them join.</p>
                          <div className="flex items-center gap-2 p-2 rounded-md bg-background border w-full justify-between">
                              <span className="font-mono text-lg">{createdRoomId}</span>
                              <Button variant="ghost" size="icon" onClick={() => copyToClipboard(createdRoomId)}>
                                  <Copy className="h-5 w-5" />
                              </Button>
                          </div>
                          <Button className="mt-4 w-full" onClick={() => router.push(`/collaboration?roomId=${createdRoomId}`)}>
                              Go to Room
                          </Button>
                           <Button variant="link" className="mt-2" onClick={() => setCreatedRoomId(null)}>
                              Create another room
                          </Button>
                      </div>
                  )}
              </div>
              <div>
                  <h2 className="text-xl font-headline mb-4">Join an Existing Room</h2>
                  <form onSubmit={handleJoinRoom} className="space-y-4">
                      <div>
                          <Label htmlFor="joinRoomId">Enter Room ID</Label>
                          <Input
                              id="joinRoomId"
                              placeholder="e.g., AB12CD"
                              value={joinRoomId}
                              onChange={(e) => setJoinRoomId(e.target.value)}
                          />
                      </div>
                      <Button type="submit" className="w-full" disabled={!joinRoomId.trim()}>
                          <LogIn className="mr-2 h-4 w-4" />
                          Join Room
                      </Button>
                  </form>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
