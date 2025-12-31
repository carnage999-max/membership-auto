import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { parkingService } from '@/services/api/parking.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Car,
  MapPin,
  Navigation,
  Trash2,
  Camera,
  Clock,
  Plus,
} from 'lucide-react-native';
import {
  ScrollView,
  Text,
  View,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { showToast } from '@/utils/toast';

const ParkingScreen = () => {
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(
    null
  );
  const queryClient = useQueryClient();

  const {
    data: activeSpot,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['parking', 'active'],
    queryFn: parkingService.getActive,
  });

  const saveParkingMutation = useMutation({
    mutationFn: parkingService.save,
    onSuccess: () => {
      showToast('success', 'Parking spot saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['parking'] });
    },
    onError: (error: any) => {
      console.error('Save parking error:', error);
      showToast('error', error.response?.data?.message || 'Failed to save parking spot');
    },
  });

  const clearParkingMutation = useMutation({
    mutationFn: parkingService.clearActive,
    onSuccess: () => {
      showToast('success', 'Parking spot cleared');
      queryClient.invalidateQueries({ queryKey: ['parking'] });
    },
    onError: (error: any) => {
      console.error('Clear parking error:', error);
      showToast('error', 'Failed to clear parking spot');
    },
  });

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location);
      } else {
        showToast('error', 'Location permission denied');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      showToast('error', 'Failed to get location');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await requestLocationPermission();
    setRefreshing(false);
  };

  const handleSaveCurrentLocation = async () => {
    if (!currentLocation) {
      showToast('error', 'Unable to get current location');
      return;
    }

    try {
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const addressString = address[0]
        ? `${address[0].street || ''} ${address[0].city || ''}, ${address[0].region || ''}`
        : undefined;

      saveParkingMutation.mutate({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address: addressString,
      });
    } catch (error) {
      console.error('Error saving parking spot:', error);
      showToast('error', 'Failed to save parking spot');
    }
  };

  const handleClearParking = () => {
    Alert.alert(
      'Clear Parking Spot',
      'Are you sure you want to clear your saved parking spot?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearParkingMutation.mutate(),
        },
      ]
    );
  };

  const handleNavigate = () => {
    if (!activeSpot) return;

    const url = Platform.select({
      ios: `maps://app?daddr=${activeSpot.latitude},${activeSpot.longitude}`,
      android: `google.navigation:q=${activeSpot.latitude},${activeSpot.longitude}`,
    });

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to web version
          const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${activeSpot.latitude},${activeSpot.longitude}`;
          Linking.openURL(webUrl);
        }
      });
    }
  };

  const getTimeSinceParked = (parkedAt: string) => {
    const parkedDate = new Date(parkedAt);
    const now = new Date();
    const diffMs = now.getTime() - parkedDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m ago`;
    }
    return `${diffMins}m ago`;
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
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#cba86e"
          />
        }
      >
        <View className="px-4 pt-4">
          {/* Header */}
          <View className="mb-6">
            <Text className="text-2xl font-bold text-foreground">Parking Reminder</Text>
            <Text className="mt-1 text-sm text-textSecondary">
              Never forget where you parked
            </Text>
          </View>

          {/* Active Parking Spot */}
          {activeSpot ? (
            <Card className="mb-6 p-4">
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-gold/20">
                  <Car size={24} color="#cba86e" />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground">
                    Current Parking Spot
                  </Text>
                  <View className="mt-1 flex-row items-center">
                    <Clock size={12} color="#707070" />
                    <Text className="ml-1 text-xs text-textMuted">
                      Parked {getTimeSinceParked(activeSpot.parked_at)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Address */}
              {activeSpot.address && (
                <View className="mb-4 flex-row items-start">
                  <MapPin size={16} color="#cba86e" className="mt-1" />
                  <Text className="ml-2 flex-1 text-sm text-textSecondary">
                    {activeSpot.address}
                  </Text>
                </View>
              )}

              {/* Coordinates */}
              <View className="mb-4 rounded-lg bg-surface p-3">
                <Text className="text-xs text-textMuted">Coordinates</Text>
                <Text className="mt-1 text-sm font-mono text-foreground">
                  {activeSpot.latitude.toFixed(6)}, {activeSpot.longitude.toFixed(6)}
                </Text>
              </View>

              {/* Notes */}
              {activeSpot.notes && (
                <View className="mb-4">
                  <Text className="mb-2 text-xs text-textMuted">Notes</Text>
                  <Text className="text-sm text-textSecondary">{activeSpot.notes}</Text>
                </View>
              )}

              {/* Action Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleNavigate}
                  className="flex-1 flex-row items-center justify-center rounded-lg bg-gold py-3"
                  activeOpacity={0.7}
                >
                  <Navigation size={16} color="#0d0d0d" />
                  <Text className="ml-2 text-sm font-semibold text-background">
                    Navigate
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleClearParking}
                  className="flex-row items-center justify-center rounded-lg border border-error px-4 py-3"
                  activeOpacity={0.7}
                  disabled={clearParkingMutation.isPending}
                >
                  <Trash2 size={16} color="#dd4a48" />
                </TouchableOpacity>
              </View>
            </Card>
          ) : (
            <Card className="mb-6 p-6">
              <View className="items-center">
                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-surface">
                  <Car size={32} color="#707070" />
                </View>
                <Text className="mb-2 text-lg font-semibold text-foreground">
                  No Parking Spot Saved
                </Text>
                <Text className="mb-6 text-center text-sm text-textSecondary">
                  Save your current location to remember where you parked
                </Text>
                <TouchableOpacity
                  onPress={handleSaveCurrentLocation}
                  className="w-full flex-row items-center justify-center rounded-lg bg-gold py-3"
                  activeOpacity={0.7}
                  disabled={saveParkingMutation.isPending || !currentLocation}
                >
                  {saveParkingMutation.isPending ? (
                    <ActivityIndicator size="small" color="#0d0d0d" />
                  ) : (
                    <>
                      <Plus size={16} color="#0d0d0d" />
                      <Text className="ml-2 text-sm font-semibold text-background">
                        Save Current Location
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </Card>
          )}

          {/* Tips */}
          <Card className="p-4">
            <Text className="mb-3 text-base font-semibold text-foreground">
              Quick Tips
            </Text>
            <View className="gap-3">
              <View className="flex-row">
                <View className="mr-3 mt-1">
                  <View className="h-2 w-2 rounded-full bg-gold" />
                </View>
                <Text className="flex-1 text-sm text-textSecondary">
                  Save your parking spot before walking away from your car
                </Text>
              </View>
              <View className="flex-row">
                <View className="mr-3 mt-1">
                  <View className="h-2 w-2 rounded-full bg-gold" />
                </View>
                <Text className="flex-1 text-sm text-textSecondary">
                  Use the navigate button to get turn-by-turn directions back to your car
                </Text>
              </View>
              <View className="flex-row">
                <View className="mr-3 mt-1">
                  <View className="h-2 w-2 rounded-full bg-gold" />
                </View>
                <Text className="flex-1 text-sm text-textSecondary">
                  Clear your spot when you leave to avoid confusion
                </Text>
              </View>
            </View>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
};

export default ParkingScreen;
