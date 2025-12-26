import { Button } from '@/components/ui/button';
import { TextInput } from '@/components/ui/text-input';
import { useAuthStore } from '@/stores/auth.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Eye, EyeOff, Lock, Mail, Phone, User as UserIcon } from 'lucide-react-native';
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

const signUpSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    phone: z.string().min(10, 'Please enter a valid phone number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    referralCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUpScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading, error } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      referralCode: '',
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await register({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        membershipVerificationCode: data.referralCode,
      });
    } catch (err) {
      console.error('Sign up error:', err);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerClassName="flex-grow px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View className="mb-8">
          <Text className="mb-2 text-3xl font-bold text-gold">Create Account</Text>
          <Text className="text-base text-textSecondary">
            Join Membership Auto for premium automotive care
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View className="mb-4 rounded-lg border border-error/20 bg-error/10 p-4">
            <Text className="text-sm text-error">{error}</Text>
          </View>
        )}

        {/* Sign Up Form */}
        <View className="mb-6">
          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Full Name"
                placeholder="Enter your full name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                autoCapitalize="words"
                leftIcon={<UserIcon size={20} color="#707070" />}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email"
                placeholder="Enter your email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                leftIcon={<Mail size={20} color="#707070" />}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Phone Number"
                placeholder="(555) 123-4567"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
                keyboardType="phone-pad"
                autoComplete="tel"
                leftIcon={<Phone size={20} color="#707070" />}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                placeholder="Create a password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                leftIcon={<Lock size={20} color="#707070" />}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff size={20} color="#707070" />
                    ) : (
                      <Eye size={20} color="#707070" />
                    )}
                  </TouchableOpacity>
                }
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirm Password"
                placeholder="Confirm your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.confirmPassword?.message}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                leftIcon={<Lock size={20} color="#707070" />}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={20} color="#707070" />
                    ) : (
                      <Eye size={20} color="#707070" />
                    )}
                  </TouchableOpacity>
                }
              />
            )}
          />

          <Controller
            control={control}
            name="referralCode"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Referral Code (Optional)"
                placeholder="Enter referral code"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.referralCode?.message}
                autoCapitalize="characters"
                helperText="Get 50% off your first month with a referral code"
              />
            )}
          />
        </View>

        {/* Sign Up Button */}
        <Button onPress={handleSubmit(onSubmit)} isLoading={isLoading} className="mb-4" size="lg">
          Create Account
        </Button>

        {/* Login Link */}
        <View className="flex-row items-center justify-center">
          <Text className="text-sm text-textSecondary">Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-sm font-semibold text-gold">Log In</Text>
          </TouchableOpacity>
        </View>

        {/* Terms */}
        <Text className="mt-6 text-center text-xs text-textMuted">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
