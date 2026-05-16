import { useState } from 'react';
import { supabase } from '../lib/supabase';

type Mode = 'signin' | 'signup';

export default function Auth() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Check your email for a confirmation link.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-xl">
      <div className="mb-xl text-center">
        <div className="inline-flex items-center gap-sm mb-sm">
          <span className="material-symbols-outlined text-primary text-[32px]">task_alt</span>
          <span className="text-headline-lg text-primary font-bold">TaskStream</span>
        </div>
        <p className="text-body-md text-on-surface-variant">Your tasks, beautifully organized.</p>
      </div>

      <div className="w-full max-w-sm bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        {/* Mode toggle */}
        <div className="flex border-b border-outline-variant">
          {(['signin', 'signup'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess(''); }}
              className={`flex-1 py-md text-label-md transition-colors duration-150
                ${mode === m
                  ? 'text-primary border-b-2 border-primary bg-surface-container-low'
                  : 'text-on-surface-variant hover:text-on-surface'
                }`}
            >
              {m === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="p-xl space-y-lg">
          <div className="space-y-md">
            <div>
              <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-xs">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete={mode === 'signin' ? 'email' : 'username'}
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-xs">
                Password
              </label>
              <input
                type="password"
                required
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-surface-container border border-outline-variant rounded-lg px-md py-sm text-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <p className="text-label-sm text-error bg-error/10 rounded-lg px-md py-sm">{error}</p>
          )}
          {success && (
            <p className="text-label-sm text-green-600 bg-green-500/10 rounded-lg px-md py-sm">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary py-sm rounded-lg text-label-md font-medium hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-sm"
          >
            {loading && (
              <span className="material-symbols-outlined text-[18px] animate-spin" style={{ animationDuration: '1s' }}>
                autorenew
              </span>
            )}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
