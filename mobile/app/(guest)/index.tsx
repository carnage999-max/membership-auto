import { TextInput } from '@/components/ui/text-input';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from 'react-native';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginScreen = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error } = useAuthStore();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
    } catch (err) {
      // Error is handled by the store
      console.error('Login error:', err);
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
        {/* Logo/Header */}
        <View className="mb-12 items-center">
          <Text className="mb-2 text-4xl font-bold text-gold">Membership Auto</Text>
          <Text className="text-base text-textSecondary">
            Your premium automotive membership
          </Text>
        </View>

        {/* Error Message */}
        {error && (
          <View className="mb-4 rounded-lg bg-error/10 border border-error/20 p-4">
            <Text className="text-sm text-error">{error}</Text>
          </View>
        )}

        {/* Login Form */}
        <View className="mb-6">
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
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                placeholder="Enter your password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
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

          <TouchableOpacity
            onPress={() => router.push('/(guest)/forgot-password')}
            className="mb-6"
          >
            <Text className="text-right text-sm text-gold">Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <Button
          onPress={handleSubmit(onSubmit)}
          isLoading={isLoading}
          className="mb-4"
          size="lg"
        >
          Log In
        </Button>

        {/* Sign Up Link */}
        <View className="flex-row items-center justify-center">
          <Text className="text-sm text-textSecondary">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(guest)/sign-up')}>
            <Text className="text-sm font-semibold text-gold">Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
