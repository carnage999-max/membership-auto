'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Car,
  Calendar,
  Tag,
  MessageSquare,
  UserPlus,
  MapPin,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { ToastProvider } from '@/components/ToastProvider';

interface LayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      router.push('/login');
    } else {
      loadAdminData();
    }

    // Listen for settings updates
    const handleSettingsUpdate = () => {
      loadAdminData();
    };
    
    window.addEventListener('adminSettingsUpdated', handleSettingsUpdate);
    
    return () => {
      window.removeEventListener('adminSettingsUpdated', handleSettingsUpdate);
    };
  }, [router]);

  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/settings/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        const userData = {
          name: data.name || 'Admin',
          email: data.email || 'admin@membershipauto.com',
        };
        setAdminUser(userData);
        localStorage.setItem('adminUser', JSON.stringify(userData));
      } else {
        // Fallback to localStorage
        const user = localStorage.getItem('adminUser');
        if (user) {
          setAdminUser(JSON.parse(user));
        } else {
          setAdminUser({ name: 'Admin', email: 'admin@membershipauto.com' });
        }
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      // Fallback to localStorage
      const user = localStorage.getItem('adminUser');
      if (user) {
        setAdminUser(JSON.parse(user));
      } else {
        setAdminUser({ name: 'Admin', email: 'admin@membershipauto.com' });
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    router.push('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Members', href: '/dashboard/members' },
    { icon: Car, label: 'Vehicles', href: '/dashboard/vehicles' },
    { icon: Calendar, label: 'Appointments', href: '/dashboard/appointments' },
    { icon: Tag, label: 'Offers', href: '/dashboard/offers' },
    { icon: MessageSquare, label: 'Chat', href: '/dashboard/chat' },
    { icon: UserPlus, label: 'Referrals', href: '/dashboard/referrals' },
    { icon: MapPin, label: 'Locations', href: '/dashboard/locations' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
  ];

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gold)]"></div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[var(--background)] flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[var(--surface)] border-r border-[var(--border-color)] transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
            <span className="font-bold text-[var(--gold)]">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-[var(--text-secondary)] hover:text-[var(--foreground)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-[var(--gold)] text-[#0D0D0D]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--foreground)]'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3 mb-3 px-4">
            <div className="w-10 h-10 rounded-full bg-[var(--gold)] flex items-center justify-center text-[#0D0D0D] font-bold">
              {adminUser.name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--foreground)] truncate">
                {adminUser.name || 'Admin'}
              </p>
              <p className="text-xs text-[var(--text-muted)] truncate">
                {adminUser.email || 'admin@membershipauto.com'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'lg:ml-64' : ''}`}>
        {/* Top Bar */}
        <header className="h-16 bg-[var(--surface)] border-b border-[var(--border-color)] flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-[var(--text-secondary)] hover:text-[var(--foreground)] lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--text-secondary)]">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      </div>
    </ToastProvider>
  );
}
