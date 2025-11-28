"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return (
    <header className="static top-0 left-0 right-0 z-50 bg-[var(--background)]/95 border-b border-[var(--border-color)]">
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
            <span className="font-bold text-lg tracking-tight text-[var(--gold)]">
              Membership Auto
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/plans"
              className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors font-medium"
            >
              Plans & Pricing
            </Link>
            <Link
              href="/how-it-works"
              className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors font-medium"
            >
              How It Works
            </Link>
            <Link
              href="/blog"
              className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors font-medium"
            >
              Blog
            </Link>
            <Link
              href="/auth"
              className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors font-medium"
            >
              Login
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 rounded-full font-medium bg-[var(--gold)] text-[var(--background)] hover:bg-[#d8b87f] transition-colors"
            >
              Contact Us
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[var(--text-secondary)]"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col gap-4 bg-[var(--background)] border-t border-[var(--border-color)] px-2 py-4 rounded-b-lg shadow-lg animate-fade-in">
            <Link href="/plans" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Plans & Pricing</Link>
            <Link href="/how-it-works" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
            <Link href="/blog" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
            <Link href="/auth" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors font-medium" onClick={() => setMobileMenuOpen(false)}>Login</Link>
            <Link href="/contact" className="px-4 py-2 rounded-full font-medium bg-[var(--gold)] text-[var(--background)] hover:bg-[#d8b87f] transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact Us</Link>
          </div>
        )}
      </nav>
    </header>
  );
}