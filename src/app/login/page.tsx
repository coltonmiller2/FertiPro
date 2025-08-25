
'use client';

import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, signInWithGoogle, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  if (loading || user) {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="flex w-full max-w-sm flex-col items-center rounded-lg border bg-card p-8 text-card-foreground shadow-lg">
        <div className="mb-6 flex items-center gap-2 text-2xl font-semibold">
          <Leaf className="h-8 w-8 text-primary" />
          <span>Backyard Bounty</span>
        </div>
        <p className="mb-8 text-center text-muted-foreground">
          Please sign in to manage your backyard.
        </p>
        <Button onClick={signInWithGoogle} className="w-full">
          Sign In with Google
        </Button>
      </div>
    </main>
  );
}
