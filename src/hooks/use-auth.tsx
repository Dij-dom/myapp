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
import { savePlan, syncPlan } from '@/lib/database';

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
    let unsubscribeSync: (() => void) | null = null;
  
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      if (unsubscribeSync) {
        unsubscribeSync();
        unsubscribeSync = null;
      }
      
      if (user) {
        unsubscribeSync = syncPlan(user.uid, (newPlan) => {
          setPlanState(newPlan);
        });
      } else {
        setPlanState(null);
      }
      
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSync) {
        unsubscribeSync();
      }
    };
  }, []);

  const setPlan = useCallback(async (newPlan: DailyPlan | null) => {
    if (!user) {
      throw new Error("User must be logged in to set a plan.");
    }
    await savePlan(user.uid, newPlan);
  }, [user]);

  const signIn = (email: string, pass: string) => {
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const signUp = (email: string, pass: string) => {
    return createUserWithEmailAndPassword(auth, email, pass);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const publicRoutes = ['/login'];

  useEffect(() => {
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [loading, user, pathname, router]);
  
  if (loading && !publicRoutes.includes(pathname)) {
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
