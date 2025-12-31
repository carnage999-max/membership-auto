import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput as RNTextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, Phone, MapPin } from 'lucide-react-native';
import { Card } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth.store';
import { userService } from '@/services/api/user.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/utils/toast';

const EditProfileScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refreshProfile } = useAuthStore();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof formData) => userService.updateProfile(data),
    onSuccess: async () => {
      showToast('success', 'Profile updated successfully');
      // Refresh user profile from backend to get updated data
      await refreshProfile();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      router.push('/(authenticated)/profile');
    },
    onError: () => {
      showToast('error', 'Failed to update profile');
    },
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      showToast('error', 'Name is required');
      return;
    }
    if (!formData.email.trim()) {
      showToast('error', 'Email is required');
      return;
    }
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View className="px-4 pt-6">
          {/* Name Field */}
          <Card className="mb-4">
            <View className="mb-2">
              <Text className="text-sm font-semibold text-foreground mb-2">Full Name</Text>
              <RNTextInput
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Your full name"
                placeholderTextColor="#999"
                className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-surface"
              />
            </View>
          </Card>

          {/* Email Field */}
          <Card className="mb-4">
            <View className="mb-2">
              <View className="flex-row items-center mb-2">
                <Mail size={16} color="#cba86e" />
                <Text className="ml-2 text-sm font-semibold text-foreground">Email Address</Text>
              </View>
              <RNTextInput
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder="your@email.com"
                placeholderTextColor="#999"
                editable={false}
                className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-surface opacity-50"
              />
              <Text className="mt-2 text-xs text-textMuted">Email cannot be changed</Text>
            </View>
          </Card>

          {/* Phone Field */}
          <Card className="mb-6">
            <View className="mb-2">
              <View className="flex-row items-center mb-2">
                <Phone size={16} color="#cba86e" />
                <Text className="ml-2 text-sm font-semibold text-foreground">Phone Number</Text>
              </View>
              <RNTextInput
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor="#999"
                className="border border-border rounded-lg px-4 py-3 text-base text-foreground bg-surface"
              />
            </View>
          </Card>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleSave}
              disabled={updateProfileMutation.isPending}
              className="flex-row items-center justify-center rounded-xl bg-gold py-4"
              activeOpacity={0.7}
            >
              {updateProfileMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-base font-semibold text-white">Save Changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              disabled={updateProfileMutation.isPending}
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

export default EditProfileScreen;
