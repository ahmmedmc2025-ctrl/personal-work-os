import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  Database,
  Download,
  Upload,
  RefreshCcw,
  ShieldCheck,
  CheckCircle2,
  Key,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { saveSupabaseConfig, clearSupabaseConfig, isSupabaseConfigured } from '../../lib/supabase';

interface SettingsViewProps {
  onExportJSON: () => void;
  onImportJSON: (jsonStr: string) => Promise<void>;
  onSeedReset: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onExportJSON,
  onImportJSON,
  onSeedReset,
}) => {
  const { profile, updateProfile, isDemoUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState(profile?.full_name || 'Ahmed Developer');
  const [supabaseUrl, setSupabaseUrl] = useState(localStorage.getItem('work_os_supabase_url') || '');
  const [supabaseKey, setSupabaseKey] = useState(localStorage.getItem('work_os_supabase_key') || '');
  const [importFileContent, setImportFileContent] = useState('');

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(fullName);
  };

  const handleSaveSupabaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl || !supabaseKey) return;
    saveSupabaseConfig(supabaseUrl, supabaseKey);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        setImportFileContent(content);
        onImportJSON(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card flex items-center space-x-3">
        <Settings className="w-6 h-6 text-primary" />
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Settings & Data Management</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Configure theme, Supabase cloud sync credentials, and JSON backups.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* PROFILE & APPEARANCE */}
        <div className="space-y-6">
          {/* Appearance Card */}
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center space-x-2">
              {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-gray-600" />}
              <span>Appearance & Theme</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Light mode is enabled by default. Switch to dark mode for high-contrast evening productivity.</p>
            
            <button
              onClick={toggleTheme}
              className="w-full py-2.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-900 dark:text-white text-xs font-bold rounded-xl transition-all flex items-center justify-between"
            >
              <span>Current Theme: <strong className="capitalize text-primary">{theme} Mode</strong></span>
              <span>Toggle</span>
            </button>
          </div>

          {/* Profile Settings Card */}
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-primary" />
              <span>User Profile</span>
            </h3>

            <form onSubmit={handleProfileSave} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Display Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Account Email</label>
                <input
                  type="text"
                  disabled
                  value={profile?.email || 'ahmed@workos.personal'}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-400"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl shadow-md"
              >
                Update Profile
              </button>
            </form>
          </div>
        </div>

        {/* SUPABASE CLOUD & BACKUP MANAGEMENT */}
        <div className="space-y-6">
          
          {/* Supabase Cloud Config Card */}
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center space-x-2">
                <Database className="w-4 h-4 text-emerald-500" />
                <span>Supabase Cloud Database</span>
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSupabaseConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {isSupabaseConfigured ? 'Connected' : 'Demo Mode'}
              </span>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Enter custom Supabase Project URL and Anon API key to sync PC and Phone in real-time.
            </p>

            <form onSubmit={handleSaveSupabaseConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Supabase Project URL</label>
                <input
                  type="text"
                  value={supabaseUrl}
                  onChange={e => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Supabase Anon Key</label>
                <input
                  type="password"
                  value={supabaseKey}
                  onChange={e => setSupabaseKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1Ni..."
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="flex space-x-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Cloud Config
                </button>
                {localStorage.getItem('work_os_supabase_url') && (
                  <button
                    type="button"
                    onClick={clearSupabaseConfig}
                    className="px-3 py-2 text-xs font-semibold text-red-500 hover:underline"
                  >
                    Reset Credentials
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Backup, Restore & Sample Seed Reset */}
          <div className="bg-white dark:bg-[#1E293B] p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-card space-y-4">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center space-x-2">
              <Download className="w-4 h-4 text-primary" />
              <span>Backup, Restore & Reset</span>
            </h3>

            <div className="space-y-3 pt-1">
              <button
                onClick={onExportJSON}
                className="w-full py-2.5 px-4 bg-primary text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Full Data Backup (JSON)</span>
              </button>

              <label className="w-full py-2.5 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 text-xs font-bold rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                <span>Import JSON Backup File</span>
                <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
              </label>

              <button
                onClick={onSeedReset}
                className="w-full py-2.5 px-4 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 hover:bg-amber-100 text-xs font-bold rounded-xl border border-amber-200 dark:border-amber-800 flex items-center justify-center space-x-2"
              >
                <RefreshCcw className="w-4 h-4" />
                <span>Re-Seed Database with Sample Data</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
