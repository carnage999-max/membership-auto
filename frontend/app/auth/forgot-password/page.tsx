'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Check } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/forgot-password/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send reset email');
      }

      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Failed to send reset email. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors mb-8"
        >
          <ArrowLeft size={20} />
          Back to Login
        </Link>

        {/* Card */}
        <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-8">
          {status !== 'success' ? (
            <>
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[var(--gold)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-[var(--gold)]" />
                </div>
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                  Reset Your Password
                </h1>
                <p className="text-[var(--text-secondary)]">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[var(--text-secondary)] mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
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
                  {status === 'loading' ? 'Sending...' : 'Send Reset Email'}
                </button>
              </form>

              {/* Divider */}
              <div className="my-8 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[var(--border-color)]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[var(--surface)] text-[var(--text-secondary)]">
                    Remember your password?
                  </span>
                </div>
              </div>

              {/* Login Link */}
              <Link
                href="/auth/login"
                className="block w-full px-4 py-3 border border-[var(--border-color)] text-[var(--foreground)] font-semibold rounded-lg hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors text-center"
              >
                Back to Login
              </Link>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
                  Check Your Email
                </h2>
                <p className="text-[var(--text-secondary)] mb-6">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Check your inbox and follow the instructions to reset your password.
                </p>
                <p className="text-sm text-[var(--text-muted)] mb-8">
                  The link will expire in 24 hours for security.
                </p>

                <Link
                  href="/auth/login"
                  className="block w-full px-4 py-3 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-lg hover:bg-[#d8b87f] transition-colors"
                >
                  Back to Login
                </Link>

                <button
                  onClick={() => {
                    setStatus('idle');
                    setEmail('');
                  }}
                  className="block w-full px-4 py-3 mt-3 border border-[var(--border-color)] text-[var(--foreground)] font-semibold rounded-lg hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
                >
                  Send Another Email
                </button>
              </div>
            </>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
          <p>
            Not receiving the email?{' '}
            <a href="/contact" className="text-[var(--gold)] hover:text-[#d8b87f] transition-colors">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
