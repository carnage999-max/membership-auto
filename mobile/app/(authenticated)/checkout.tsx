import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { paymentService } from '@/services/api/payment.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { showToast } from '@/utils/toast';
import { useAuthStore } from '@/stores/auth.store';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard, Lock, Check } from 'lucide-react-native';

const CheckoutScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { user, refreshProfile } = useAuthStore();

  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState(user?.name || '');
  const [saveCard, setSaveCard] = useState(true);

  const { data: plans } = useQuery({
    queryKey: ['membership-plans'],
    queryFn: paymentService.getPlans,
  });

  const selectedPlan = plans?.find((p) => p.id === planId);

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPlan) throw new Error('Plan not found');

      // In a real implementation, you'd use Stripe Elements or SDK
      // to tokenize the card before sending to backend
      // For now, we'll simulate the payment

      // Create a mock payment method ID (in production, use Stripe SDK)
      const mockPaymentMethodId = `pm_${Math.random().toString(36).substring(7)}`;

      return await paymentService.subscribe(selectedPlan.id, mockPaymentMethodId);
    },
    onSuccess: async () => {
      showToast('success', 'Subscription activated successfully!');

      // Refresh user profile to get updated membership status
      await refreshProfile();

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });

      // Navigate to home with success message
      router.replace('/(authenticated)/');
    },
    onError: (error: any) => {
      showToast('error', error.response?.data?.message || 'Payment failed. Please try again.');
    },
  });

  const handleSubscribe = () => {
    // Validate card details
    if (!cardNumber || !expiryDate || !cvv || !nameOnCard) {
      showToast('error', 'Please fill in all card details');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      showToast('error', 'Please enter a valid 16-digit card number');
      return;
    }

    if (!expiryDate.match(/^\d{2}\/\d{2}$/)) {
      showToast('error', 'Please enter expiry date in MM/YY format');
      return;
    }

    if (cvv.length !== 3 && cvv.length !== 4) {
      showToast('error', 'Please enter a valid CVV');
      return;
    }

    subscribeMutation.mutate();
  };

  // Format card number with spaces
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    setCardNumber(formatted);
  };

  // Format expiry date
  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      setExpiryDate(cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4));
    } else {
      setExpiryDate(cleaned);
    }
  };

  if (!selectedPlan) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-textSecondary">Plan not found</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View className="px-4 pt-4">
          {/* Selected Plan Summary */}
          <Card className="mb-6 border-2 border-gold bg-gold/10 p-4">
            <Text className="mb-2 text-sm font-medium text-textMuted">Selected Plan</Text>
            <View className="flex-row items-baseline justify-between">
              <Text className="text-xl font-bold text-foreground">{selectedPlan.name}</Text>
              <View className="flex-row items-baseline">
                <Text className="text-2xl font-bold text-gold">${selectedPlan.price}</Text>
                <Text className="ml-1 text-sm text-textSecondary">
                  /{selectedPlan.interval === 'month' ? 'mo' : 'yr'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Payment Information */}
          <Card className="mb-6 p-4">
            <View className="mb-4 flex-row items-center">
              <CreditCard size={20} color="#cba86e" />
              <Text className="ml-2 text-lg font-semibold text-foreground">
                Payment Information
              </Text>
            </View>

            {/* Card Number */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-foreground">Card Number *</Text>
              <TextInput
                className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#707070"
                keyboardType="numeric"
                maxLength={19}
                value={cardNumber}
                onChangeText={formatCardNumber}
              />
            </View>

            {/* Expiry and CVV */}
            <View className="mb-4 flex-row gap-3">
              <View className="flex-1">
                <Text className="mb-2 text-sm font-medium text-foreground">Expiry Date *</Text>
                <TextInput
                  className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
                  placeholder="MM/YY"
                  placeholderTextColor="#707070"
                  keyboardType="numeric"
                  maxLength={5}
                  value={expiryDate}
                  onChangeText={formatExpiryDate}
                />
              </View>
              <View className="flex-1">
                <Text className="mb-2 text-sm font-medium text-foreground">CVV *</Text>
                <TextInput
                  className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
                  placeholder="123"
                  placeholderTextColor="#707070"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  value={cvv}
                  onChangeText={setCvv}
                />
              </View>
            </View>

            {/* Name on Card */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-foreground">Name on Card *</Text>
              <TextInput
                className="rounded-lg border border-border bg-surface px-4 py-3 text-foreground"
                placeholder="John Doe"
                placeholderTextColor="#707070"
                autoCapitalize="words"
                value={nameOnCard}
                onChangeText={setNameOnCard}
              />
            </View>

            {/* Save Card Checkbox */}
            <TouchableOpacity
              onPress={() => setSaveCard(!saveCard)}
              className="flex-row items-center"
              activeOpacity={0.7}
            >
              <View
                className={`mr-3 h-5 w-5 items-center justify-center rounded ${
                  saveCard ? 'bg-gold' : 'border-2 border-border bg-transparent'
                }`}
              >
                {saveCard && <Check size={14} color="#0d0d0d" />}
              </View>
              <Text className="text-sm text-textSecondary">
                Save card for future payments
              </Text>
            </TouchableOpacity>
          </Card>

          {/* Security Note */}
          <Card className="mb-6 border-2 border-blue-500/30 bg-blue-500/10 p-4">
            <View className="flex-row items-start">
              <Lock size={16} color="#3b82f6" />
              <View className="ml-3 flex-1">
                <Text className="mb-1 text-sm font-semibold text-blue-600">
                  Secure Payment
                </Text>
                <Text className="text-xs leading-5 text-blue-600/80">
                  Your payment information is encrypted and secure. We use Stripe for processing
                  payments and never store your card details on our servers.
                </Text>
              </View>
            </View>
          </Card>

          {/* Order Summary */}
          <Card className="mb-6 p-4">
            <Text className="mb-3 text-base font-semibold text-foreground">Order Summary</Text>
            <View className="gap-2">
              <View className="flex-row justify-between">
                <Text className="text-sm text-textSecondary">
                  {selectedPlan.name} ({selectedPlan.interval}ly)
                </Text>
                <Text className="text-sm font-medium text-foreground">
                  ${selectedPlan.price.toFixed(2)}
                </Text>
              </View>
              <View className="my-2 border-t border-border" />
              <View className="flex-row justify-between">
                <Text className="text-base font-semibold text-foreground">Total Due Today</Text>
                <Text className="text-xl font-bold text-gold">
                  ${selectedPlan.price.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Subscribe Button */}
          <TouchableOpacity
            onPress={handleSubscribe}
            disabled={subscribeMutation.isPending}
            className="mb-4 flex-row items-center justify-center rounded-xl bg-gold py-4"
            activeOpacity={0.7}
          >
            {subscribeMutation.isPending ? (
              <ActivityIndicator size="small" color="#0d0d0d" />
            ) : (
              <>
                <Lock size={20} color="#0d0d0d" />
                <Text className="ml-2 text-base font-semibold text-background">
                  Subscribe Now - ${selectedPlan.price}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <Text className="mb-6 text-center text-xs text-textMuted">
            By subscribing, you agree to our Terms of Service and Privacy Policy. Your
            subscription will auto-renew {selectedPlan.interval}ly.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default CheckoutScreen;
