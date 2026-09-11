import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, Lock, Mail, User as UserIcon, Sparkles, ArrowRight, ShieldCheck, MailCheck, Loader2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { signIn, signUp, signInAsDemo } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        const { error, needEmailConfirmation } = await signUp(email, password, fullName);
        if (error) {
          setErrorMsg(error.message || 'Registration failed');
        } else if (needEmailConfirmation) {
          setInfoMsg('Account created! Check your email inbox to confirm your account, then sign in.');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message || 'Invalid email or password');
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F7F8FA] dark:bg-[#0F172A] p-4 text-gray-900 dark:text-gray-100">
      <div className="w-full max-w-md bg-white dark:bg-[#1E293B] rounded-2xl shadow-elevated border border-gray-200 dark:border-gray-800 p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-white shadow-md mb-2">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Personal Work OS</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {isSignUp ? 'Create your personal command center account' : 'Sign in to access your cloud-synced workspace'}
          </p>
        </div>

        {/* Auth Toggle Tabs */}
        <div className="grid grid-cols-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm font-medium">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(''); setInfoMsg(''); }}
            className={`py-2 rounded-lg transition-all ${
              !isSignUp
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(''); setInfoMsg(''); }}
            className={`py-2 rounded-lg transition-all ${
              isSignUp
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm font-bold'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400'
            }`}
          >
            Sign Up
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 font-medium leading-relaxed">
            {errorMsg}
          </div>
        )}

        {infoMsg && (
          <div className="p-3 text-xs rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 font-medium">
            <MailCheck className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="Ahmed Developer"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ahmed@example.com"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="relative flex items-center justify-center my-4">
          <div className="border-t border-gray-200 dark:border-gray-800 w-full" />
          <span className="bg-white dark:bg-[#1E293B] px-3 text-xs text-gray-400 uppercase tracking-wider font-medium absolute">
            or test instantly
          </span>
        </div>

        {/* Demo Account Button */}
        <button
          type="button"
          onClick={signInAsDemo}
          className="w-full py-2.5 bg-accent-light dark:bg-accent/10 border border-accent/30 text-accent dark:text-accent font-semibold rounded-xl hover:bg-accent/20 transition-all flex items-center justify-center space-x-2 text-sm"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Launch Demo Mode (1-Click)</span>
        </button>

        {/* Sync features note */}
        <div className="flex items-center justify-center space-x-1.5 text-xs text-gray-400 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Cloud database sync enabled across PC & Phone</span>
        </div>
      </div>
    </div>
  );
};
