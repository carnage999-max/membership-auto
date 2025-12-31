import React from 'react';
import { Card } from '@/components/ui/card';
import { paymentService, MembershipPlan } from '@/services/api/payment.service';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, Zap } from 'lucide-react-native';

const PlansScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['membership-plans'],
    queryFn: paymentService.getPlans,
  });

  const handleSelectPlan = (plan: MembershipPlan) => {
    router.push({
      pathname: '/(authenticated)/checkout',
      params: { planId: plan.id },
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#cba86e" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View className="px-4 pt-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground">Choose Your Plan</Text>
            <Text className="mt-1 text-sm text-textSecondary">
              Select the membership that works best for you
            </Text>
          </View>

          {/* Plans */}
          <View className="gap-4">
            {plans?.map((plan) => (
              <Card
                key={plan.id}
                className={`p-6 ${plan.popular ? 'border-2 border-gold bg-gold/5' : ''}`}
              >
                {plan.popular && (
                  <View className="absolute -top-3 right-4 flex-row items-center rounded-full bg-gold px-3 py-1">
                    <Zap size={12} color="#0d0d0d" fill="#0d0d0d" />
                    <Text className="ml-1 text-xs font-bold text-background">POPULAR</Text>
                  </View>
                )}

                {/* Plan Header */}
                <View className="mb-4">
                  <Text className="text-xl font-bold text-foreground">{plan.name}</Text>
                  <View className="mt-2 flex-row items-baseline">
                    <Text className="text-4xl font-bold text-gold">${plan.price}</Text>
                    <Text className="ml-2 text-sm text-textSecondary">
                      /{plan.interval === 'month' ? 'mo' : 'yr'}
                    </Text>
                  </View>
                  {plan.interval === 'year' && (
                    <View className="mt-2 rounded-full bg-success/20 px-3 py-1 self-start">
                      <Text className="text-xs font-semibold text-success">
                        Save ${((plan.price / 12 - plan.price) * -1).toFixed(0)}/month
                      </Text>
                    </View>
                  )}
                </View>

                {/* Features */}
                <View className="mb-6 gap-3">
                  {plan.features.map((feature, index) => (
                    <View key={index} className="flex-row items-start">
                      <View className="mr-3 mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-gold/20">
                        <Check size={14} color="#cba86e" />
                      </View>
                      <Text className="flex-1 text-sm text-textSecondary leading-5">
                        {feature}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* CTA Button */}
                <TouchableOpacity
                  onPress={() => handleSelectPlan(plan)}
                  className={`flex-row items-center justify-center rounded-xl py-4 ${
                    plan.popular ? 'bg-gold' : 'border-2 border-gold bg-transparent'
                  }`}
                  activeOpacity={0.7}
                >
                  <Text
                    className={`text-base font-semibold ${
                      plan.popular ? 'text-background' : 'text-gold'
                    }`}
                  >
                    Select {plan.name}
                  </Text>
                </TouchableOpacity>
              </Card>
            ))}
          </View>

          {/* Info Card */}
          <Card className="mt-6 border-2 border-gold bg-gold/10 p-4">
            <Text className="mb-2 text-sm font-semibold text-foreground">
              All Plans Include:
            </Text>
            <View className="gap-2">
              <Text className="text-xs text-textSecondary">
                • Cancel anytime with no penalty
              </Text>
              <Text className="text-xs text-textSecondary">
                • Access to all service centers nationwide
              </Text>
              <Text className="text-xs text-textSecondary">
                • 30-day money-back guarantee
              </Text>
              <Text className="text-xs text-textSecondary">
                • Priority customer support
              </Text>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

export default PlansScreen;
