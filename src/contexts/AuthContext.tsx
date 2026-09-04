import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase, isConfigured } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initialSessionResolved = useRef(false);

  useEffect(() => {
    // If Supabase is not configured (no env vars), resolve immediately
    // so the app renders instead of hanging on a blank screen.
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        if (event === "INITIAL_SESSION") return;
        setSession(session);
        if (initialSessionResolved.current) setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      initialSessionResolved.current = true;
      setLoading(false);
    }).catch(() => {
      // If getSession fails (network error, invalid URL), resolve loading
      if (!mounted) return;
      initialSessionResolved.current = true;
      setLoading(false);
    });

    // Safety timeout: if auth resolution takes > 3s, force resolve
    const timeout = setTimeout(() => {
      if (mounted && !initialSessionResolved.current) {
        initialSessionResolved.current = true;
        setLoading(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
    if (isConfigured) {
      await supabase.auth.signOut();
    }
    setSession(null);
  };

  const value = { session, user: session?.user ?? null, loading, signOut };

  return <AuthContext.Provider value={value}>{loading ? null : children}</AuthContext.Provider>;
}
