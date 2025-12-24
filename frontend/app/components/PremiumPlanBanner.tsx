'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Zap } from 'lucide-react';
import { useAuth } from '@/lib/context/AuthContext';
import { tokenStorage } from '@/lib/auth/tokenStorage';

export default function PremiumPlanBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [hasActiveMembership, setHasActiveMembership] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsClient(true);
    // Check if banner was dismissed (store in localStorage)
    const dismissed = localStorage.getItem('premium_banner_dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
    
    // Check if user has active membership
    checkMembershipStatus();
  }, [user]);
  
  const checkMembershipStatus = async () => {
    try {
      const token = tokenStorage.getAccessToken();
      if (!token) {
        setHasActiveMembership(false);
        return;
      }
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        // Check if user has an active membership (not 'No Active Membership')
        const hasActive = data.membership_status && 
                         data.membership_status !== 'No Active Membership';
        setHasActiveMembership(hasActive);
      }
    } catch (error) {
      console.error('Error checking membership status:', error);
      setHasActiveMembership(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('premium_banner_dismissed', 'true');
  };

  // Don't render anything until client-side to avoid hydration mismatch
  if (!isClient) {
    return null;
  }

  // Don't show banner if user has active membership or if dismissed
  if (isDismissed || hasActiveMembership) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-[#CBA86E] to-[#D4B896] text-[#0D0D0D] px-4 py-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Zap className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-bold text-sm sm:text-base">
              Upgrade to a Premium Plan
            </h3>
            <p className="text-xs sm:text-sm text-[#0D0D0D]/80 mt-1">
              Get unlimited access to premium features and exclusive discounts on vehicle maintenance and repairs.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/plans"
            className="px-4 py-2 bg-[#0D0D0D] text-[#CBA86E] font-semibold rounded-lg hover:bg-[#1A1A1A] transition-colors text-sm whitespace-nowrap"
          >
            View Plans
          </Link>
          <button
            onClick={handleDismiss}
            className="p-1 text-[#0D0D0D]/60 hover:text-[#0D0D0D] transition-colors"
            aria-label="Dismiss banner"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
