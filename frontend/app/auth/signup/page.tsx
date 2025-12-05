'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyToken, setVerifyToken] = useState('');
  const { signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signup(email, password, name);
      if (result.token_debug) {
        setVerifyToken(result.token_debug);
      }
      alert('Signup successful! Check email for verification link.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        <div className="card-frame">
          <div className="card-inner">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold gradient-text-primary mb-2">Join Campus Feed</h1>
              <p className="text-muted">Create your account with college email</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {verifyToken && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                  <p className="font-semibold mb-2">Signup successful!</p>
                  <p className="text-sm">Dev token (for testing):</p>
                  <code className="text-xs bg-white px-2 py-1 rounded block mt-1 break-all">
                    {verifyToken}
                  </code>
                  <Link
                    href={`/auth/verify?token=${verifyToken}`}
                    className="text-sm underline mt-2 inline-block"
                  >
                    Click to verify →
                  </Link>
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className="neo-input w-full"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  College Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@nitrkl.ac.in"
                  required
                  className="neo-input w-full"
                />
                <p className="text-xs text-muted mt-2">Must be a @nitrkl.ac.in email</p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="neo-input w-full"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="neo-btn w-full bg-[var(--color-highlight)] text-white disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-muted">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-[var(--color-highlight)] hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
