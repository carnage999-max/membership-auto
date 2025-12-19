'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import referralService, { ReferralInfo, Referral } from '@/lib/api/referralService';
import { Gift, Copy, Share2, Check, AlertCircle, Users, Award, ArrowLeft } from 'lucide-react';

export default function ReferralsPage() {
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReferralInfo();
  }, []);

  const loadReferralInfo = async () => {
    try {
      setLoading(true);
      const data = await referralService.getMyReferrals();
      setReferralInfo(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load referral information');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (referralInfo) {
      navigator.clipboard.writeText(referralInfo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (referralInfo) {
      navigator.clipboard.writeText(referralInfo.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (referralInfo && navigator.share) {
      try {
        await navigator.share({
          title: 'Join Membership Auto',
          text: `Use my referral code ${referralInfo.code} to get 50% off your first month!`,
          url: referralInfo.link,
        });
      } catch (err) {
        // User cancelled or share failed
        console.error('Share failed:', err);
      }
    } else {
      // Fallback: copy link
      handleCopyLink();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'invited':
        return 'text-[#B3B3B3] bg-[#1A1A1A]';
      case 'signed_up':
        return 'text-[#FFB74D] bg-[#FFB74D]/10';
      case 'credited':
        return 'text-[#4CAF50] bg-[#4CAF50]/10';
      default:
        return 'text-[#B3B3B3] bg-[#1A1A1A]';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'invited':
        return 'Invited';
      case 'signed_up':
        return 'Signed Up';
      case 'credited':
        return 'Reward Credited';
      default:
        return status;
    }
  };

  const creditedReferrals = referralInfo?.referrals.filter((r) => r.status === 'credited').length || 0;
  const totalReward = creditedReferrals; // 1 free month per referral

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-16 h-16 border-4 border-[#CBA86E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D0D0D] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#B3B3B3] hover:text-[#CBA86E] transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#CBA86E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="text-[#CBA86E]" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Refer a Friend</h1>
          <p className="text-[#B3B3B3] max-w-2xl mx-auto">
            Share the love! Refer friends and get <span className="text-[#CBA86E] font-semibold">1 free month</span> when
            they join. They get <span className="text-[#CBA86E] font-semibold">50% off</span> their first month!
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[#DD4A48]/10 border border-[#DD4A48] rounded-lg flex items-center gap-3">
            <AlertCircle className="text-[#DD4A48]" size={20} />
            <p className="text-[#DD4A48]">{error}</p>
          </div>
        )}

        {referralInfo && (
          <>
            {/* Rewards Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="text-[#CBA86E]" size={24} />
                  <h3 className="text-lg font-semibold text-white">Total Referrals</h3>
                </div>
                <p className="text-4xl font-bold text-[#CBA86E]">{referralInfo.referrals.length}</p>
              </div>

              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Award className="text-[#4CAF50]" size={24} />
                  <h3 className="text-lg font-semibold text-white">Free Months Earned</h3>
                </div>
                <p className="text-4xl font-bold text-[#4CAF50]">{totalReward}</p>
              </div>
            </div>

            {/* Referral Code Card */}
            <div className="bg-linear-to-br from-[#CBA86E]/20 to-[#1A1A1A] border border-[#CBA86E] rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Your Referral Code</h2>

              <div className="bg-[#0D0D0D] rounded-lg p-6 mb-6">
                <p className="text-center text-4xl font-bold text-[#CBA86E] tracking-wider mb-2">
                  {referralInfo.code}
                </p>
                <p className="text-center text-[#B3B3B3] text-sm">{referralInfo.link}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-[#CBA86E] text-[#CBA86E] font-semibold rounded-lg hover:bg-[#CBA86E] hover:text-[#0D0D0D] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={20} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={20} />
                      Copy Code
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#1A1A1A] border border-[#CBA86E] text-[#CBA86E] font-semibold rounded-lg hover:bg-[#CBA86E] hover:text-[#0D0D0D] transition-colors"
                >
                  {copied ? (
                    <>
                      <Check size={20} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={20} />
                      Copy Link
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-[#CBA86E] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#B89860] transition-colors"
                >
                  <Share2 size={20} />
                  Share
                </button>
              </div>
            </div>

            {/* Referral Status List */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-6">Referral History</h3>

              {referralInfo.referrals.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="mx-auto text-[#707070] mb-3" size={48} />
                  <p className="text-[#B3B3B3]">No referrals yet. Start sharing your code!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referralInfo.referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-white font-medium mb-1">Referral ID: {referral.id.slice(0, 8)}</p>
                        <p className="text-[#707070] text-sm">
                          {new Date(referral.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>

                      <span
                        className={`px-4 py-2 rounded-lg text-sm font-semibold ${getStatusColor(
                          referral.status
                        )}`}
                      >
                        {getStatusText(referral.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="mt-8 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
              <ol className="space-y-3 text-[#B3B3B3]">
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 bg-[#CBA86E] text-[#0D0D0D] rounded-full flex items-center justify-center text-sm font-bold">
                    1
                  </span>
                  <span>Share your unique referral code or link with friends and family</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 bg-[#CBA86E] text-[#0D0D0D] rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  <span>They sign up using your code and get 50% off their first month</span>
                </li>
                <li className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 bg-[#CBA86E] text-[#0D0D0D] rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  <span>Once they complete their first payment, you get 1 free month!</span>
                </li>
              </ol>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
