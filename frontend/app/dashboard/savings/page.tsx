'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Award,
  Star,
  Gift,
  Sparkles,
  Trophy,
  Target,
  Calendar,
  Wrench,
  Car,
  CheckCircle,
  Clock,
  ChevronRight,
  Zap,
  Shield,
  Crown
} from 'lucide-react';

interface SavingsData {
  totalSaved: number;
  totalIfPaidPerVisit: number;
  membershipCost: number;
  servicesCompleted: number;
  currentStreak: number;
  level: string;
  levelProgress: number;
  nextLevelAt: number;
  badges: Badge[];
  monthlySavings: MonthlySaving[];
  recentServices: RecentService[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  locked: boolean;
}

interface MonthlySaving {
  month: string;
  saved: number;
  services: number;
}

interface RecentService {
  id: number;
  name: string;
  date: string;
  retailPrice: number;
  yourPrice: number;
}

export default function SavingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [savingsData, setSavingsData] = useState<SavingsData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'history'>('overview');

  useEffect(() => {
    loadSavingsData();
  }, []);

  const loadSavingsData = async () => {
    setIsLoading(true);
    try {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/savings/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Transform backend data to frontend format
        const transformedData: SavingsData = {
          totalSaved: data.total_saved,
          totalIfPaidPerVisit: data.total_saved + data.total_paid,
          membershipCost: data.total_paid,
          servicesCompleted: data.services_used,
          currentStreak: Math.floor(data.services_used / 4), // Mock streak calculation
          level: data.services_used >= 20 ? 'Platinum' : data.services_used >= 10 ? 'Gold' : 'Silver',
          levelProgress: (data.services_used % 10) * 10,
          nextLevelAt: Math.ceil(data.services_used / 10) * 10,
          badges: [], // Keep existing badge logic
          monthlySavings: data.monthly_breakdown.map((item: any) => ({
            month: item.month,
            saved: item.amount,
            services: item.services
          })),
          recentServices: [], // Keep existing recent services logic
        };
        
        setSavingsData(transformedData);
      } else {
        console.error('Failed to fetch savings data:', response.status);
        // Set empty/zero data
        setSavingsData({
          totalSaved: 0,
          totalIfPaidPerVisit: 0,
          membershipCost: 0,
          servicesCompleted: 0,
          currentStreak: 0,
          level: 'New Member',
          levelProgress: 0,
          nextLevelAt: 10,
          badges: [],
          monthlySavings: [],
          recentServices: []
        });
      }
    } catch (error) {
      console.error('Error loading savings data:', error);
      // Set empty/zero data on error
      setSavingsData({
        totalSaved: 0,
        totalIfPaidPerVisit: 0,
        membershipCost: 0,
        servicesCompleted: 0,
        currentStreak: 0,
        level: 'New Member',
        levelProgress: 0,
        nextLevelAt: 10,
        badges: [],
        monthlySavings: [],
        recentServices: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Platinum Member':
        return <Crown className="w-6 h-6" />;
      case 'Gold Member':
        return <Trophy className="w-6 h-6" />;
      case 'Silver Member':
        return <Shield className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getBadgeIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ElementType } = {
      'wrench': Wrench,
      'droplet': Sparkles,
      'calendar': Calendar,
      'piggy-bank': DollarSign,
      'treasure': Gift,
      'diamond': Sparkles,
      'circle': Target,
      'users': Award
    };
    const Icon = iconMap[iconName] || Star;
    return <Icon className="w-6 h-6" />;
  };

  const maxSaving = savingsData ? Math.max(...savingsData.monthlySavings.map(m => m.saved)) : 0;

  if (isLoading || !savingsData) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-8 h-8 text-[var(--gold)] animate-pulse mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading your savings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--surface)] border-b border-[var(--border-color)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[var(--foreground)]">My Savings</h1>
              <p className="text-sm text-[var(--text-muted)]">Track your membership value</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Hero Savings Card */}
        <div className="bg-gradient-to-br from-[var(--gold)] to-amber-600 rounded-2xl p-6 text-black relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Total Savings</span>
            </div>
            <p className="text-5xl font-bold mb-2">${savingsData.totalSaved.toFixed(2)}</p>
            <p className="text-black/70">
              vs ${savingsData.totalIfPaidPerVisit.toFixed(2)} if paid per visit
            </p>
            
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-black/10 rounded-lg p-3">
                <p className="text-2xl font-bold">{savingsData.servicesCompleted}</p>
                <p className="text-sm text-black/70">Services</p>
              </div>
              <div className="bg-black/10 rounded-lg p-3">
                <p className="text-2xl font-bold">{savingsData.currentStreak}</p>
                <p className="text-sm text-black/70">Month Streak</p>
              </div>
              <div className="bg-black/10 rounded-lg p-3">
                <p className="text-2xl font-bold">
                  {Math.round((savingsData.totalSaved / savingsData.totalIfPaidPerVisit) * 100)}%
                </p>
                <p className="text-sm text-black/70">Saved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--gold)]/20 rounded-lg text-[var(--gold)]">
                {getLevelIcon(savingsData.level)}
              </div>
              <div>
                <h3 className="font-semibold text-[var(--foreground)]">{savingsData.level}</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  {savingsData.nextLevelAt - savingsData.servicesCompleted} more services to next level
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-[var(--text-muted)]">Progress</p>
              <p className="font-semibold text-[var(--gold)]">{savingsData.levelProgress}%</p>
            </div>
          </div>
          <div className="h-3 bg-[var(--background)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--gold)] to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${savingsData.levelProgress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
            <span>{savingsData.servicesCompleted} services</span>
            <span>{savingsData.nextLevelAt} services</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'badges', label: 'Badges', icon: Award },
            { id: 'history', label: 'History', icon: Clock }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[var(--gold)] text-black'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--foreground)] border border-[var(--border-color)]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Monthly Savings Chart */}
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border-color)]">
              <h3 className="font-semibold text-[var(--foreground)] mb-6">Monthly Savings</h3>
              <div className="flex items-end gap-3 h-48">
                {savingsData.monthlySavings.map((month) => (
                  <div key={month.month} className="flex-1 flex flex-col items-center">
                    <div className="relative w-full flex justify-center mb-2">
                      <div
                        className="w-full max-w-12 bg-gradient-to-t from-[var(--gold)] to-amber-400 rounded-t-lg transition-all duration-500 hover:opacity-80"
                        style={{ height: `${(month.saved / maxSaving) * 150}px` }}
                        title={`$${month.saved.toFixed(2)}`}
                      />
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{month.month}</p>
                    <p className="text-xs font-medium text-[var(--gold)]">${month.saved}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Value Breakdown */}
            <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border-color)]">
              <h3 className="font-semibold text-[var(--foreground)] mb-4">Membership Value</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Services at retail price</span>
                  <span className="text-[var(--foreground)] font-medium">${savingsData.totalIfPaidPerVisit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-secondary)]">Your membership cost</span>
                  <span className="text-[var(--foreground)] font-medium">-${savingsData.membershipCost.toFixed(2)}</span>
                </div>
                <div className="border-t border-[var(--border-color)] pt-4 flex justify-between items-center">
                  <span className="text-[var(--foreground)] font-semibold">Your total savings</span>
                  <span className="text-xl font-bold text-green-500">+${savingsData.totalSaved.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border-color)]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-[var(--text-muted)] text-sm">Avg per Service</span>
                </div>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  ${(savingsData.totalSaved / savingsData.servicesCompleted).toFixed(2)}
                </p>
                <p className="text-xs text-green-500">saved</p>
              </div>
              <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border-color)]">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Zap className="w-5 h-5 text-blue-500" />
                  </div>
                  <span className="text-[var(--text-muted)] text-sm">ROI</span>
                </div>
                <p className="text-2xl font-bold text-[var(--foreground)]">
                  {Math.round((savingsData.totalSaved / savingsData.membershipCost) * 100)}%
                </p>
                <p className="text-xs text-blue-500">return on investment</p>
              </div>
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--foreground)]">Your Badges</h3>
              <span className="text-sm text-[var(--text-muted)]">
                {savingsData.badges.filter(b => !b.locked).length} / {savingsData.badges.length} earned
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {savingsData.badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`rounded-xl p-4 border text-center transition-all ${
                    badge.locked
                      ? 'bg-[var(--background)] border-[var(--border-color)] opacity-50'
                      : 'bg-[var(--surface)] border-[var(--gold)]/30 hover:border-[var(--gold)]'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                    badge.locked
                      ? 'bg-[var(--surface)] text-[var(--text-muted)]'
                      : 'bg-[var(--gold)]/20 text-[var(--gold)]'
                  }`}>
                    {getBadgeIcon(badge.icon)}
                  </div>
                  <h4 className={`font-medium mb-1 ${
                    badge.locked ? 'text-[var(--text-muted)]' : 'text-[var(--foreground)]'
                  }`}>
                    {badge.name}
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mb-2">{badge.description}</p>
                  {badge.earnedAt && (
                    <p className="text-xs text-[var(--gold)]">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                  {badge.locked && (
                    <p className="text-xs text-[var(--text-muted)] flex items-center justify-center gap-1">
                      <Clock className="w-3 h-3" /> Locked
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-[var(--foreground)]">Recent Services</h3>
            {savingsData.recentServices.map((service) => (
              <div
                key={service.id}
                className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border-color)] flex items-center gap-4"
              >
                <div className="p-2 bg-[var(--gold)]/10 rounded-lg">
                  <Wrench className="w-5 h-5 text-[var(--gold)]" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-[var(--foreground)]">{service.name}</h4>
                  <p className="text-sm text-[var(--text-muted)]">
                    {new Date(service.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--text-muted)] line-through">
                    ${service.retailPrice.toFixed(2)}
                  </p>
                  <p className="font-semibold text-green-500">FREE</p>
                </div>
              </div>
            ))}
            <Link
              href="/dashboard/service-history"
              className="flex items-center justify-center gap-2 py-3 text-[var(--gold)] hover:underline"
            >
              View Full History
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* CTA */}
        <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border-color)] text-center">
          <Gift className="w-10 h-10 text-[var(--gold)] mx-auto mb-3" />
          <h3 className="font-semibold text-[var(--foreground)] mb-2">Share the Savings!</h3>
          <p className="text-[var(--text-muted)] mb-4 text-sm">
            Refer a friend and you both get a free month when they sign up.
          </p>
          <Link
            href="/dashboard/referrals"
            className="inline-flex items-center gap-2 px-6 py-2 bg-[var(--gold)] text-black rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Refer a Friend
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
