'use client';

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
  useCallback,
} from 'react';
import {
  getAuth,
  onAuthStateChanged,
  type User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { app } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import Loading from '@/app/loading';
import type { DailyPlan } from '@/lib/types';
import { getPlan, savePlan } from '@/lib/database';

const auth = getAuth(app);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<any>;
  signOut: () => Promise<any>;
  signUp: (email: string, pass: string) => Promise<any>;
  plan: DailyPlan | null;
  setPlan: (plan: DailyPlan | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [plan, setPlanState] = useState<DailyPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userPlan = await getPlan(user.uid);
        setPlanState(userPlan);
      } else {
        setPlanState(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setPlan = useCallback(async (newPlan: DailyPlan | null) => {
    if (user) {
        await savePlan(user.uid, newPlan);
        setPlanState(newPlan);
    }
  }, [user]);

  const signIn = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const signUp = (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setPlanState(null);
  };

  const publicRoutes = ['/login'];
  const isPublicPath = publicRoutes.includes(pathname) || pathname === '/';


  useEffect(() => {
    if (!loading && !user && !isPublicPath) {
      router.push('/login');
    }
  }, [loading, user, isPublicPath, router]);
  
  // Show a loading screen for protected routes while we verify the user.
  if (loading && !isPublicPath) {
    return <Loading />;
  }

  const value = { user, loading, signIn, signOut, signUp, plan, setPlan };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
