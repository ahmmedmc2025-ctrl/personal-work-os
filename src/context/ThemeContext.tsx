import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('work_os_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light'; // Light mode default
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('work_os_theme', theme);
  }, [theme]);

  // Sync theme with Supabase user_preferences if authenticated
  const syncThemeToCloud = async (newTheme: Theme) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase
          .from('user_preferences')
          .upsert({
            user_id: session.user.id,
            theme: newTheme,
            updated_at: new Date().toISOString(),
          });
      }
    } catch (err) {
      // Ignore if unauthenticated
    }
  };

  const toggleTheme = () => {
    setThemeState(prev => {
      const nextTheme = prev === 'light' ? 'dark' : 'light';
      syncThemeToCloud(nextTheme);
      return nextTheme;
    });
  };

  const setTheme = (t: Theme) => {
    setThemeState(t);
    syncThemeToCloud(t);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
