'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await register(email, password, fullName);
      if (result.needsConfirmation) {
        setShowConfirmation(true);
      } else {
        router.push('/profile');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <Logo size="large" />
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-700 mb-4">
                We've sent a confirmation link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Please click the link in the email to confirm your account before signing in.
              </p>
            </div>

            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full block bg-[#00D9A5] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#00B88A] transition-colors text-center"
              >
                Already confirmed? Sign In
              </Link>
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setEmail('');
                  setPassword('');
                  setFullName('');
                }}
                className="w-full text-gray-600 hover:text-gray-900 text-sm font-medium"
              >
                Use a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-3">
          <Logo size="large" />
          <p className="text-gray-700 text-sm font-medium">Meet. Move. Motivate.</p>
        </div>

        {/* Join Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D9A5] focus:border-transparent"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          
          <div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D9A5] focus:border-transparent"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00D9A5] focus:border-transparent"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00D9A5] text-black px-6 py-4 rounded-lg font-bold hover:bg-[#00B88A] transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'JOIN'}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="text-center">
          <span className="text-sm text-gray-700">Returning user? </span>
          <Link href="/login" className="text-sm font-medium text-[#00D9A5] hover:text-[#00B88A]">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
