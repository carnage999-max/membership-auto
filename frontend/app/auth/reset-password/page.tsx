'use client';

import { Suspense } from 'react';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, Check, AlertCircle } from 'lucide-react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!token) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)] mb-3">
              Invalid Link
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              This password reset link is invalid or has expired.
            </p>
            <Link
              href="/auth/forgot-password"
              className="block w-full px-4 py-3 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-lg hover:bg-[#d8b87f] transition-colors"
            >
              Request a New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // Validation
    if (password.length < 8) {
      setStatus('error');
      setErrorMessage('Password must be at least 8 characters');
      return;
    }

    if (password !== passwordConfirm) {
      setStatus('error');
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/reset-password/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token,
            password,
            passwordConfirm,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reset password');
      }

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to reset password. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {status !== 'success' ? (
          <>
            {/* Back Link */}
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors mb-8"
            >
              ← Back to Login
            </Link>

            {/* Card */}
            <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[var(--gold)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-[var(--gold)]" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                  Create New Password
                </h1>
                <p className="text-[var(--text-secondary)]">
                  Enter a new password for your account
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="At least 8 characters"
                    className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>

                <div>
                  <label
                    htmlFor="passwordConfirm"
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="passwordConfirm"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    required
                    placeholder="Re-enter your password"
                    className="w-full px-4 py-3 border border-[var(--border-color)] rounded-lg bg-[var(--background)] text-[var(--foreground)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-transparent"
                  />
                </div>

                {errorMessage && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{errorMessage}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full px-4 py-3 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-lg hover:bg-[#d8b87f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-8 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                Password Reset Successful
              </h2>
              <p className="text-[var(--text-secondary)] mb-6">
                Your password has been reset. You can now log in with your new password.
              </p>

              <button
                onClick={() => router.push('/auth/login')}
                className="block w-full px-4 py-3 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-lg hover:bg-[#d8b87f] transition-colors"
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
