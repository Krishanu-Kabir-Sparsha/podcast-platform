import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import type { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  isReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isReady: false,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (mounted) {
          if (error) {
            console.warn("Unable to restore session on init", error.message);
          } else {
            setSession(data.session);
            setUser(data.session?.user ?? null);
          }
          setLoading(false);
          setIsReady(true);
        }
      } catch (err) {
        console.warn("Auth initialization failed", err);
        if (mounted) {
          setLoading(false);
          setIsReady(true);
        }
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
          setIsReady(true);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn("Sign out failed", error.message);
      } else {
        setSession(null);
        setUser(null);
      }
    } catch (err) {
      console.warn("Sign out exception", err);
    }
  };

  const value = useMemo(
    () => ({ user, session, loading, isReady, signOut }),
    [user, session, loading, isReady]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
