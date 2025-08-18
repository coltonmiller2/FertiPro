'use client';

import { BackyardPage } from '@/components/backyard-page';
import { auth } from '@/lib/firebaseConfig'; // Import auth from firebaseConfig
import { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user && user.email === 'coltonmiller2@gmail.com') {
    return (
      <div>
        <button onClick={handleLogout}>Logout</button>
        <BackyardPage />
      </div>
    );
  } else {
    return (
      <div>
        <h1>Welcome to Backyard Bounty</h1>
        <p>Please sign in to continue.</p>
        <button onClick={handleLogin}>Sign in with Google</button>
      </div>
    );
  }
}

