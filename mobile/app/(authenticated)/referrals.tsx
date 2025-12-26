import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { referralService } from '@/services/api/referral.service';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Copy,
  Share2,
  DollarSign,
  CheckCircle,
  Clock,
  Gift,
} from 'lucide-react-native';
import {
  ScrollView,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Clipboard from '@react-native-clipboard/clipboard';
import useToastStore from '@/utils/stores/toast-store';

const ReferralsScreen = () => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const { setToast } = useToastStore();

  const {
    data: referralData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['referrals'],
    queryFn: referralService.getMyReferrals,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCopyCode = async () => {
    if (referralData?.referral_code) {
      Clipboard.setString(referralData.referral_code);
      setToast({
        type: 'success',
        message: 'Referral code copied to clipboard!',
      });
    }
  };

  const handleCopyLink = async () => {
    if (referralData?.referral_link) {
      Clipboard.setString(referralData.referral_link);
      setToast({
        type: 'success',
        message: 'Referral link copied to clipboard!',
      });
    }
  };

  const handleShare = async () => {
    if (referralData?.referral_link && referralData?.referral_code) {
      try {
        await Share.share({
          message: `Join Membership Auto and get exclusive benefits! Use my referral code: ${referralData.referral_code}\n\n${referralData.referral_link}`,
          title: 'Join Membership Auto',
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#cba86e" />
      </View>
    );
  }

  if (error || !referralData) {
    return (
      <View className="flex-1 bg-background px-4 pt-4">
        <Card className="items-center py-12">
          <Users size={64} color="#707070" />
          <Text className="mt-4 text-lg font-semibold text-foreground">
            Unable to Load Referrals
          </Text>
          <Text className="mt-2 text-center text-sm text-textSecondary">
            Please try again later
          </Text>
        </Card>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#cba86e"
          />
        }
      >
        <View className="px-4 pt-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground">Refer & Earn</Text>
            <Text className="mt-1 text-sm text-textSecondary">
              Share your referral code and earn rewards
            </Text>
          </View>

          {/* Rewards Summary */}
          <Card className="mb-6 p-4">
            <View className="items-center">
              <View className="mb-4 flex-row items-center">
                <DollarSign size={32} color="#cba86e" />
                <Text className="ml-2 text-3xl font-bold text-gold">
                  ${referralData.total_rewards.toFixed(2)}
                </Text>
              </View>
              <Text className="text-sm text-textSecondary">Total Rewards Earned</Text>
            </View>
          </Card>

          {/* Stats Grid */}
          <View className="mb-6 flex-row gap-3">
            <Card className="flex-1 p-4">
              <View className="items-center">
                <Users size={24} color="#4caf50" />
                <Text className="mt-2 text-2xl font-bold text-foreground">
                  {referralData.successful_referrals}
                </Text>
                <Text className="mt-1 text-center text-xs text-textSecondary">
                  Successful
                </Text>
              </View>
            </Card>
            <Card className="flex-1 p-4">
              <View className="items-center">
                <Clock size={24} color="#cba86e" />
                <Text className="mt-2 text-2xl font-bold text-foreground">
                  {referralData.pending_referrals}
                </Text>
                <Text className="mt-1 text-center text-xs text-textSecondary">Pending</Text>
              </View>
            </Card>
          </View>

          {/* Referral Code Section */}
          <Card className="mb-6 p-4">
            <View className="mb-4 flex-row items-center">
              <Gift size={20} color="#cba86e" />
              <Text className="ml-2 text-base font-semibold text-foreground">
                Your Referral Code
              </Text>
            </View>

            <View className="mb-3 rounded-lg bg-surface p-4">
              <Text className="text-center text-2xl font-bold tracking-wider text-gold">
                {referralData.referral_code}
              </Text>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCopyCode}
                className="flex-1 flex-row items-center justify-center rounded-lg bg-gold py-3"
                activeOpacity={0.7}
              >
                <Copy size={16} color="#0d0d0d" />
                <Text className="ml-2 text-sm font-semibold text-background">
                  Copy Code
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCopyLink}
                className="flex-1 flex-row items-center justify-center rounded-lg border border-gold py-3"
                activeOpacity={0.7}
              >
                <Copy size={16} color="#cba86e" />
                <Text className="ml-2 text-sm font-semibold text-gold">Copy Link</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleShare}
              className="mt-3 flex-row items-center justify-center rounded-lg bg-surface py-3"
              activeOpacity={0.7}
            >
              <Share2 size={16} color="#cba86e" />
              <Text className="ml-2 text-sm font-semibold text-gold">
                Share with Friends
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Referred Users List */}
          {referralData.referred_users && referralData.referred_users.length > 0 && (
            <View>
              <Text className="mb-3 text-lg font-semibold text-foreground">
                Referred Users
              </Text>
              <View className="gap-3">
                {referralData.referred_users.map((user) => (
                  <Card key={user.id} className="p-4">
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-foreground">
                          {user.name}
                        </Text>
                        <Text className="mt-1 text-sm text-textSecondary">
                          {user.email}
                        </Text>
                        <Text className="mt-1 text-xs text-textMuted">
                          Joined {new Date(user.joined_date).toLocaleDateString()}
                        </Text>
                      </View>

                      <View className="items-end">
                        <View
                          className={`mb-2 flex-row items-center rounded-full px-3 py-1 ${
                            user.status === 'active'
                              ? 'bg-success/20'
                              : user.status === 'pending'
                                ? 'bg-gold/20'
                                : 'bg-error/20'
                          }`}
                        >
                          {user.status === 'active' && (
                            <CheckCircle size={12} color="#4caf50" />
                          )}
                          {user.status === 'pending' && <Clock size={12} color="#cba86e" />}
                          <Text
                            className={`ml-1 text-xs font-medium ${
                              user.status === 'active'
                                ? 'text-success'
                                : user.status === 'pending'
                                  ? 'text-gold'
                                  : 'text-error'
                            }`}
                          >
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Text>
                        </View>
                        <Text className="text-sm font-semibold text-gold">
                          +${user.reward_earned.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            </View>
          )}

          {/* How it Works */}
          <Card className="mt-6 p-4">
            <Text className="mb-3 text-base font-semibold text-foreground">
              How It Works
            </Text>
            <View className="gap-3">
              <View className="flex-row">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-gold">
                  <Text className="text-xs font-bold text-background">1</Text>
                </View>
                <Text className="flex-1 text-sm text-textSecondary">
                  Share your referral code or link with friends
                </Text>
              </View>
              <View className="flex-row">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-gold">
                  <Text className="text-xs font-bold text-background">2</Text>
                </View>
                <Text className="flex-1 text-sm text-textSecondary">
                  They sign up using your code
                </Text>
              </View>
              <View className="flex-row">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-gold">
                  <Text className="text-xs font-bold text-background">3</Text>
                </View>
                <Text className="flex-1 text-sm text-textSecondary">
                  Both of you earn rewards when they become active members
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

export default ReferralsScreen;
