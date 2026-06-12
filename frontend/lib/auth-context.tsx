"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase, hasSupabase } from "./supabase";

type User = {
  id: string;
  email: string;
  name?: string;
  onboarded?: boolean;
};

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  signUp: async () => null,
  signIn: async () => null,
  signOut: async () => {},
});

// Mock auth when Supabase not configured
function useMockAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("lb_user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const signUp = async (email: string, _password: string, name: string) => {
    const u = { id: crypto.randomUUID(), email, name, onboarded: false };
    localStorage.setItem("lb_user", JSON.stringify(u));
    setUser(u);
    return null;
  };

  const signIn = async (email: string, _password: string) => {
    const stored = localStorage.getItem("lb_user");
    if (stored) {
      const u = JSON.parse(stored);
      if (u.email === email) { setUser(u); return null; }
    }
    const u = { id: crypto.randomUUID(), email, name: email.split("@")[0], onboarded: false };
    localStorage.setItem("lb_user", JSON.stringify(u));
    setUser(u);
    return null;
  };

  const signOut = async () => {
    localStorage.removeItem("lb_user");
    setUser(null);
  };

  return { user, loading, signUp, signIn, signOut };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const mock = useMockAuth();
  const [sbUser, setSbUser] = useState<User | null>(null);
  const [sbLoading, setSbLoading] = useState(hasSupabase);

  useEffect(() => {
    if (!hasSupabase) return;
    supabase.auth.getSession().then(({ data }: { data: any }) => {
      if (data.session?.user) {
        setSbUser({
          id: data.session.user.id,
          email: data.session.user.email!,
          name: data.session.user.user_metadata?.name,
          onboarded: data.session.user.user_metadata?.onboarded,
        });
      }
      setSbLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e: any, session: any) => {
      setSbUser(session?.user ? {
        id: session.user.id,
        email: session.user.email!,
        name: session.user.user_metadata?.name,
        onboarded: session.user.user_metadata?.onboarded,
      } : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!hasSupabase) {
    return <AuthContext.Provider value={mock}>{children}</AuthContext.Provider>;
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email, password, options: { data: { name, onboarded: false } },
    });
    return error?.message || null;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message || null;
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <AuthContext.Provider value={{ user: sbUser, loading: sbLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
