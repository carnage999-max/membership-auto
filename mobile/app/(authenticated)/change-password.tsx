import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput as RNTextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react-native';
import { Card } from '@/components/ui/card';
import { userService } from '@/services/api/user.service';
import { useMutation } from '@tanstack/react-query';
import { showToast } from '@/utils/toast';

const ChangePasswordScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      userService.changePassword(data),
    onSuccess: () => {
      showToast('success', 'Password changed successfully');
      router.back();
    },
    onError: () => {
      showToast('error', 'Failed to change password. Check your current password.');
    },
  });

  const handleSave = () => {
    if (!formData.oldPassword.trim()) {
      showToast('error', 'Current password is required');
      return;
    }
    if (!formData.newPassword.trim()) {
      showToast('error', 'New password is required');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      showToast('error', 'New passwords do not match');
      return;
    }
    if (formData.newPassword.length < 8) {
      showToast('error', 'Password must be at least 8 characters');
      return;
    }
    changePasswordMutation.mutate({
      current_password: formData.oldPassword,
      new_password: formData.newPassword,
    });
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View className="px-4 pt-6">
          {/* Security Info Card */}
          <Card className="mb-6 bg-blue-50 border border-blue-200">
            <Text className="text-sm text-blue-900">
              For your security, use a strong password that includes uppercase, lowercase, numbers, and symbols.
            </Text>
          </Card>

          {/* Current Password */}
          <Card className="mb-4">
            <View className="mb-2">
              <Text className="text-sm font-semibold text-foreground mb-2">Current Password</Text>
              <View className="flex-row items-center border border-border rounded-lg bg-surface px-4">
                <RNTextInput
                  value={formData.oldPassword}
                  onChangeText={(text) => setFormData({ ...formData, oldPassword: text })}
                  placeholder="Enter your current password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPasswords.old}
                  className="flex-1 py-3 text-base text-foreground"
                />
                <TouchableOpacity
                  onPress={() => setShowPasswords({ ...showPasswords, old: !showPasswords.old })}
                  className="p-2"
                >
                  {showPasswords.old ? (
                    <EyeOff size={18} color="#cba86e" />
                  ) : (
                    <Eye size={18} color="#cba86e" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          {/* New Password */}
          <Card className="mb-4">
            <View className="mb-2">
              <Text className="text-sm font-semibold text-foreground mb-2">New Password</Text>
              <View className="flex-row items-center border border-border rounded-lg bg-surface px-4">
                <RNTextInput
                  value={formData.newPassword}
                  onChangeText={(text) => setFormData({ ...formData, newPassword: text })}
                  placeholder="Enter new password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPasswords.new}
                  className="flex-1 py-3 text-base text-foreground"
                />
                <TouchableOpacity
                  onPress={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                  className="p-2"
                >
                  {showPasswords.new ? (
                    <EyeOff size={18} color="#cba86e" />
                  ) : (
                    <Eye size={18} color="#cba86e" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          {/* Confirm Password */}
          <Card className="mb-6">
            <View className="mb-2">
              <Text className="text-sm font-semibold text-foreground mb-2">Confirm New Password</Text>
              <View className="flex-row items-center border border-border rounded-lg bg-surface px-4">
                <RNTextInput
                  value={formData.confirmPassword}
                  onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                  placeholder="Confirm new password"
                  placeholderTextColor="#999"
                  secureTextEntry={!showPasswords.confirm}
                  className="flex-1 py-3 text-base text-foreground"
                />
                <TouchableOpacity
                  onPress={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                  className="p-2"
                >
                  {showPasswords.confirm ? (
                    <EyeOff size={18} color="#cba86e" />
                  ) : (
                    <Eye size={18} color="#cba86e" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Card>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleSave}
              disabled={changePasswordMutation.isPending}
              className="flex-row items-center justify-center rounded-xl bg-gold py-4"
              activeOpacity={0.7}
            >
              {changePasswordMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-base font-semibold text-white">Update Password</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              disabled={changePasswordMutation.isPending}
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

export default ChangePasswordScreen;
