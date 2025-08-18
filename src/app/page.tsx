'use client';

import { BackyardPage } from '@/components/backyard-page';
import firebaseApp from '../lib/firebaseConfig';
import { getAuth, User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'; // Import getAuth and User from firebase/auth
import { useEffect, useState } from 'react';

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(firebaseApp); // Get auth instance using getAuth and firebaseApp
  useEffect(() => {
    onAuthStateChanged(auth, (user: User | null) => {
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

