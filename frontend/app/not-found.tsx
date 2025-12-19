export const dynamic = 'force-dynamic';

import Link from "next/link";
import Image from "next/image";
import { Home, Search, Phone, ArrowLeft } from "lucide-react";

export default function NotFound() {
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

        {/* 404 Content */}
        <div className="bg-[var(--surface)] rounded-lg shadow-lg p-12 border border-[var(--border-color)]">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl font-bold text-[var(--gold)] mb-2 tracking-tight">
              404
            </h1>
            <div className="h-1 w-24 bg-[var(--gold)] mx-auto rounded-full"></div>
          </div>

          {/* Error Message */}
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
            Looks like this page took a wrong turn. The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-lg hover:bg-[#d8b87f] transition-all duration-200 shadow-lg hover:shadow-xl w-full sm:w-auto"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-transparent border-2 border-[var(--gold)] text-[var(--gold)] font-semibold rounded-lg hover:bg-[rgba(203,168,110,0.1)] transition-all duration-200 w-full sm:w-auto"
            >
              <Phone className="w-5 h-5" />
              Contact Support
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8">
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Looking for something specific? Try these:
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/plans"
              className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-[#1a1a1a] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:bg-[#2a2a2a] hover:text-[var(--gold)] transition-colors"
            >
              Plans & Pricing
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-[#1a1a1a] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:bg-[#2a2a2a] hover:text-[var(--gold)] transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-[#1a1a1a] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:bg-[#2a2a2a] hover:text-[var(--gold)] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1 px-4 py-2 text-sm bg-[#1a1a1a] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:bg-[#2a2a2a] hover:text-[var(--gold)] transition-colors"
            >
              Blog
            </Link>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mt-8 inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back to previous page
        </button>
      </div>
    </div>
  );
}
