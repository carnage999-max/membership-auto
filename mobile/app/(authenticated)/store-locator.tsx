import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { appointmentService } from '@/services/api/appointment.service';
import { useQuery } from '@tanstack/react-query';
import { showToast } from '@/utils/toast';
import {
  MapPin,
  Phone,
  Navigation,
  Clock,
  List,
  Map as MapIcon,
  Calendar,
} from 'lucide-react-native';
import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import type { ServiceLocation } from '@/types';
import { useRouter } from 'expo-router';

const StoreLocatorScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<ServiceLocation | null>(null);

  // Fetch locations
  const { data: locations, isLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: appointmentService.getLocations,
  });

  // Get user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        showToast('error', 'Location permission is required');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959; // Radius of Earth in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Add distance to locations and sort
  const locationsWithDistance = React.useMemo(() => {
    if (!locations || !userLocation) return locations || [];

    return locations
      .map((location) => ({
        ...location,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          location.latitude,
          location.longitude
        ),
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }, [locations, userLocation]);

  const openInMaps = (location: ServiceLocation) => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${location.latitude},${location.longitude}`;
    const label = location.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      Linking.openURL(url);
    }
  };

  const callLocation = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleBookAppointment = (location: ServiceLocation) => {
    // Navigate to booking flow with pre-selected location
    router.push({
      pathname: '/(authenticated)/book-appointment/location' as any,
      params: { locationId: location.id },
    });
  };

  const renderLocationCard = (location: ServiceLocation) => (
    <Card key={location.id} className="mb-3">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-lg font-bold text-foreground mb-1">{location.name}</Text>
          <View className="flex-row items-start">
            <MapPin size={14} color="#707070" className="mt-0.5" />
            <Text className="ml-1 text-sm text-textSecondary flex-1">
              {location.address}, {location.city}, {location.state} {location.zipCode}
            </Text>
          </View>
        </View>
        {location.distance !== undefined && (
          <View className="ml-3 bg-gold/20 px-2 py-1 rounded">
            <Text className="text-xs font-semibold text-gold">
              {location.distance.toFixed(1)} mi
            </Text>
          </View>
        )}
      </View>

      {/* Hours */}
      {location.hours && (
        <View className="flex-row items-center mb-3">
          <Clock size={14} color="#707070" />
          <Text className="ml-1 text-xs text-textMuted">
            Mon-Fri: {location.hours.monday?.open || 'Closed'} - {location.hours.monday?.close || ''}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onPress={() => openInMaps(location)}
          leftIcon={<Navigation size={16} color="#cba86e" />}
        >
          Directions
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onPress={() => callLocation(location.phone)}
          leftIcon={<Phone size={16} color="#cba86e" />}
        >
          Call
        </Button>
      </View>

      <Button
        variant="primary"
        size="sm"
        className="mt-2"
        onPress={() => handleBookAppointment(location)}
        leftIcon={<Calendar size={16} color="#ffffff" />}
      >
        Book Appointment
      </Button>
    </Card>
  );

  const renderMapView = () => {
    if (!userLocation || !locationsWithDistance || locationsWithDistance.length === 0) {
      return (
        <Card className="items-center justify-center" style={{ height: 400 }}>
          <ActivityIndicator color="#cba86e" />
          <Text className="mt-4 text-sm text-textSecondary">Loading map...</Text>
        </Card>
      );
    }

    return (
      <View>
        <Card className="p-0 overflow-hidden mb-4" style={{ height: 400 }}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
            showsUserLocation
            showsMyLocationButton
          >
            {locationsWithDistance.map((location) => (
              <Marker
                key={location.id}
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                title={location.name}
                description={location.address}
                onPress={() => setSelectedLocation(location)}
              />
            ))}
          </MapView>
        </Card>

        {/* Selected Location Card */}
        {selectedLocation && (
          <View className="mb-4">{renderLocationCard(selectedLocation)}</View>
        )}
      </View>
    );
  };

  const renderListView = () => {
    if (isLoading) {
      return (
        <Card className="items-center py-8">
          <ActivityIndicator color="#cba86e" />
        </Card>
      );
    }

    if (!locationsWithDistance || locationsWithDistance.length === 0) {
      return (
        <Card className="items-center py-12">
          <MapPin size={48} color="#cba86e" />
          <Text className="mt-4 text-lg font-semibold text-foreground">No Locations Found</Text>
          <Text className="mt-2 text-center text-sm text-textSecondary">
            Unable to find service locations near you
          </Text>
        </Card>
      );
    }

    return (
      <View className="space-y-3">
        {locationsWithDistance.map((location) => renderLocationCard(location))}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <View className="px-4 pt-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-2xl font-bold text-foreground">Store Locator</Text>
              <Text className="text-sm text-textSecondary">
                Find service centers near you
              </Text>
            </View>
          </View>

          {/* View Toggle */}
          <View className="flex-row mb-4 bg-surface rounded-lg p-1">
            <TouchableOpacity
              onPress={() => setViewMode('map')}
              className={`flex-1 flex-row items-center justify-center py-2 rounded-md ${
                viewMode === 'map' ? 'bg-gold' : 'bg-transparent'
              }`}
              activeOpacity={0.7}
            >
              <MapIcon
                size={18}
                color={viewMode === 'map' ? '#ffffff' : '#707070'}
              />
              <Text
                className={`ml-2 text-sm font-medium ${
                  viewMode === 'map' ? 'text-white' : 'text-textSecondary'
                }`}
              >
                Map
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setViewMode('list')}
              className={`flex-1 flex-row items-center justify-center py-2 rounded-md ${
                viewMode === 'list' ? 'bg-gold' : 'bg-transparent'
              }`}
              activeOpacity={0.7}
            >
              <List
                size={18}
                color={viewMode === 'list' ? '#ffffff' : '#707070'}
              />
              <Text
                className={`ml-2 text-sm font-medium ${
                  viewMode === 'list' ? 'text-white' : 'text-textSecondary'
                }`}
              >
                List
              </Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {viewMode === 'map' ? renderMapView() : renderListView()}
        </View>
      </ScrollView>
    </View>
  );
};

export default StoreLocatorScreen;
