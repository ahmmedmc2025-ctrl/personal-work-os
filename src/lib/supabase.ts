import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read from Vite env or user localStorage overrides
const getSupabaseCredentials = () => {
  const customUrl = localStorage.getItem('work_os_supabase_url');
  const customKey = localStorage.getItem('work_os_supabase_key');

  const url = customUrl || import.meta.env.VITE_SUPABASE_URL || 'https://demo-personal-work-os.supabase.co';
  const key = customKey || import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo-key';

  return { url, key, isCustomConfigured: Boolean(customUrl && customKey) || Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) };
};

const { url, key, isCustomConfigured } = getSupabaseCredentials();

export const supabase: SupabaseClient = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('projects').select('id').limit(1);
    if (error && error.code !== 'PGRST116') {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem('work_os_supabase_url', url.trim());
  localStorage.setItem('work_os_supabase_key', key.trim());
  window.location.reload();
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('work_os_supabase_url');
  localStorage.removeItem('work_os_supabase_key');
  window.location.reload();
};

export const isSupabaseConfigured = isCustomConfigured;
