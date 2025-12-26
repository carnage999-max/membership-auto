import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { authService } from '@/services/api/auth.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { ArrowLeft, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { z } from 'zod';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

const resetPasswordSchema = z
  .object({
    code: z.string().min(4, 'Please enter the verification code'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ForgotPasswordScreen = () => {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    control: requestControl,
    handleSubmit: handleRequestSubmit,
    formState: { errors: requestErrors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const {
    control: resetControl,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onRequestReset = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      await authService.forgotPassword(data.email);

      setEmail(data.email);
      setStep('reset');
      setSuccess('Verification code sent to your email');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send reset code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      await authService.resetPassword(email, data.code, data.newPassword);

      setSuccess('Password reset successfully!');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.replace('/(guest)');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. Please check your code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-8 flex-row items-center"
          activeOpacity={0.7}
        >
          <ArrowLeft size={20} color="#cba86e" />
          <Text className="ml-2 text-sm font-medium text-gold">Back to Login</Text>
        </TouchableOpacity>

        {/* Header */}
        <View className="mb-8">
          <Text className="mb-2 text-3xl font-bold text-gold">
            {step === 'request' ? 'Forgot Password?' : 'Reset Password'}
          </Text>
          <Text className="text-base text-textSecondary">
            {step === 'request'
              ? 'Enter your email to receive a verification code'
              : 'Enter the code sent to your email and create a new password'}
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View className="mb-4 rounded-lg border border-error/20 bg-error/10 p-4">
            <Text className="text-sm text-error">{error}</Text>
          </View>
        )}

        {/* Success Message */}
        {success && (
          <View className="mb-4 rounded-lg border border-success/20 bg-success/10 p-4">
            <Text className="text-sm text-success">{success}</Text>
          </View>
        )}

        {/* Request Reset Form */}
        {step === 'request' && (
          <View className="mb-6">
            <Controller
              control={requestControl}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Email"
                  placeholder="Enter your email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={requestErrors.email?.message}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  leftIcon={<Mail size={20} color="#707070" />}
                />
              )}
            />

            <Button
              onPress={handleRequestSubmit(onRequestReset)}
              isLoading={isLoading}
              className="mt-2"
              size="lg"
            >
              Send Reset Code
            </Button>
          </View>
        )}

        {/* Reset Password Form */}
        {step === 'reset' && (
          <View className="mb-6">
            <Controller
              control={resetControl}
              name="code"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Verification Code"
                  placeholder="Enter 6-digit code"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={resetErrors.code?.message}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              )}
            />

            <Controller
              control={resetControl}
              name="newPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="New Password"
                  placeholder="Create a new password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={resetErrors.newPassword?.message}
                  secureTextEntry
                  autoCapitalize="none"
                  leftIcon={<Lock size={20} color="#707070" />}
                />
              )}
            />

            <Controller
              control={resetControl}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Confirm Password"
                  placeholder="Confirm your new password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={resetErrors.confirmPassword?.message}
                  secureTextEntry
                  autoCapitalize="none"
                  leftIcon={<Lock size={20} color="#707070" />}
                />
              )}
            />

            <Button
              onPress={handleResetSubmit(onResetPassword)}
              isLoading={isLoading}
              className="mt-2"
              size="lg"
            >
              Reset Password
            </Button>

            <TouchableOpacity
              onPress={() => {
                setStep('request');
                setError(null);
                setSuccess(null);
              }}
              className="mt-4"
            >
              <Text className="text-center text-sm text-gold">Didn't receive code? Resend</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;
