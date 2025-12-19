import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0d0d0d] border-t border-[var(--border-color)] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info - Spans 2 columns on mobile */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
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
            <p className="text-[var(--text-secondary)] mb-4 text-sm">
              The world's first subscription-based vehicle service & repair club. One low monthly fee. Zero surprise bills.
            </p>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--gold)] hover:text-[#0d0d0d] transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--gold)] hover:text-[#0d0d0d] transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[var(--border-color)] flex items-center justify-center hover:bg-[var(--gold)] hover:text-[#0d0d0d] transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links - 1 column on mobile */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[var(--gold)]">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/plans" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                  Plans & Pricing
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/why-us" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                  Why Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services - 1 column on mobile */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-[var(--gold)]">Services</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-[var(--text-secondary)]">Oil Changes</li>
              <li className="text-[var(--text-secondary)]">Brake Service</li>
              <li className="text-[var(--text-secondary)]">Tire Rotation</li>
              <li className="text-[var(--text-secondary)]">Engine Repair</li>
              <li className="text-[var(--text-secondary)]">Transmission Service</li>
              <li className="text-[var(--text-secondary)]">Diagnostics</li>
              <li className="text-[var(--text-secondary)]">Preventive Maintenance</li>
            </ul>
          </div>

          {/* Contact Info - Spans 2 columns on mobile */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-bold text-lg mb-4 text-[var(--gold)]">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-[var(--gold)] mt-0.5 flex-shrink-0" />
                <div>
                  <a href="tel:+12079471999" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                    207-947-1999
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-[var(--gold)] mt-0.5 flex-shrink-0" />
                <div>
                  <a href="mailto:info@membershipauto.com" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                    info@membershipauto.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[var(--gold)] mt-0.5 flex-shrink-0" />
                <div className="text-[var(--text-secondary)]">
                  P.O. Box 52<br />
                  Detroit, ME. 04929
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[var(--border-color)] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-[var(--text-secondary)]">
              © {new Date().getFullYear()} Membership Auto. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                Accessibility
              </Link>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-[var(--text-muted)]">
              ASE Certified | BBB A+ | EPA Compliant | Licensed & Insured
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
