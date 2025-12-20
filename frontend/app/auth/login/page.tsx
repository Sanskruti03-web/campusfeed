'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen w-full flex bg-[var(--color-bg-deep)] overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--color-highlight)]/10 blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-[var(--color-highlight-alt)]/10 blur-[100px] animate-pulse-slow delay-1000" />

      {/* Left: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10">
        <div className="max-w-[420px] w-full animate-in slide-in-from-left-8 fade-in duration-700">
          
          {/* Logo / Header */}
          <div className="mb-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-6 p-2 pr-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-highlight)] to-[var(--color-highlight-alt)] flex items-center justify-center text-white">
                  <Sparkles size={16} fill="currentColor" className="text-white/90" />
                </div>
                <span className="text-sm font-semibold tracking-wide text-[var(--color-text)]">CampusFeed</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl font-extrabold font-outfit text-[var(--color-text)] tracking-tight mb-3">
              Welcome back
            </h1>
            <p className="text-lg text-[var(--color-text-muted)]">
              Enter your details to access your account.
            </p>
          </div>

          {/* Card */}
          <div className="backdrop-blur-xl bg-[var(--color-surface)]/40 border border-[var(--color-border)] rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
              {error && (
                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium flex items-center gap-3 animate-in slide-in-from-top-2">
                  <div className="w-1 h-8 bg-red-500 rounded-full" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] ml-1">
                  College Email
                </label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] group-focus-within/input:text-[var(--color-highlight)] transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@nitrkl.ac.in"
                    className="w-full pl-12 pr-4 py-4 bg-[var(--color-bg-deep)] border-2 border-[var(--color-border)] rounded-2xl focus:border-[var(--color-highlight)] focus:ring-4 focus:ring-[var(--color-highlight)]/10 outline-none transition-all font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/40"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] ml-1">
                  Password
                </label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] group-focus-within/input:text-[var(--color-highlight)] transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-[var(--color-bg-deep)] border-2 border-[var(--color-border)] rounded-2xl focus:border-[var(--color-highlight)] focus:ring-4 focus:ring-[var(--color-highlight)]/10 outline-none transition-all font-medium text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/40"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--color-highlight)] to-[var(--color-highlight-alt)] text-white font-bold text-lg shadow-lg shadow-[var(--color-highlight)]/25 hover:shadow-xl hover:shadow-[var(--color-highlight)]/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-8 text-center text-[var(--color-text-muted)]">
            New to CampusFeed?{' '}
            <Link 
              href="/auth/signup" 
              className="text-[var(--color-highlight)] font-bold hover:underline decoration-2 decoration-[var(--color-highlight)]/30 underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[var(--color-surface)] items-center justify-center p-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay grayscale hover:grayscale-0 transition-all duration-[2s]" />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-highlight)]/90 to-[var(--color-highlight-alt)]/90 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-deep)] via-transparent to-transparent" />
        
        <div className="relative z-10 max-w-xl text-center text-white space-y-8 animate-in slide-in-from-right-8 fade-in duration-1000">
           <div className="w-24 h-24 mx-auto rounded-[2rem] bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-2xl rotate-3 hover:rotate-6 transition-transform duration-500">
              <Sparkles size={48} className="text-white drop-shadow-md" />
           </div>
           
           <div className="space-y-4">
            <h2 className="text-5xl font-extrabold font-outfit leading-tight drop-shadow-lg">
              Connect. Share.<br/>
              <span className="text-white/80">Thrive Together.</span>
            </h2>
            <p className="text-xl text-white/80 font-medium leading-relaxed max-w-md mx-auto drop-shadow-md">
              Join the most vibrant campus community. Discover events, share notes, and stay in the loop.
            </p>
           </div>

           <div className="flex items-center justify-center gap-2 pt-8">
              {[1,2,3].map((i) => (
                <div key={i} className="w-2 h-2 rounded-full bg-white/40" />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
