
'use client';

import Link from 'next/link';
import { BrainCircuit, Home, LogOut, Gem, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useRTDBValue } from '@/firebase';

export default function Header() {
  const router = useRouter();
  const auth = useAuth();
  const { user, loading } = useUser();
  
  const userProfilePath = user ? `users/${user.uid}` : null;
  const { data: userProfile, loading: profileLoading } = useRTDBValue<{ credits: number }>(userProfilePath);

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline">AI-BUSINESS-HUB</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/info">
              <Info className="h-5 w-5" />
              <span className="sr-only">Info</span>
            </Link>
          </Button>
          <ThemeToggle />
          {loading ? (
            <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
          ) : user ? (
            <>
              <div className="flex items-center gap-2 border rounded-full px-3 py-1 text-sm font-medium">
                  <Gem className="h-4 w-4 text-primary" />
                  <span>{profileLoading ? '...' : (userProfile?.credits ?? 0)}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL ?? ''} alt={user.displayName ?? ''} />
                      <AvatarFallback>{user.displayName?.charAt(0) ?? user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
