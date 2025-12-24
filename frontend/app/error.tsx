'use client';

export const dynamic = 'force-dynamic';

import Link from 'next/link';
import Image from 'next/image';
import { Home, AlertTriangle, Phone } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center justify-center gap-3 mb-8">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-black flex items-center justify-center">
            <Image
              src="/images/logo.jpeg"
              alt="Membership Auto logo"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <span className="font-bold text-2xl tracking-tight text-[var(--gold)]">
            Membership Auto
          </span>
        </Link>

        {/* Error Content */}
        <div className="bg-[var(--surface)] rounded-lg shadow-lg p-12 border border-[var(--border-color)]">
          {/* Error Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Something Went Wrong
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
            We encountered an unexpected error. Don't worry, we've been notified and are working to fix it.
          </p>

          {/* Error Details (if available) */}
          {error.message && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
              <p className="text-sm text-red-400 font-mono">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-[var(--text-muted)] mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-lg hover:bg-[#d8b87f] transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[var(--border-color)] text-[var(--foreground)] font-semibold rounded-lg hover:border-[var(--gold)] hover:text-[var(--gold)] transition-all duration-200 w-full sm:w-auto"
            >
              <Home size={20} />
              Back to Home
            </Link>
          </div>

          {/* Support Link */}
          <div className="mt-8 pt-8 border-t border-[var(--border-color)]">
            <p className="text-[var(--text-secondary)] mb-4">Need additional help?</p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 text-[var(--gold)] hover:text-[#d8b87f] transition-colors"
            >
              <Phone size={18} />
              Contact Support
            </a>
          </div>
        </div>

        {/* Additional Help Text */}
        <div className="mt-8 text-sm text-[var(--text-muted)]">
          <p>If this problem persists, please contact us at support@membershipauto.com</p>
        </div>
      </div>
    </div>
  );
}
