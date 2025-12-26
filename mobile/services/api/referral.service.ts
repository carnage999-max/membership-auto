import { api } from './client';

export interface ReferralInfo {
  referral_code: string;
  referral_link: string;
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  total_rewards: number;
  referred_users: Array<{
    id: string;
    name: string;
    email: string;
    status: 'pending' | 'active' | 'cancelled';
    joined_date: string;
    reward_earned: number;
  }>;
}

export interface ApplyReferralData {
  referral_code: string;
}

export const referralService = {
  /**
   * Get user's referral information
   */
  getMyReferrals: async () => {
    const response = await api.get<ReferralInfo>('/referrals/me/');
    return response.data;
  },

  /**
   * Apply a referral code (for new users)
   */
  applyReferralCode: async (data: ApplyReferralData) => {
    const response = await api.post<{ message: string; reward: number }>('/referrals/apply/', data);
    return response.data;
  },
};
