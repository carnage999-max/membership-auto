import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Plus, Trash2, CreditCard } from 'lucide-react-native';
import { Card } from '@/components/ui/card';
import { showToast } from '@/utils/toast';

const PaymentMethodsScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: '1',
      type: 'card',
      cardNumber: '•••• •••• •••• 4242',
      cardBrand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      cardNumber: '•••• •••• •••• 5555',
      cardBrand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2026,
      isDefault: false,
    },
  ]);

  const handleDeletePaymentMethod = (id: string) => {
    Alert.alert('Remove Payment Method', 'Are you sure you want to remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setPaymentMethods((prev) => prev.filter((method) => method.id !== id));
          showToast('success', 'Payment method removed');
        },
      },
    ]);
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
    showToast('success', 'Default payment method updated');
  };

  const renderPaymentMethod = ({ item }: { item: (typeof paymentMethods)[0] }) => (
    <Card className="mb-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <CreditCard size={20} color="#cba86e" />
            <Text className="ml-2 text-base font-semibold text-foreground">{item.cardBrand}</Text>
            {item.isDefault && (
              <View className="ml-2 rounded-full bg-gold/20 px-2 py-1">
                <Text className="text-xs font-semibold text-gold">Default</Text>
              </View>
            )}
          </View>
          <Text className="text-sm text-textSecondary mb-1">{item.cardNumber}</Text>
          <Text className="text-xs text-textMuted">Expires {item.expiryMonth}/{item.expiryYear}</Text>
        </View>
        <TouchableOpacity
          onPress={() => handleDeletePaymentMethod(item.id)}
          className="p-2"
          activeOpacity={0.7}
        >
          <Trash2 size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </View>

      {!item.isDefault && (
        <TouchableOpacity
          onPress={() => handleSetDefault(item.id)}
          className="mt-4 flex-row items-center justify-center rounded-lg border-2 border-border bg-transparent py-2"
          activeOpacity={0.7}
        >
          <Text className="text-sm font-semibold text-foreground">Set as Default</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View className="px-4 pt-6">
          {/* Info Card */}
          <Card className="mb-6 bg-blue-50 border border-blue-200">
            <Text className="text-sm text-blue-900">
              Your payment methods are securely stored and encrypted. You can manage which card is used for auto-renewal.
            </Text>
          </Card>

          {/* Saved Cards Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-foreground">Saved Cards</Text>
              <View className="rounded-full bg-gold/20 px-2 py-1">
                <Text className="text-xs font-semibold text-gold">{paymentMethods.length}</Text>
              </View>
            </View>

            {paymentMethods.length > 0 ? (
              <FlatList
                data={paymentMethods}
                renderItem={renderPaymentMethod}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <Card className="items-center py-8">
                <Text className="text-center text-sm text-textMuted">No payment methods saved yet</Text>
                <TouchableOpacity
                  onPress={() => showToast('info', 'Add payment method - coming soon')}
                  className="mt-4 flex-row items-center justify-center rounded-lg bg-gold px-4 py-2"
                  activeOpacity={0.7}
                >
                  <Plus size={16} color="#ffffff" />
                  <Text className="ml-2 text-sm font-semibold text-white">Add Card</Text>
                </TouchableOpacity>
              </Card>
            )}
          </View>

          {/* Billing Address Section */}
          <Card className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-foreground">Billing Address</Text>
              <TouchableOpacity onPress={() => showToast('info', 'Edit billing address - coming soon')} activeOpacity={0.7}>
                <Text className="text-sm font-semibold text-gold">Edit</Text>
              </TouchableOpacity>
            </View>
            <View className="pt-4 border-t border-border">
              <Text className="text-sm text-textSecondary mb-1">No billing address on file</Text>
              <Text className="text-xs text-textMuted">Add your billing address for faster checkout</Text>
            </View>
          </Card>

          {/* Auto-Renewal Info */}
          <Card className="mb-6 bg-gold/10 border border-gold/30">
            <Text className="text-sm font-semibold text-gold mb-2">Auto-Renewal Information</Text>
            <Text className="text-xs text-textSecondary">
              The default payment method will be used for your automatic membership renewal. You can change this anytime.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

export default PaymentMethodsScreen;
