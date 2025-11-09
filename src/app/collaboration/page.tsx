'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter, useSearchParams } from 'next/navigation';
import { summarizeMeeting, SummarizeMeetingOutput } from '@/ai/ai-meeting-assistant';
import { Loader2, Send, Wand2, Users, Copy, Trash2 } from 'lucide-react';
import { useUser, useRealtimeDB } from '@/firebase';
import { ref, onValue, push, set, serverTimestamp, remove, child, onDisconnect } from 'firebase/database';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type Message = { id: string; content: string; sender: string; displayName: string; photoURL: string; timestamp: any; type: 'text'; };
type Participant = { uid: string; displayName: string; photoURL: string; };
type Room = { id: string; name: string; companyName: string; creator: string; maxMembers: number; participants: Record<string, Participant>; };

function CollaborationRoom() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get('roomId');
  const { toast } = useToast();

  const [newMessage, setNewMessage] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<SummarizeMeetingOutput | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user, loading: userLoading } = useUser();
  const db = useRealtimeDB();

  const [room, setRoom] = useState<Room | null>(null);
  const [roomLoading, setRoomLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const previousParticipants = useRef<Participant[]>([]);

  useEffect(() => {
    if (!userLoading && !user) router.push('/auth/signin');
  }, [user, userLoading, router]);

  useEffect(() => {
    if (!db || !roomId || !user) return;
    const roomRef = ref(db, `rooms/${roomId}`);

    const unsubscribeRoom = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const roomData = snapshot.val();
        const currentParticipantsList = roomData.participants ? Object.values(roomData.participants) as Participant[] : [];
        if (!roomData.participants?.[user.uid] && currentParticipantsList.length >= roomData.maxMembers) {
          toast({ variant: 'destructive', title: 'Room is Full', description: 'This room has reached its maximum number of participants.' });
          router.push('/dashboard');
          return;
        }
        setRoom({ id: snapshot.key as string, ...roomData });
        setParticipants(currentParticipantsList);
        const participantRef = child(roomRef, `participants/${user.uid}`);
        const userParticipantData: Participant = { uid: user.uid, displayName: user.displayName || 'Anonymous', photoURL: user.photoURL || '' };
        set(participantRef, userParticipantData);
        onDisconnect(participantRef).remove();
      } else {
        setRoom(null);
        toast({ variant: 'destructive', title: 'Room not found', description: 'This room may have been deleted by the host.' });
        router.push('/dashboard');
      }
      setRoomLoading(false);
    });

    const messagesRef = ref(db, `rooms/${roomId}/messages`);
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesList: Message[] = Object.keys(messagesData).map(key => ({ id: key, displayName: 'Unknown', photoURL: '', ...messagesData[key] }));
        setMessages(messagesList);
      } else setMessages([]);
      setMessagesLoading(false);
    });

    return () => {
      unsubscribeRoom();
      unsubscribeMessages();
      if (user && roomId) {
        remove(child(ref(db, `rooms/${roomId}`), `participants/${user.uid}`)).catch(()=>{});
      }
    };
  }, [db, roomId, user, userLoading, router, toast]);

  useEffect(() => {
    const currentUids = new Set(participants.map(p => p.uid));
    const prevUids = new Set(previousParticipants.current.map(p => p.uid));
    participants.forEach(p => {
      if (!prevUids.has(p.uid) && previousParticipants.current.length > 0) {
        if (p.uid !== user?.uid) toast({ title: `${p.displayName} has joined the room!` });
      }
    });
    previousParticipants.current.forEach(p => {
      if (!currentUids.has(p.uid)) {
        toast({ title: `${p.displayName} has left the room.`, variant: 'default' });
      }
    });
    previousParticipants.current = participants;
  }, [participants, user?.uid, toast]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !roomId || !db) return;
    const messagesRef = ref(db, `rooms/${roomId}/messages`);
    const newMessageRef = push(messagesRef);
    const messageData = { content: newMessage, sender: user.uid, timestamp: serverTimestamp(), type: 'text', displayName: user.displayName || 'Anonymous', photoURL: user.photoURL || '' };
    setNewMessage('');
    await set(newMessageRef, messageData);
  };

  const handleSummarize = async () => {
    if (!messages) return;
    setIsSummarizing(true);
    setSummary(null);
    const meetingTranscript = messages.map(m => `${m.displayName}: ${m.content}`).join('\n');
    try {
      const result = await summarizeMeeting({ meetingTranscript });
      setSummary(result);
      toast({ title: "Summary Generated" });
    } catch (error) {
      console.error('Failed to summarize meeting:', error);
      toast({ variant: 'destructive', title: "Summarization Failed" });
    } finally { setIsSummarizing(false); }
  };

  const handleDeleteRoom = async () => {
    if (!db || !roomId || !room || user?.uid !== room.creator) return;
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await remove(ref(db, `rooms/${roomId}`));
      toast({ title: "Room Deleted", description: "The room and all its data have been removed." });
    } catch (err) { console.error(err); toast({ variant: 'destructive', title: 'Error', description: 'Could not delete room.' }); }
  };

  const copyToClipboard = (text: string, type: string) => { navigator.clipboard.writeText(text); toast({ title: `${type} Copied!` }); };

  if (userLoading || (roomId && roomLoading)) return <div className="flex justify-center items-center h-[calc(100vh-theme(spacing.14))]"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  if (!user) return null;
  if (!roomId || (!roomLoading && !room)) {
    return (<div className="flex flex-col items-center justify-center h-[calc(100vh-theme(spacing.14))] text-center p-4"><Card className="w-full max-w-md"><CardHeader><CardTitle className="font-headline">Room not found</CardTitle></CardHeader><CardContent><p className="text-muted-foreground mb-4">Please select a room from the dashboard to start collaborating.</p><Button asChild><Link href="/dashboard">Go to Dashboard</Link></Button></CardContent></Card></div>);
  }

  const isHost = user.uid === room.creator;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 h-[80vh] flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div><CardTitle className="font-headline">{room.name}</CardTitle><CardDescription>{room.companyName}</CardDescription></div>
              <div className="flex items-center gap-4"><Button variant="outline" size="sm" onClick={() => copyToClipboard(room.id, 'Room ID')}><Copy className="mr-2 h-4 w-4" /> Copy ID</Button></div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4 p-4">
            {messagesLoading && <div className='flex justify-center'><Loader2 className="h-8 w-8 animate-spin"/></div>}
            {!messagesLoading && messages?.map((msg) => (
              <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === user.uid ? 'justify-end' : ''}`}>
                {msg.sender !== user.uid && (<Avatar className="h-8 w-8"><AvatarImage src={msg.photoURL} /><AvatarFallback>{msg.displayName.charAt(0)}</AvatarFallback></Avatar>)}
                <div className={`rounded-lg px-4 py-2 max-w-sm ${msg.sender === user.uid ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="text-sm font-semibold">{msg.sender !== user.uid ? msg.displayName : 'You'}</p>
                  <p>{msg.content}</p>
                </div>
                {msg.sender === user.uid && (<Avatar className="h-8 w-8"><AvatarImage src={user.photoURL ?? ''} /><AvatarFallback>{(user.displayName??'').charAt(0)}</AvatarFallback></Avatar>)}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </CardContent>
          <div className="p-4 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
              <Button type="submit" size="icon"><Send/></Button>
            </form>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline flex justify-between items-center">
                Participants
                <Badge variant="secondary" className="flex items-center gap-2"><Users className="h-4 w-4"/><span>{participants.length} / {room.maxMembers}</span></Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {participants.map(p => (
                <div key={p.uid} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9"><AvatarImage src={p.photoURL}/><AvatarFallback>{p.displayName.charAt(0)}</AvatarFallback></Avatar>
                    <div><p className="font-semibold">{p.displayName} {p.uid === user.uid && '(You)'}</p><p className="text-xs text-muted-foreground">{p.uid === room.creator && 'Host'}</p></div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-headline">AI Meeting Assistant</CardTitle></CardHeader>
            <CardContent><Button onClick={handleSummarize} disabled={isSummarizing || !messages || messages.length === 0} className="w-full">{isSummarizing ? <Loader2 className="animate-spin" /> : <Wand2/>} Summarize</Button></CardContent>
          </Card>

          {summary && (<Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="font-headline">Summary & Notes</CardTitle><Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(summary.summary + '\n\n' + summary.notes)}><Copy className="h-4 w-4" /></Button></CardHeader><CardContent className="space-y-4 max-h-60 overflow-y-auto"><div><h3 className="font-bold">Summary</h3><p className="text-sm whitespace-pre-wrap">{summary.summary}</p></div><div><h3 className="font-bold">Notes</h3><p className="text-sm whitespace-pre-wrap">{summary.notes}</p></div></CardContent></Card>)}

          {isHost && (<Card><CardHeader><CardTitle className="font-headline text-destructive">Host Controls</CardTitle></CardHeader><CardContent><Button variant="destructive" onClick={handleDeleteRoom} className="w-full"><Trash2 className="mr-2 h-4 w-4"/> Delete Room</Button><p className="text-xs text-muted-foreground mt-2">This will permanently delete the room and all its data for everyone.</p></CardContent></Card>)}
        </div>
      </div>
    </div>
  );
}

export default function CollaborationPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <CollaborationRoom />
    </Suspense>
  );
}
