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
    const savedDemo = localStorage.getItem('work_os_demo_auth');

    if (!isSupabaseConfigured) {
      setUser(DEMO_USER);
      setProfile(DEMO_PROFILE);
      setIsDemoUser(true);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        localStorage.removeItem('work_os_demo_auth');
        setIsDemoUser(false);
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email || '').finally(() => setLoading(false));
      } else if (savedDemo === 'true') {
        setUser(DEMO_USER);
        setProfile(DEMO_PROFILE);
        setIsDemoUser(true);
        setLoading(false);
      } else {
        setUser(null);
        setProfile(null);
        setSession(null);
        setIsDemoUser(false);
        setLoading(false);
      }
    }).catch(() => {
      if (savedDemo === 'true' || !isSupabaseConfigured) {
        setUser(DEMO_USER);
        setProfile(DEMO_PROFILE);
        setIsDemoUser(true);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        localStorage.removeItem('work_os_demo_auth');
        setIsDemoUser(false);
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email || '').finally(() => setLoading(false));
      } else {
        const isStillDemo = localStorage.getItem('work_os_demo_auth') === 'true';
        if (isStillDemo) {
          setUser(DEMO_USER);
          setProfile(DEMO_PROFILE);
          setIsDemoUser(true);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setIsDemoUser(false);
        }
        setLoading(false);
      }
    });

    return () => {
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
      await supabase.auth.signOut().catch(() => {});
    }
  };

  const updateProfile = async (fullName: string) => {
    if (!user) return;
    if (isDemoUser) {
      setProfile(prev => prev ? { ...prev, full_name: fullName } : null);
      return;
    }
    await supabase.from('profiles').update({ full_name: fullName, updated_at: new Date().toISOString() }).eq('id', user.id);
    setProfile(prev => prev ? { ...prev, full_name: fullName } : null);
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
