import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Switch, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, Mail, MessageSquare } from 'lucide-react-native';
import { Card } from '@/components/ui/card';
import { userService } from '@/services/api/user.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/utils/toast';

const NotificationSettingsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    appointmentReminders: true,
    membershipUpdates: true,
    promotionalOffers: true,
    serviceReminders: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, you'd call an API endpoint to save these settings
      await new Promise((resolve) => setTimeout(resolve, 500));
      showToast('success', 'Notification settings saved');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      router.push('/(authenticated)/profile');
    } catch (error) {
      showToast('error', 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const NotificationToggle = ({
    icon: Icon,
    title,
    subtitle,
    value,
    onChange,
  }: {
    icon: any;
    title: string;
    subtitle: string;
    value: boolean;
    onChange: () => void;
  }) => (
    <View className="flex-row items-center justify-between py-4 border-b border-border last:border-b-0">
      <View className="flex-row items-center flex-1">
        <View className="mr-3 rounded-lg bg-surface p-2">
          <Icon size={18} color="#cba86e" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-foreground">{title}</Text>
          <Text className="mt-0.5 text-sm text-textSecondary">{subtitle}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#767577', true: '#cba86e' }}
        thumbColor={value ? '#fff' : '#f4f3f4'}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View className="px-4 pt-6">
          {/* Notification Channels */}
          <Card className="mb-6">
            <Text className="mb-4 text-lg font-semibold text-foreground">Communication Channels</Text>
            <NotificationToggle
              icon={Mail}
              title="Email Notifications"
              subtitle="Receive updates via email"
              value={settings.emailNotifications}
              onChange={() => handleToggle('emailNotifications')}
            />
            <NotificationToggle
              icon={Bell}
              title="Push Notifications"
              subtitle="App notifications on your device"
              value={settings.pushNotifications}
              onChange={() => handleToggle('pushNotifications')}
            />
            <NotificationToggle
              icon={MessageSquare}
              title="SMS Notifications"
              subtitle="Text message updates"
              value={settings.smsNotifications}
              onChange={() => handleToggle('smsNotifications')}
            />
          </Card>

          {/* Notification Types */}
          <Card className="mb-6">
            <Text className="mb-4 text-lg font-semibold text-foreground">Notification Types</Text>
            <NotificationToggle
              icon={Bell}
              title="Appointment Reminders"
              subtitle="Reminders before your appointments"
              value={settings.appointmentReminders}
              onChange={() => handleToggle('appointmentReminders')}
            />
            <NotificationToggle
              icon={Mail}
              title="Membership Updates"
              subtitle="Changes to your membership status"
              value={settings.membershipUpdates}
              onChange={() => handleToggle('membershipUpdates')}
            />
            <NotificationToggle
              icon={Bell}
              title="Service Reminders"
              subtitle="Vehicle service and maintenance alerts"
              value={settings.serviceReminders}
              onChange={() => handleToggle('serviceReminders')}
            />
            <NotificationToggle
              icon={Mail}
              title="Promotional Offers"
              subtitle="Special deals and member-exclusive offers"
              value={settings.promotionalOffers}
              onChange={() => handleToggle('promotionalOffers')}
            />
          </Card>

          {/* Info Card */}
          <Card className="mb-6 bg-blue-50 border border-blue-200">
            <Text className="text-sm text-blue-900">
              You can manage notification permissions in your device settings. These controls help you filter which notifications you receive.
            </Text>
          </Card>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleSave}
              disabled={isLoading}
              className="flex-row items-center justify-center rounded-xl bg-gold py-4"
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-base font-semibold text-white">Save Preferences</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/(authenticated)/profile')}
              disabled={isLoading}
              className="flex-row items-center justify-center rounded-xl border-2 border-border bg-transparent py-4"
              activeOpacity={0.7}
            >
              <Text className="text-base font-semibold text-foreground">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationSettingsScreen;
