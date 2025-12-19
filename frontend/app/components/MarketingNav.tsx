'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/lib/context/AuthContext';
import { X } from 'lucide-react';

export default function MarketingNav() {
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Hide navigation on dashboard pages and login page
  if (pathname?.startsWith('/dashboard') || pathname === '/login') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-[#0d0d0d]/95 backdrop-blur-sm border-b border-[#2A2A2A]">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-black flex items-center justify-center">
              <Image
                src="/images/logo.jpeg"
                alt="Membership Auto logo"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <span className="font-bold text-lg tracking-tight text-[#CBA86E]">
              Membership Auto
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/plans"
              className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors font-medium"
            >
              Plans & Pricing
            </Link>
            <Link
              href="/how-it-works"
              className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors font-medium"
            >
              How It Works
            </Link>
            <Link
              href="/blog"
              className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors font-medium"
            >
              Blog
            </Link>
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors font-medium"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors font-medium"
              >
                Login
              </Link>
            )}
            <Link
              href="/contact"
              className="px-4 py-2 rounded-full font-medium bg-[#CBA86E] text-[#0d0d0d] hover:bg-[#B89860] transition-colors"
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-[#B3B3B3] hover:text-[#CBA86E] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-[#2A2A2A] pt-4">
            <div className="flex flex-col gap-4">
              <Link
                href="/plans"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors font-medium"
              >
                Plans & Pricing
              </Link>
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors font-medium"
              >
                How It Works
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors font-medium"
              >
                Blog
              </Link>
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors font-medium"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors font-medium"
                >
                  Login
                </Link>
              )}
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2 rounded-full font-medium bg-[#CBA86E] text-[#0d0d0d] hover:bg-[#B89860] transition-colors text-center"
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
