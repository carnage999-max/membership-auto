import React from 'react';
import { Card } from '@/components/ui/card';
import { offerService } from '@/services/api/offer.service';
import { useAuthStore } from '@/stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Tag } from 'lucide-react-native';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const OffersScreen = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const {
    data: offers,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['offers'],
    queryFn: () => offerService.getOffers(),
    enabled: !!user,
  });

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#cba86e" />
        }
      >
        <View className="px-4 pt-4">
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground">Special Offers</Text>
            <Text className="mt-1 text-sm text-textSecondary">
              {offers?.length || 0} exclusive deals available
            </Text>
          </View>

          {(!offers || offers.length === 0) && !isLoading && (
            <Card className="items-center py-12">
              <Tag size={64} color="#707070" />
              <Text className="mt-4 text-lg font-semibold text-foreground">No Offers Available</Text>
              <Text className="mt-2 text-center text-sm text-textSecondary">
                Check back soon for exclusive deals
              </Text>
            </Card>
          )}

          {offers?.map((offer) => (
            <Card key={offer.id} className="mb-4" variant="elevated">
              <View className="mb-3 rounded-full bg-gold/20 self-start px-3 py-1">
                <Text className="text-xs font-semibold text-gold uppercase">SPECIAL OFFER</Text>
              </View>

              <Text className="mb-2 text-xl font-bold text-foreground">{offer.title}</Text>
              <Text className="mb-4 text-sm text-textSecondary">{offer.description}</Text>

              <View className="mb-4 flex-row items-center">
                <Calendar size={16} color="#707070" />
                <Text className="ml-2 text-sm text-textMuted">
                  Valid until {new Date(offer.expiryDate).toLocaleDateString()}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default OffersScreen;
