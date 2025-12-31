import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fuelService } from '@/services/api/fuel.service';
import { vehicleService } from '@/services/api/vehicle.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/utils/toast';
import {
  Gauge,
  Plus,
  Fuel,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Car,
} from 'lucide-react-native';
import {
  ScrollView,
  Text,
  View,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MileageScreen = () => {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');

  // Form state
  const [odometer, setOdometer] = useState('');
  const [gallons, setGallons] = useState('');
  const [pricePerGallon, setPricePerGallon] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch vehicles
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleService.getVehicles,
  });

  // Fetch fuel logs for selected vehicle
  const { data: fuelLogs, isLoading: logsLoading } = useQuery({
    queryKey: ['fuelLogs', selectedVehicle],
    queryFn: () => fuelService.getFuelLogs(selectedVehicle),
    enabled: !!selectedVehicle,
  });

  // Fetch fuel stats for selected vehicle
  const { data: fuelStats, isLoading: statsLoading } = useQuery({
    queryKey: ['fuelStats', selectedVehicle],
    queryFn: () => fuelService.getFuelStats(selectedVehicle),
    enabled: !!selectedVehicle,
  });

  // Add fuel log mutation
  const addFuelLogMutation = useMutation({
    mutationFn: fuelService.addFuelLog,
    onSuccess: () => {
      showToast('success', 'Fill-up added successfully');
      queryClient.invalidateQueries({ queryKey: ['fuelLogs'] });
      queryClient.invalidateQueries({ queryKey: ['fuelStats'] });
      setShowAddModal(false);
      resetForm();
    },
    onError: () => {
      showToast('error', 'Failed to add fill-up');
    },
  });

  const resetForm = () => {
    setOdometer('');
    setGallons('');
    setPricePerGallon('');
    setLocation('');
    setNotes('');
  };

  const handleAddFillUp = () => {
    if (!selectedVehicle) {
      showToast('error', 'Please select a vehicle');
      return;
    }

    if (!odometer || !gallons || !pricePerGallon) {
      showToast('error', 'Please fill in all required fields');
      return;
    }

    const totalCost = parseFloat(gallons) * parseFloat(pricePerGallon);

    addFuelLogMutation.mutate({
      vehicle_id: selectedVehicle,
      odometer: parseInt(odometer),
      gallons: parseFloat(gallons),
      price_per_gallon: parseFloat(pricePerGallon),
      total_cost: totalCost,
      location,
      notes,
    });
  };

  // Set first vehicle as default
  React.useEffect(() => {
    if (vehicles && vehicles.length > 0 && !selectedVehicle) {
      setSelectedVehicle(vehicles[0].id);
    }
  }, [vehicles, selectedVehicle]);

  const renderStatsCard = () => {
    if (statsLoading) {
      return (
        <Card className="mb-4">
          <ActivityIndicator color="#cba86e" />
        </Card>
      );
    }

    if (!fuelStats) {
      return null;
    }

    return (
      <Card className="mb-4" variant="elevated">
        <Text className="text-lg font-semibold text-foreground mb-4">Fuel Statistics</Text>

        <View className="space-y-3">
          {/* Average MPG */}
          <View className="flex-row justify-between items-center py-3 border-b border-border">
            <View className="flex-row items-center">
              <Gauge size={20} color="#cba86e" />
              <Text className="ml-2 text-sm text-textSecondary">Avg MPG (30 days)</Text>
            </View>
            <Text className="text-lg font-bold text-gold">
              {fuelStats.avgMpg30Days.toFixed(1)}
            </Text>
          </View>

          {/* Cost per Mile */}
          <View className="flex-row justify-between items-center py-3 border-b border-border">
            <View className="flex-row items-center">
              <DollarSign size={20} color="#cba86e" />
              <Text className="ml-2 text-sm text-textSecondary">Cost per Mile</Text>
            </View>
            <Text className="text-lg font-bold text-foreground">
              ${fuelStats.costPerMile.toFixed(2)}
            </Text>
          </View>

          {/* Total Spent */}
          <View className="flex-row justify-between items-center py-3 border-b border-border">
            <View className="flex-row items-center">
              <Fuel size={20} color="#cba86e" />
              <Text className="ml-2 text-sm text-textSecondary">Total Spent (30 days)</Text>
            </View>
            <Text className="text-lg font-bold text-foreground">
              ${fuelStats.totalSpent30Days.toFixed(2)}
            </Text>
          </View>

          {/* Trend */}
          <View className="flex-row justify-between items-center py-3">
            <View className="flex-row items-center">
              {fuelStats.trend === 'improving' ? (
                <TrendingUp size={20} color="#22c55e" />
              ) : fuelStats.trend === 'declining' ? (
                <TrendingDown size={20} color="#ef4444" />
              ) : (
                <TrendingUp size={20} color="#cba86e" />
              )}
              <Text className="ml-2 text-sm text-textSecondary">Trend</Text>
            </View>
            <Text
              className={`text-sm font-semibold capitalize ${
                fuelStats.trend === 'improving'
                  ? 'text-success'
                  : fuelStats.trend === 'declining'
                  ? 'text-error'
                  : 'text-textSecondary'
              }`}
            >
              {fuelStats.trend}
            </Text>
          </View>
        </View>
      </Card>
    );
  };

  const renderFuelLogs = () => {
    if (logsLoading) {
      return (
        <Card className="items-center py-8">
          <ActivityIndicator color="#cba86e" />
        </Card>
      );
    }

    if (!fuelLogs || fuelLogs.length === 0) {
      return (
        <Card className="items-center py-12">
          <Fuel size={48} color="#cba86e" />
          <Text className="mt-4 text-lg font-semibold text-foreground">No Fill-Ups Yet</Text>
          <Text className="mt-2 text-center text-sm text-textSecondary px-8">
            Start tracking your fuel economy by adding your first fill-up
          </Text>
        </Card>
      );
    }

    return (
      <View className="space-y-3">
        {fuelLogs.map((log) => (
          <Card key={log.id} className="p-4">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="text-base font-semibold text-foreground">
                  {log.gallons.toFixed(2)} gallons
                </Text>
                <Text className="text-xs text-textMuted">
                  {new Date(log.timestamp).toLocaleDateString()}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-lg font-bold text-gold">${log.totalCost.toFixed(2)}</Text>
                {log.mpg && (
                  <Text className="text-xs text-textSecondary">{log.mpg.toFixed(1)} MPG</Text>
                )}
              </View>
            </View>

            <View className="flex-row justify-between mt-2 pt-2 border-t border-border">
              <View className="flex-row items-center">
                <Gauge size={14} color="#707070" />
                <Text className="ml-1 text-xs text-textSecondary">
                  {log.odometer.toLocaleString()} mi
                </Text>
              </View>
              <Text className="text-xs text-textSecondary">
                ${log.pricePerGallon.toFixed(2)}/gal
              </Text>
            </View>

            {log.location && (
              <Text className="text-xs text-textMuted mt-1">{log.location}</Text>
            )}
          </Card>
        ))}
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
              <Text className="text-2xl font-bold text-foreground">Mileage Tracker</Text>
              <Text className="text-sm text-textSecondary">Track fuel economy and expenses</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              className="flex-row items-center justify-center rounded-xl bg-gold px-4 py-3"
              activeOpacity={0.7}
            >
              <Plus size={18} color="#0d0d0d" />
              <Text className="ml-1 text-sm font-semibold text-background">Add Fill-Up</Text>
            </TouchableOpacity>
          </View>

          {/* Vehicle Selector */}
          {vehiclesLoading ? (
            <Card className="mb-4">
              <ActivityIndicator color="#cba86e" />
            </Card>
          ) : vehicles && vehicles.length > 0 ? (
            <Card className="mb-4">
              <Text className="text-sm font-medium text-textSecondary mb-2">Select Vehicle</Text>
              <View className="flex-row flex-wrap gap-2">
                {vehicles.map((vehicle) => (
                  <TouchableOpacity
                    key={vehicle.id}
                    onPress={() => setSelectedVehicle(vehicle.id)}
                    className={`flex-row items-center px-3 py-2 rounded-lg border ${
                      selectedVehicle === vehicle.id
                        ? 'bg-gold/20 border-gold'
                        : 'bg-surface border-border'
                    }`}
                    activeOpacity={0.7}
                  >
                    <Car size={16} color={selectedVehicle === vehicle.id ? '#cba86e' : '#707070'} />
                    <Text
                      className={`ml-2 text-sm font-medium ${
                        selectedVehicle === vehicle.id ? 'text-gold' : 'text-foreground'
                      }`}
                    >
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          ) : (
            <Card className="mb-4 items-center py-6">
              <Text className="text-sm text-textSecondary">No vehicles added yet</Text>
            </Card>
          )}

          {/* Statistics */}
          {selectedVehicle && renderStatsCard()}

          {/* Fuel Logs List */}
          {selectedVehicle && (
            <>
              <Text className="text-lg font-semibold text-foreground mb-3">Recent Fill-Ups</Text>
              {renderFuelLogs()}
            </>
          )}
        </View>
      </ScrollView>

      {/* Add Fill-Up Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 bg-background">
          <View className="px-4 pt-4" style={{ paddingTop: insets.top + 16 }}>
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-bold text-foreground">Add Fill-Up</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)} activeOpacity={0.7}>
                <Text className="text-base text-gold">Cancel</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="mb-6">
                {/* Odometer */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Odometer Reading *
                  </Text>
                  <TextInput
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholder="Enter odometer reading"
                    placeholderTextColor="#707070"
                    keyboardType="numeric"
                    value={odometer}
                    onChangeText={setOdometer}
                  />
                </View>

                {/* Gallons */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">Gallons *</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholder="Enter gallons filled"
                    placeholderTextColor="#707070"
                    keyboardType="decimal-pad"
                    value={gallons}
                    onChangeText={setGallons}
                  />
                </View>

                {/* Price per Gallon */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Price per Gallon *
                  </Text>
                  <TextInput
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholder="Enter price per gallon"
                    placeholderTextColor="#707070"
                    keyboardType="decimal-pad"
                    value={pricePerGallon}
                    onChangeText={setPricePerGallon}
                  />
                </View>

                {/* Total Cost (Calculated) */}
                {gallons && pricePerGallon && (
                  <Card className="bg-gold/10 border-gold mb-4">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm font-medium text-foreground">Total Cost</Text>
                      <Text className="text-xl font-bold text-gold">
                        ${(parseFloat(gallons) * parseFloat(pricePerGallon)).toFixed(2)}
                      </Text>
                    </View>
                  </Card>
                )}

                {/* Location */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Location (Optional)
                  </Text>
                  <TextInput
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholder="e.g., Shell Station, Main St"
                    placeholderTextColor="#707070"
                    value={location}
                    onChangeText={setLocation}
                  />
                </View>

                {/* Notes */}
                <View className="mb-4">
                  <Text className="text-sm font-medium text-foreground mb-2">Notes (Optional)</Text>
                  <TextInput
                    className="bg-surface border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholder="Add any notes"
                    placeholderTextColor="#707070"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={notes}
                    onChangeText={setNotes}
                  />
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={handleAddFillUp}
                  disabled={addFuelLogMutation.isPending}
                  className="mt-4 flex-row items-center justify-center rounded-xl bg-gold py-4"
                  activeOpacity={0.7}
                >
                  {addFuelLogMutation.isPending ? (
                    <ActivityIndicator size="small" color="#0d0d0d" />
                  ) : (
                    <Text className="text-base font-semibold text-background">Add Fill-Up</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MileageScreen;
