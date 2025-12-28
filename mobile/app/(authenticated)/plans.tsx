import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/services/api/payment.service';
import { showToast } from '@/utils/toast';
import { useAuthStore } from '@/stores/auth.store';
import type { Plan } from '@/types';

const PlansScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: paymentService.getPlans,
  });

  const handleSelectPlan = (plan: Plan) => {
    router.push({
      pathname: '/(authenticated)/checkout',
      params: {
        planId: plan.id,
        planName: plan.name,
        planPrice: plan.priceMonthly.toString(),
      },
    });
  };

  const getPlanColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'compact':
        return 'bg-blue-500';
      case 'mid-size':
        return 'bg-green-500';
      case 'suv':
        return 'bg-gold';
      case 'luxury':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#cba86e" />
        <Text className="mt-4 text-base text-textSecondary">Loading plans...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View className="px-4 pt-6">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground mb-2">
              Choose Your Plan
            </Text>
            <Text className="text-base text-textSecondary">
              Select the membership plan that best fits your vehicle maintenance needs
            </Text>
          </View>

          {/* Current Plan Badge */}
          {user?.membershipPlan && (
            <Card className="mb-6 bg-gold/10 border border-gold/30">
              <View className="flex-row items-center">
                <Check size={20} color="#cba86e" />
                <Text className="ml-2 text-sm text-gold font-medium">
                  Current Plan: {user.membershipPlan}
                </Text>
              </View>
            </Card>
          )}

          {/* Plans List */}
          {plans?.map((plan) => {
            const isCurrentPlan = user?.membershipPlan?.toLowerCase() === plan.name.toLowerCase();

            return (
              <Card
                key={plan.id}
                className={`mb-4 ${isCurrentPlan ? 'border-2 border-gold' : ''}`}
                variant="elevated"
              >
                <View className="flex-row items-start justify-between mb-4">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <View className={`h-3 w-3 rounded-full ${getPlanColor(plan.tier)} mr-2`} />
                      <Text className="text-xl font-bold text-foreground">{plan.name}</Text>
                      {isCurrentPlan && (
                        <View className="ml-2 rounded-full bg-gold/20 px-2 py-1">
                          <Text className="text-xs font-semibold text-gold">Current</Text>
                        </View>
                      )}
                    </View>
                    <Text className="text-sm text-textMuted capitalize">{plan.tier} vehicles</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-2xl font-bold text-gold">${plan.priceMonthly}</Text>
                    <Text className="text-xs text-textMuted">/month</Text>
                  </View>
                </View>

                {/* Features */}
                <View className="mb-4 pt-4 border-t border-border">
                  {plan.features?.map((feature, index) => (
                    <View key={index} className="flex-row items-start mb-2">
                      <Check size={16} color="#4caf50" className="mt-1 mr-2" />
                      <Text className="flex-1 text-sm text-textSecondary">{feature}</Text>
                    </View>
                  ))}
                </View>

                {/* Select Button */}
                <TouchableOpacity
                  onPress={() => handleSelectPlan(plan)}
                  disabled={isCurrentPlan}
                  className={`flex-row items-center justify-center rounded-xl py-4 ${
                    isCurrentPlan
                      ? 'bg-gray-500/20'
                      : 'bg-gold'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text className={`text-base font-semibold ${
                    isCurrentPlan ? 'text-gray-500' : 'text-white'
                  }`}>
                    {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                  </Text>
                </TouchableOpacity>
              </Card>
            );
          })}

          {/* Info Card */}
          <Card className="mt-4 bg-blue-50 border border-blue-200">
            <Text className="text-sm text-blue-900 mb-2 font-semibold">
              All plans include:
            </Text>
            <Text className="text-sm text-blue-900">
              • 30-day money-back guarantee{'\n'}
              • Cancel anytime{'\n'}
              • Priority customer support{'\n'}
              • Exclusive member discounts
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

export default PlansScreen;
