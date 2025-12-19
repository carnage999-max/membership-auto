'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Search, TrendingUp, Users, Gift } from 'lucide-react';

interface Referral {
  id: string;
  referrer: {
    id: string;
    name: string;
    email: string;
  };
  referred: {
    id: string;
    name: string;
    email: string;
  };
  status: string;
  reward_given: boolean;
  created_at: string;
}

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadReferrals();
    loadStats();
  }, []);

  const loadReferrals = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/referrals/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const referralsData = data.results || data;
        setReferrals(Array.isArray(referralsData) ? referralsData : []);
      }
    } catch (error) {
      console.error('Error loading referrals:', error);
      setReferrals([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/referrals/stats/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const filteredReferrals = Array.isArray(referrals) ? referrals.filter(referral =>
    referral.referrer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.referred?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    referral.referrer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Referrals</h1>
        <p className="text-text-secondary">Track referral program performance</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gold bg-opacity-10 rounded-lg flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-gold" />
              </div>
              <h3 className="text-sm font-medium text-text-muted">Total Referrals</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.total_referrals || 0}</p>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-success bg-opacity-10 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <h3 className="text-sm font-medium text-text-muted">Conversion Rate</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.conversion_rate || 0}%</p>
          </div>

          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-info bg-opacity-10 rounded-lg flex items-center justify-center">
                <Gift className="w-5 h-5 text-info" />
              </div>
              <h3 className="text-sm font-medium text-text-muted">Rewards Given</h3>
            </div>
            <p className="text-3xl font-bold text-foreground">{stats.rewards_given || 0}</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search by referrer or referred member..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      {/* Referrals List */}
      {filteredReferrals.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <UserPlus className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? 'No referrals found' : 'No referrals yet'}
          </h3>
          <p className="text-text-secondary">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : 'Referrals will appear here when members invite others.'}
          </p>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-background border-b border-border">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Referrer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Referred Member</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Reward</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredReferrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-background transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-foreground">{referral.referrer?.name || 'N/A'}</div>
                      <div className="text-sm text-text-muted">{referral.referrer?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-foreground">{referral.referred?.name || 'N/A'}</div>
                      <div className="text-sm text-text-muted">{referral.referred?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      referral.status === 'completed' 
                        ? 'border-success text-success'
                        : referral.status === 'pending'
                        ? 'border-warning text-warning'
                        : 'border-info text-info'
                    }`}>
                      {referral.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {referral.reward_given ? (
                      <span className="flex items-center gap-1 text-success">
                        <Gift className="w-4 h-4" />
                        Given
                      </span>
                    ) : (
                      <span className="text-text-muted">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-text-secondary">
                      {new Date(referral.created_at).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
