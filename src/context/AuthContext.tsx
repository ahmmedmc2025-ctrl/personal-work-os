import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isDemoUser: boolean;
  signUp: (email: string, pass: string, fullName: string) => Promise<{ error: any; needEmailConfirmation?: boolean }>;
  signIn: (email: string, pass: string) => Promise<{ error: any }>;
  signInAsDemo: () => void;
  signOut: () => Promise<void>;
  updateProfile: (fullName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'demo-user-id-12345',
  app_metadata: {},
  user_metadata: { full_name: 'Ahmed Developer' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'ahmed@workos.personal',
};

const DEMO_PROFILE: Profile = {
  id: 'demo-user-id-12345',
  email: 'ahmed@workos.personal',
  full_name: 'Ahmed Developer',
  created_at: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  const fetchProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        const newProfile: Profile = {
          id: userId,
          email,
          full_name: email.split('@')[0],
          created_at: new Date().toISOString(),
        };
        await supabase.from('profiles').insert(newProfile);
        setProfile(newProfile);
      } else if (data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const savedDemo = localStorage.getItem('work_os_demo_auth');

    if (!isSupabaseConfigured) {
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setIsDemoUser(true);
      setLoading(false);
      return;
    }

    // 1. Initial Session Restoration
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      if (session?.user) {
        localStorage.removeItem('work_os_demo_auth');
        setIsDemoUser(false);
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email || '').finally(() => {
          if (isMounted) setLoading(false);
        });
      } else if (savedDemo === 'true') {
        setUser(DEMO_USER);
        setProfile(DEMO_PROFILE);
        setIsDemoUser(true);
        setLoading(false);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsDemoUser(false);
        setLoading(false);
      }
    }).catch(err => {
      console.error('Error restoring session:', err);
      if (!isMounted) return;
      if (savedDemo === 'true') {
        setUser(DEMO_USER);
        setProfile(DEMO_PROFILE);
        setIsDemoUser(true);
      }
      setLoading(false);
    });

    // 2. Auth State Change Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      // Skip INITIAL_SESSION event to prevent race condition with getSession()
      if (event === 'INITIAL_SESSION') return;

      if (session?.user) {
        localStorage.removeItem('work_os_demo_auth');
        setIsDemoUser(false);
        setSession(session);
        setUser(session.user);
        await fetchProfile(session.user.id, session.user.email || '');
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
        setIsDemoUser(false);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, pass: string, fullName: string) => {
    localStorage.removeItem('work_os_demo_auth');
    setIsDemoUser(false);

    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      return { error };
    }

    const needEmailConfirmation = !data.session;

    if (data.session && data.user) {
      setSession(data.session);
      setUser(data.user);
      await fetchProfile(data.user.id, email);
    }

    return { error: null, needEmailConfirmation };
  };

  const signIn = async (email: string, pass: string) => {
    localStorage.removeItem('work_os_demo_auth');
    setIsDemoUser(false);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      return { error };
    }

    if (data.session && data.user) {
      setSession(data.session);
      setUser(data.user);
      await fetchProfile(data.user.id, email);
    }

    return { error: null };
  };

  const signInAsDemo = () => {
    localStorage.setItem('work_os_demo_auth', 'true');
    setUser(DEMO_USER);
    setProfile(DEMO_PROFILE);
    setIsDemoUser(true);
    setLoading(false);
  };

  const signOut = async () => {
    localStorage.removeItem('work_os_demo_auth');
    setIsDemoUser(false);
    setUser(null);
    setProfile(null);
    setSession(null);

    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  };

  const updateProfile = async (fullName: string) => {
    if (isDemoUser || !user) {
      if (profile) setProfile({ ...profile, full_name: fullName });
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => (prev ? { ...prev, full_name: fullName } : null));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isDemoUser,
        signUp,
        signIn,
        signInAsDemo,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
