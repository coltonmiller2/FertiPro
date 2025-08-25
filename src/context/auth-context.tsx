'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  AuthError
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

// Helper to get a user-friendly error message
const getFirebaseErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email address is already in use by another account.';
    case 'auth/invalid-email':
      return 'This email address is not valid.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    case 'auth/weak-password':
      return 'The password is too weak.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUpWithEmail: (email: string, pass: string) => Promise<string | null>;
  signInWithEmail: (email: string, pass: string) => Promise<string | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUpWithEmail: async () => null,
  signInWithEmail: async () => null,
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUpWithEmail = async (email: string, password: string): Promise<string | null> => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return null;
    } catch (error) {
      return getFirebaseErrorMessage(error as AuthError);
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<string | null> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return null;
    } catch (error) {
      return getFirebaseErrorMessage(error as AuthError);
    }
  };


  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  const value = { user, loading, signUpWithEmail, signInWithEmail, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  return useContext(AuthContext);
};