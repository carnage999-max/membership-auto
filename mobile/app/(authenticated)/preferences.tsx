import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Moon,
  Sun,
  Globe,
  Bell,
  Shield,
  FileText,
  HelpCircle,
  Smartphone,
  ChevronRight,
  Heart,
  Info
} from 'lucide-react-native';
import { Card } from '@/components/ui/card';
import { showToast } from '@/utils/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PreferencesScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // App Preferences State
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('English');
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleDarkModeToggle = async (value: boolean) => {
    setDarkMode(value);
    // Save to async storage
    try {
      await AsyncStorage.setItem('darkMode', JSON.stringify(value));
      showToast('info', value ? 'Dark mode enabled' : 'Light mode enabled');
      // In a real implementation, you'd apply the theme change here
    } catch (error) {
      showToast('error', 'Failed to update theme preference');
    }
  };

  const handlePushNotificationsToggle = (value: boolean) => {
    setPushNotifications(value);
    showToast('info', value ? 'Push notifications enabled' : 'Push notifications disabled');
  };

  const handleLink = (url: string, title: string) => {
    Linking.openURL(url).catch(() => {
      showToast('error', `Could not open ${title}`);
    });
  };

  const PreferenceItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showChevron?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-4 border-b border-border last:border-b-0"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <View className="mr-3 rounded-lg bg-surface p-2">
          <Icon size={18} color="#cba86e" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-foreground">{title}</Text>
          {subtitle && <Text className="mt-0.5 text-sm text-textSecondary">{subtitle}</Text>}
        </View>
      </View>
      {showChevron && <ChevronRight size={20} color="#707070" />}
    </TouchableOpacity>
  );

  const PreferenceToggle = ({
    icon: Icon,
    title,
    subtitle,
    value,
    onChange,
  }: {
    icon: any;
    title: string;
    subtitle?: string;
    value: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <View className="flex-row items-center justify-between py-4 border-b border-border last:border-b-0">
      <View className="flex-row items-center flex-1">
        <View className="mr-3 rounded-lg bg-surface p-2">
          <Icon size={18} color="#cba86e" />
        </View>
        <View className="flex-1">
          <Text className="text-base font-medium text-foreground">{title}</Text>
          {subtitle && <Text className="mt-0.5 text-sm text-textSecondary">{subtitle}</Text>}
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
          {/* App Settings */}
          <Card className="mb-6">
            <Text className="mb-4 text-lg font-semibold text-foreground">App Settings</Text>

            <PreferenceToggle
              icon={darkMode ? Moon : Sun}
              title="Dark Mode"
              subtitle="Switch between light and dark theme"
              value={darkMode}
              onChange={handleDarkModeToggle}
            />

            <PreferenceItem
              icon={Smartphone}
              title="Change App Icon"
              subtitle="Coming soon - More icon options"
              onPress={() => showToast('info', 'App icon customization coming soon')}
            />

            <PreferenceItem
              icon={Globe}
              title="Language"
              subtitle={language}
              onPress={() => showToast('info', 'Language selection coming soon')}
            />

            <PreferenceToggle
              icon={Bell}
              title="Push Notifications"
              subtitle="Receive app notifications"
              value={pushNotifications}
              onChange={handlePushNotificationsToggle}
            />
          </Card>

          {/* Help & Support */}
          <Card className="mb-6">
            <Text className="mb-4 text-lg font-semibold text-foreground">Help & Support</Text>

            <PreferenceItem
              icon={HelpCircle}
              title="FAQ"
              subtitle="Frequently asked questions"
              onPress={() => router.push('/(authenticated)/help')}
            />

            <PreferenceItem
              icon={Heart}
              title="Contact Support"
              subtitle="Get help from our team"
              onPress={() => router.push('/(authenticated)/help')}
            />

            <PreferenceItem
              icon={Info}
              title="About"
              subtitle={`Version 1.0.0`}
              onPress={() => showToast('info', 'Membership Auto v1.0.0')}
            />
          </Card>

          {/* Legal & Privacy */}
          <Card className="mb-6">
            <Text className="mb-4 text-lg font-semibold text-foreground">Legal & Privacy</Text>

            <PreferenceItem
              icon={Shield}
              title="Privacy Policy"
              subtitle="How we protect your data"
              onPress={() => handleLink('https://membershipauto.com/privacy', 'Privacy Policy')}
            />

            <PreferenceItem
              icon={FileText}
              title="Terms of Service"
              subtitle="User agreement and terms"
              onPress={() => handleLink('https://membershipauto.com/terms', 'Terms of Service')}
            />

            <PreferenceItem
              icon={Shield}
              title="Data & Safety"
              subtitle="Your data security information"
              onPress={() => handleLink('https://www.membershipauto.com/privacy', 'Data & Safety')}
            />
          </Card>

          {/* Account Actions */}
          <Card className="mb-6 bg-red-900/10 border border-red-900/30">
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Sign Out',
                  'Are you sure you want to sign out?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Sign Out',
                      style: 'destructive',
                      onPress: () => {
                        // Import auth store and logout
                        import('@/stores/auth.store').then(({ useAuthStore }) => {
                          useAuthStore.getState().logout();
                        });
                      },
                    },
                  ]
                );
              }}
              className="py-4"
              activeOpacity={0.7}
            >
              <Text className="text-center text-base font-semibold text-red-500">Sign Out</Text>
            </TouchableOpacity>
          </Card>

          {/* App Info */}
          <View className="items-center py-4">
            <Text className="text-sm text-textMuted mb-1">Membership Auto</Text>
            <Text className="text-xs text-textMuted">Your automotive care companion</Text>
            <Text className="text-xs text-textMuted mt-2">© 2025 All rights reserved</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default PreferencesScreen;
