'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, mapSupabaseUser } from './supabase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<{ needsConfirmation: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to check if user email is confirmed
  const isEmailConfirmed = (supabaseUser: any): boolean => {
    return supabaseUser?.email_confirmed_at !== null && supabaseUser?.email_confirmed_at !== undefined;
  };

  useEffect(() => {
    // Check active sessions and set up auth state listener
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setUser(null);
          setLoading(false);
          return;
        }

        if (session?.user) {
          // Only set user if email is confirmed
          if (isEmailConfirmed(session.user)) {
            setUser(mapSupabaseUser(session.user));
          } else {
            // User exists but email not confirmed - clear session
            await supabase.auth.signOut();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setLoading(false);
        return;
      }

      if (session?.user) {
        // Only set user if email is confirmed
        if (isEmailConfirmed(session.user)) {
          setUser(mapSupabaseUser(session.user));
        } else {
          // Email not confirmed - don't set user
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshUser = async () => {
    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
      if (error) {
        setUser(null);
        return;
      }

      if (supabaseUser && isEmailConfirmed(supabaseUser)) {
        setUser(mapSupabaseUser(supabaseUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user) {
      // Check if email is confirmed
      if (!isEmailConfirmed(data.user)) {
        await supabase.auth.signOut();
        throw new Error('Please confirm your email before signing in. Check your inbox for the confirmation link.');
      }
      setUser(mapSupabaseUser(data.user));
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Don't set user - they need to confirm email first
    // Return status to show confirmation message
    return {
      needsConfirmation: data.user !== null && !isEmailConfirmed(data.user),
    };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
