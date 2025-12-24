'use client';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ConfirmDialog from '@/app/components/ConfirmDialog';
import PremiumPlanBanner from '@/app/components/PremiumPlanBanner';
import { LogOut, User, Menu, X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D]">
      {/* Dashboard Header */}
      <header className="bg-[#1A1A1A] border-b border-[#2A2A2A] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-black flex items-center justify-center">
                <Image
                  src="/images/logo.jpeg"
                  alt="Membership Auto logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-lg text-[#CBA86E] hidden sm:block">
                Membership Auto
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/vehicles"
                className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors text-sm font-medium"
              >
                Vehicles
              </Link>
              <Link
                href="/dashboard/appointments"
                className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors text-sm font-medium"
              >
                Appointments
              </Link>
              <Link
                href="/dashboard/service-schedule"
                className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors text-sm font-medium"
              >
                Schedule
              </Link>
              <Link
                href="/dashboard/locations"
                className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors text-sm font-medium"
              >
                Locations
              </Link>
              <Link
                href="/dashboard/profile"
                className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors text-sm font-medium"
              >
                Profile
              </Link>
              <Link
                href="/dashboard/help"
                className="text-[#B3B3B3] hover:text-[#CBA86E] transition-colors text-sm font-medium"
              >
                Help
              </Link>
            </nav>

            {/* User Menu & Mobile Menu Button */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 text-[#B3B3B3] text-sm">
                <User size={16} />
                <span>{user?.email?.split('@')[0]}</span>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#0D0D0D] border border-[#2A2A2A] text-[#B3B3B3] hover:border-[#CBA86E] hover:text-[#CBA86E] rounded-lg transition-colors text-sm"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#B3B3B3] hover:text-[#CBA86E] transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-[#2A2A2A]">
              <nav className="flex flex-col space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#B3B3B3] hover:text-[#CBA86E] hover:bg-[#0D0D0D] rounded-lg transition-colors text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/vehicles"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#B3B3B3] hover:text-[#CBA86E] hover:bg-[#0D0D0D] rounded-lg transition-colors text-sm font-medium"
                >
                  Vehicles
                </Link>
                <Link
                  href="/dashboard/health"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#B3B3B3] hover:text-[#CBA86E] hover:bg-[#0D0D0D] rounded-lg transition-colors text-sm font-medium"
                >
                  Vehicle Health
                </Link>
                <Link
                  href="/dashboard/appointments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#B3B3B3] hover:text-[#CBA86E] hover:bg-[#0D0D0D] rounded-lg transition-colors text-sm font-medium"
                >
                  Appointments
                </Link>
                <Link
                  href="/dashboard/service-schedule"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#B3B3B3] hover:text-[#CBA86E] hover:bg-[#0D0D0D] rounded-lg transition-colors text-sm font-medium"
                >
                  Service Schedule
                </Link>
                <Link
                  href="/dashboard/mileage"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#B3B3B3] hover:text-[#CBA86E] hover:bg-[#0D0D0D] rounded-lg transition-colors text-sm font-medium"
                >
                  Mileage Tracker
                </Link>
                <Link
                  href="/dashboard/parking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#B3B3B3] hover:text-[#CBA86E] hover:bg-[#0D0D0D] rounded-lg transition-colors text-sm font-medium"
                >
                  Parking Reminder
                </Link>
                <Link
                  href="/dashboard/offers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#B3B3B3] hover:text-[#CBA86E] hover:bg-[#0D0D0D] rounded-lg transition-colors text-sm font-medium"
                >
                  Offers
                </Link>
                <Link
                  href="/dashboard/referrals"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#B3B3B3] hover:text-[#CBA86E] hover:bg-[#0D0D0D] rounded-lg transition-colors text-sm font-medium"
                >
                  Referrals
                </Link>
                <Link
                  href="/dashboard/locations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#B3B3B3] hover:text-[#CBA86E] hover:bg-[#0D0D0D] rounded-lg transition-colors text-sm font-medium"
                >
                  Locations
                </Link>
                <Link
                  href="/dashboard/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#B3B3B3] hover:text-[#CBA86E] hover:bg-[#0D0D0D] rounded-lg transition-colors text-sm font-medium"
                >
                  Support Chat
                </Link>
                <Link
                  href="/dashboard/help"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#B3B3B3] hover:text-[#CBA86E] hover:bg-[#0D0D0D] rounded-lg transition-colors text-sm font-medium"
                >
                  Help & FAQ
                </Link>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 text-[#B3B3B3] hover:text-[#CBA86E] hover:bg-[#0D0D0D] rounded-lg transition-colors text-sm font-medium"
                >
                  Account Settings
                </Link>

                {/* Mobile User Info & Logout */}
                <div className="pt-4 mt-2 border-t border-[#2A2A2A]">
                  <div className="px-4 py-2 text-[#707070] text-sm flex items-center gap-2">
                    <User size={16} />
                    <span>{user?.email}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setShowLogoutConfirm(true);
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-[#DD4A48] text-white rounded-lg hover:bg-[#C43E3B] transition-colors text-sm font-medium"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Premium Plan Banner */}
      <PremiumPlanBanner />

      {/* Main Content */}
      <main>{children}</main>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        cancelText="Cancel"
        type="warning"
        loading={loggingOut}
      />
    </div>
  );
}
