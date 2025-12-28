import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CardField, useStripe } from '@stripe/stripe-react-native';
import { Card } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '@/services/api/payment.service';
import { showToast } from '@/utils/toast';
import { CreditCard, Lock, CheckCircle } from 'lucide-react-native';

const CheckoutScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { planId, planName, planPrice } = useLocalSearchParams<{
    planId: string;
    planName: string;
    planPrice: string;
  }>();
  const queryClient = useQueryClient();
  const { confirmPayment } = useStripe();

  const [cardDetails, setCardDetails] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Create payment intent mutation
  const createPaymentMutation = useMutation({
    mutationFn: () => paymentService.createPaymentIntent(planId),
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to create payment';
      showToast('error', errorMsg);
    },
  });

  // Confirm payment mutation
  const confirmPaymentMutation = useMutation({
    mutationFn: (paymentId: string) => paymentService.confirmPayment(paymentId),
    onSuccess: (data) => {
      showToast('success', `Membership activated! Welcome to ${data.plan_name}!`);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['plans'] });

      // Navigate to profile
      setTimeout(() => {
        router.replace('/(authenticated)/profile');
      }, 1500);
    },
    onError: (error: any) => {
      const errorMsg = error?.response?.data?.error || error?.message || 'Failed to confirm payment';
      showToast('error', errorMsg);
    },
  });

  const handlePayment = async () => {
    if (!cardDetails?.complete) {
      showToast('error', 'Please enter valid card details');
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create payment intent
      const paymentIntent = await createPaymentMutation.mutateAsync();

      // Step 2: Confirm payment with Stripe
      const { error, paymentIntent: confirmedIntent } = await confirmPayment(
        paymentIntent.clientSecret,
        {
          paymentMethodType: 'Card',
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (confirmedIntent?.status === 'Succeeded') {
        // Step 3: Confirm payment on backend and create membership
        await confirmPaymentMutation.mutateAsync(paymentIntent.paymentId);
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      showToast('error', error.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Payment',
      'Are you sure you want to cancel this payment?',
      [
        { text: 'Continue', style: 'cancel' },
        {
          text: 'Cancel Payment',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View className="px-4 pt-6">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground mb-2">
              Complete Payment
            </Text>
            <Text className="text-base text-textSecondary">
              Securely complete your payment to activate your {planName} membership
            </Text>
          </View>

          {/* Plan Summary */}
          <Card className="mb-6" variant="elevated">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-foreground">Plan Summary</Text>
              <CheckCircle size={20} color="#4caf50" />
            </View>
            <View className="pt-3 border-t border-border">
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-textSecondary">Plan</Text>
                <Text className="text-sm font-semibold text-foreground">{planName}</Text>
              </View>
              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-textSecondary">Billing Frequency</Text>
                <Text className="text-sm font-semibold text-foreground">Monthly</Text>
              </View>
              <View className="flex-row justify-between pt-3 border-t border-border">
                <Text className="text-base font-semibold text-foreground">Total Today</Text>
                <Text className="text-xl font-bold text-gold">${planPrice}</Text>
              </View>
            </View>
          </Card>

          {/* Payment Method */}
          <Card className="mb-6" variant="elevated">
            <View className="flex-row items-center mb-4">
              <CreditCard size={20} color="#cba86e" />
              <Text className="ml-2 text-lg font-semibold text-foreground">Payment Method</Text>
            </View>

            <CardField
              postalCodeEnabled={true}
              placeholders={{
                number: '4242 4242 4242 4242',
              }}
              cardStyle={{
                backgroundColor: '#FFFFFF',
                textColor: '#000000',
                borderWidth: 1,
                borderColor: '#E5E5E5',
                borderRadius: 8,
              }}
              style={{
                width: '100%',
                height: 50,
                marginVertical: 10,
              }}
              onCardChange={(details) => {
                setCardDetails(details);
              }}
            />

            <View className="flex-row items-center mt-4 p-3 bg-blue-50 rounded-lg">
              <Lock size={16} color="#2563eb" />
              <Text className="ml-2 text-xs text-blue-900 flex-1">
                Your payment information is encrypted and secure
              </Text>
            </View>
          </Card>

          {/* Action Buttons */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handlePayment}
              disabled={isProcessing || !cardDetails?.complete || createPaymentMutation.isPending}
              className={`flex-row items-center justify-center rounded-xl py-4 ${
                isProcessing || !cardDetails?.complete
                  ? 'bg-gray-500/50'
                  : 'bg-gold'
              }`}
              activeOpacity={0.7}
            >
              {isProcessing || createPaymentMutation.isPending || confirmPaymentMutation.isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  Pay ${planPrice}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCancel}
              disabled={isProcessing}
              className="flex-row items-center justify-center rounded-xl border-2 border-border bg-transparent py-4"
              activeOpacity={0.7}
            >
              <Text className="text-base font-semibold text-foreground">Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Info */}
          <Card className="mt-6 bg-gray-100 border border-gray-200">
            <Text className="text-xs text-gray-700 mb-2">
              • Your subscription will automatically renew each month
            </Text>
            <Text className="text-xs text-gray-700 mb-2">
              • You can cancel anytime from your profile settings
            </Text>
            <Text className="text-xs text-gray-700">
              • All payments are processed securely through Stripe
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

export default CheckoutScreen;
