import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Membership Auto - Never Pay for Car Repairs Again",
  description:
    "Join the world's first subscription-based vehicle service & repair club. One low monthly fee. Zero surprise bills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}
      >
        {/* Navigation Header */}
        <header className="absolute top-0 left-0 right-0 z-50 bg-[#0d0d0d]/95 border-b border-[var(--border-color)]">
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
                  href="/login"
                  className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/contact"
                  className="px-4 py-2 rounded-full font-medium bg-[var(--gold)] text-[#0d0d0d] hover:bg-[#d8b87f] transition-colors"
                >
                  Contact Us
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button className="md:hidden text-[var(--text-secondary)]">
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
              </button>
            </div>
          </nav>
        </header>

        {children}
      </body>
    </html>
  );
}
