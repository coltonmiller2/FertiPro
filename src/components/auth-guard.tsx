
'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Leaf } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user is in the allowedUsers collection
    const checkAuthorization = async () => {
      if (user?.email) {
        const userDocRef = doc(db, 'allowedUsers', user.email);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setIsAllowed(true);
          } else {
            setIsAllowed(false);
          }
        } catch (error) {
          console.error("Error checking user authorization:", error);
          setIsAllowed(false);
        }
      } else {
        setIsAllowed(false);
      }
      setChecking(false);
    };

    checkAuthorization();

  }, [user, authLoading, router]);

  if (authLoading || checking) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAllowed) {
     return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
        <div className="flex w-full max-w-sm flex-col items-center rounded-lg border bg-card p-8 text-card-foreground shadow-lg">
           <div className="mb-6 flex items-center gap-2 text-2xl font-semibold">
             <Leaf className="h-8 w-8 text-destructive" />
             <span>Backyard Bounty</span>
           </div>
           <h1 className="text-xl font-bold mb-4">Access Denied</h1>
          <p className="mb-8 text-center text-muted-foreground">
            You do not have permission to access this application. Please contact the administrator.
          </p>
           <button onClick={logout} className="w-full text-sm underline">
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
