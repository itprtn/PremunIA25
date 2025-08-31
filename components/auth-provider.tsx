"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "../lib/supabase"
import { useNavigate } from "react-router-dom"

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Vérifier la session initiale
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting session:', error);
        }

        if (mounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          setInitialized(true);

          // Si l'utilisateur est connecté et sur la page de login, rediriger vers le dashboard
          if (session?.user && window.location.pathname === '/login') {
            navigate('/', { replace: true });
          }
          // Si l'utilisateur n'est pas connecté et n'est pas sur la page de login, rediriger vers login
          else if (!session?.user && window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
            navigate('/login', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        setUser(session?.user ?? null);

        if (event === 'SIGNED_IN') {
          // Attendre un peu pour s'assurer que l'état est mis à jour
          setTimeout(() => {
            if (window.location.pathname === '/login' || window.location.pathname === '/signup') {
              navigate('/', { replace: true });
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/login', { replace: true });
        }

        // Marquer comme initialisé après le premier changement d'état
        if (!initialized) {
          setInitialized(true);
        }
        setLoading(false);
      }
    });

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, initialized]);

  return <AuthContext.Provider value={{ user, loading, signOut: handleSignOut }}>{children}</AuthContext.Provider>;
}
