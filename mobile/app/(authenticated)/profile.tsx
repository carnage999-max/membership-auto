import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import { userService, type SavingsData } from '@/services/api/user.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/utils/toast';
import {
  Bell,
  ChevronRight,
  CreditCard,
  DollarSign,
  Globe,
  LogOut,
  Settings,
  Shield,
  User,
  XCircle,
  RefreshCw,
} from 'lucide-react-native';
import { Alert, ScrollView, Text, TouchableOpacity, View, Switch, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProfileScreen = () => {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [autoRenewEnabled, setAutoRenewEnabled] = useState(true);

  // Fetch savings data with error handling (suppresses error toast)
  const { data: savings, isLoading: savingsLoading } = useQuery({
    queryKey: ['savings'],
    queryFn: userService.getSavings,
    retry: false,
    throwOnError: false,
  });

  // Toggle auto-renew mutation
  const toggleAutoRenewMutation = useMutation({
    mutationFn: (enabled: boolean) => userService.toggleAutoRenew(enabled),
    onSuccess: (data) => {
      setAutoRenewEnabled(data.auto_renew);
      showToast('success', 'Auto-renew updated successfully');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      showToast('error', 'Failed to update auto-renew');
    },
  });

  // Cancel membership mutation
  const cancelMembershipMutation = useMutation({
    mutationFn: (reason?: string) => userService.cancelMembership(reason),
    onSuccess: () => {
      showToast('success', 'Membership cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      showToast('error', 'Failed to cancel membership');
    },
  });

  // Reactivate membership mutation
  const reactivateMembershipMutation = useMutation({
    mutationFn: () => userService.reactivateMembership(),
    onSuccess: () => {
      showToast('success', 'Membership reactivated successfully');
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: () => {
      showToast('error', 'Failed to reactivate membership');
    },
  });

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleCancelMembership = () => {
    Alert.alert(
      'Cancel Membership',
      'Are you sure you want to cancel your membership? You will lose access to all member benefits.',
      [
        { text: 'Keep Membership', style: 'cancel' },
        {
          text: 'Cancel Membership',
          style: 'destructive',
          onPress: () => cancelMembershipMutation.mutate(undefined),
        },
      ]
    );
  };

  const handleReactivateMembership = () => {
    Alert.alert(
      'Reactivate Membership',
      'Would you like to reactivate your membership?',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Reactivate',
          onPress: () => reactivateMembershipMutation.mutate(undefined),
        },
      ]
    );
  };

  const handleToggleAutoRenew = (value: boolean) => {
    toggleAutoRenewMutation.mutate(value);
  };

  const ProfileMenuItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-4 border-b border-border"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <View className="mr-4 rounded-lg bg-surface p-2">
          <Icon size={20} color="#cba86e" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-foreground">{title}</Text>
          {subtitle && <Text className="mt-0.5 text-sm text-textSecondary">{subtitle}</Text>}
        </View>
      </View>
      {showArrow && <ChevronRight size={20} color="#707070" />}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View className="px-4 pt-4">
          {/* Profile Header */}
          <Card className="mb-6 items-center py-6" variant="elevated">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-gold/20">
              <Text className="text-3xl font-bold text-gold">
                {user?.name?.charAt(0).toUpperCase() || 'M'}
              </Text>
            </View>
            <Text className="mb-1 text-xl font-bold text-foreground">{user?.name}</Text>
            <Text className="text-sm text-textSecondary">{user?.email}</Text>
            {user?.phone && <Text className="mt-1 text-sm text-textMuted">{user.phone}</Text>}
          </Card>

          {/* Total Savings Card */}
          <Card className="mb-6" variant="elevated">
            <View className="flex-row items-center mb-3">
              <DollarSign size={24} color="#cba86e" />
              <Text className="ml-2 text-lg font-semibold text-foreground">Total Savings</Text>
            </View>
            {savingsLoading ? (
              <ActivityIndicator color="#cba86e" />
            ) : savings ? (
              <>
                <Text className="text-3xl font-bold text-gold mb-4">
                  ${savings.total_savings.toFixed(2)}
                </Text>
                <View className="space-y-2">
                  <View className="flex-row justify-between py-2 border-t border-border">
                    <Text className="text-sm text-textSecondary">Service Discounts</Text>
                    <Text className="text-sm font-medium text-foreground">
                      ${savings.breakdown.service_discounts.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-2 border-t border-border">
                    <Text className="text-sm text-textSecondary">Fuel Savings</Text>
                    <Text className="text-sm font-medium text-foreground">
                      ${savings.breakdown.fuel_savings.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-2 border-t border-border">
                    <Text className="text-sm text-textSecondary">Referral Rewards</Text>
                    <Text className="text-sm font-medium text-foreground">
                      ${savings.breakdown.referral_rewards.toFixed(2)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-2 border-t border-border">
                    <Text className="text-sm text-textSecondary">Membership Perks</Text>
                    <Text className="text-sm font-medium text-foreground">
                      ${savings.breakdown.membership_perks.toFixed(2)}
                    </Text>
                  </View>
                </View>
                <Text className="mt-3 text-xs text-textMuted text-center">{savings.period}</Text>
              </>
            ) : (
              <Text className="text-sm text-textMuted">No savings data available</Text>
            )}
          </Card>

          {/* Membership Info */}
          <Card className="mb-6" variant="elevated">
            <Text className="mb-4 text-lg font-semibold text-foreground">Membership</Text>
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-sm text-textSecondary">Plan</Text>
              <View className="rounded-full bg-gold/20 px-3 py-1">
                <Text className="text-sm font-semibold text-gold">Premium</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-sm text-textSecondary">Status</Text>
              <View className="rounded-full bg-success/20 px-3 py-1">
                <Text className="text-sm font-semibold text-success">Active</Text>
              </View>
            </View>
            <View className="flex-row items-center justify-between py-3">
              <Text className="text-sm text-textSecondary">Auto-Renew</Text>
              <Switch
                value={autoRenewEnabled}
                onValueChange={handleToggleAutoRenew}
                trackColor={{ false: '#767577', true: '#cba86e' }}
                thumbColor={autoRenewEnabled ? '#fff' : '#f4f3f4'}
                disabled={toggleAutoRenewMutation.isPending}
              />
            </View>

            {/* Membership Actions */}
            <View className="mt-4 gap-3">
              <TouchableOpacity
                onPress={handleReactivateMembership}
                disabled={reactivateMembershipMutation.isPending}
                className="flex-row items-center justify-center rounded-xl border-2 border-gold bg-transparent py-4"
                activeOpacity={0.7}
              >
                {reactivateMembershipMutation.isPending ? (
                  <ActivityIndicator size="small" color="#cba86e" />
                ) : (
                  <>
                    <RefreshCw size={18} color="#cba86e" />
                    <Text className="ml-2 text-base font-semibold text-gold">Reactivate Membership</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCancelMembership}
                disabled={cancelMembershipMutation.isPending}
                className="flex-row items-center justify-center rounded-xl bg-error py-4"
                activeOpacity={0.7}
              >
                {cancelMembershipMutation.isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <XCircle size={18} color="#ffffff" />
                    <Text className="ml-2 text-base font-semibold text-white">Cancel Membership</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </Card>

          {/* Account Settings */}
          <Card className="mb-6">
            <Text className="mb-2 text-lg font-semibold text-foreground">Account Settings</Text>

            <ProfileMenuItem
              icon={User}
              title="Edit Profile"
              subtitle="Update your personal information"
              onPress={() => showToast('info', 'Edit Profile feature coming soon')}
            />

            <ProfileMenuItem
              icon={Shield}
              title="Change Password"
              subtitle="Update your security credentials"
              onPress={() => showToast('info', 'Change Password feature coming soon')}
            />

            <ProfileMenuItem
              icon={CreditCard}
              title="Payment Methods"
              subtitle="Manage your billing information"
              onPress={() => showToast('info', 'Payment Methods feature coming soon')}
            />
          </Card>

          {/* App Settings */}
          <Card className="mb-6">
            <Text className="mb-2 text-lg font-semibold text-foreground">App Settings</Text>

            <ProfileMenuItem
              icon={Bell}
              title="Notifications"
              subtitle="Manage notification preferences"
              onPress={() => showToast('info', 'Notification settings feature coming soon')}
            />

            <ProfileMenuItem
              icon={Globe}
              title="Language"
              subtitle="English (US)"
              onPress={() => showToast('info', 'Language settings feature coming soon')}
            />

            <ProfileMenuItem
              icon={Settings}
              title="Preferences"
              subtitle="App settings and preferences"
              onPress={() => showToast('info', 'App preferences feature coming soon')}
            />
          </Card>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="mb-4 flex-row items-center justify-center rounded-xl bg-error py-4"
            activeOpacity={0.7}
          >
            <LogOut size={20} color="#ffffff" />
            <Text className="ml-2 text-base font-semibold text-white">Log Out</Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text className="text-center text-xs text-textMuted">
            Membership Auto v1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
