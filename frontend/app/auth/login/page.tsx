'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[var(--color-bg-deep)]">
        <div className="max-w-md w-full animate-in slide-in-from-left-8 duration-500">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold font-outfit text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-highlight)] to-[var(--color-highlight-alt)] mb-2">
              CampusFeed
            </h1>
            <p className="text-xl font-medium text-[var(--color-text)]">Welcome back!</p>
            <p className="text-[var(--color-text-muted)]">Stay updated with everything happening on campus.</p>
          </div>

          <div className="bg-[var(--color-surface)]/50 backdrop-blur-xl border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 ml-1">
                  College Email
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@nitrkl.ac.in"
                    className="w-full pl-11 pr-4 py-3.5 bg-[var(--color-bg-deep)] border-2 border-[var(--color-border)] rounded-xl focus:border-[var(--color-highlight)] focus:ring-0 transition-colors font-medium text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 ml-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-4 py-3.5 bg-[var(--color-bg-deep)] border-2 border-[var(--color-border)] rounded-xl focus:border-[var(--color-highlight)] focus:ring-0 transition-colors font-medium text-[var(--color-text)] placeholder-[var(--color-text-muted)]/50"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[var(--color-highlight)] to-[var(--color-highlight-alt)] text-white font-bold text-lg shadow-lg shadow-[var(--color-highlight)]/30 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Signing In...
                  </span>
                ) : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="mt-8 text-center text-[var(--color-text-muted)]">
            New to CampusFeed?{' '}
            <Link href="/auth/signup" className="text-[var(--color-highlight)] font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:flex w-1/2 bg-[var(--color-surface)] relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-highlight)]/20 to-[var(--color-highlight-alt)]/20 backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />

        <div className="relative z-10 max-w-lg text-center p-12">
          <h2 className="text-5xl font-extrabold font-outfit text-[var(--color-text)] mb-6 drop-shadow-sm">
            Connect. Share. Thrive.
          </h2>
          <p className="text-xl text-[var(--color-text-muted)] leading-relaxed">
            Join thousands of students in the most vibrant campus community. Discover events, share notes, and explore what's happening around you.
          </p>
        </div>
      </div>
    </div>
  );
}
