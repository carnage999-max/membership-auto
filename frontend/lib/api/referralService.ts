import apiClient from './apiClient';
import { API_ENDPOINTS } from './config';

export interface Referral {
  id: string;
  referrerUserId: string;
  referredUserId: string;
  status: 'invited' | 'signed_up' | 'credited';
  rewardsApplied: boolean;
  createdAt: string;
}

export interface ReferralInfo {
  code: string;
  link: string;
  referrals: Referral[];
}

const referralService = {
  /**
   * Get referral information for the authenticated user
   */
  async getMyReferrals(): Promise<ReferralInfo> {
    const response = await apiClient.get<ReferralInfo>(API_ENDPOINTS.REFERRALS.ME);
    return response.data;
  },

  /**
   * Apply a referral code (typically during signup)
   */
  async applyReferralCode(code: string, newUserId: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.REFERRALS.APPLY, {
      code,
      newUserId,
    });
  },
};

export default referralService;
