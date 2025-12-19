'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, Camera, Bell, Trash2, Car, Timer, X, Play, Pause, RotateCcw } from 'lucide-react';
import { tokenStorage } from '@/lib/auth/tokenStorage';

interface ParkingSpot {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  level?: string;
  spot?: string;
  notes?: string;
  photo?: string;
  savedAt: string;
  timerDuration?: number; // in minutes
  timerEndTime?: string;
}

export default function ParkingReminderPage() {
  const [savedSpot, setSavedSpot] = useState<ParkingSpot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newSpot, setNewSpot] = useState({
    level: '',
    spot: '',
    notes: '',
    photo: '',
    timerDuration: 60,
  });

  useEffect(() => {
    fetchActiveSpot();
  }, []);

  const fetchActiveSpot = async () => {
    try {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/parking/active/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const spot: ParkingSpot = {
          id: data.id,
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
          address: data.address,
          level: data.location_name,
          spot: '',
          notes: data.notes,
          photo: data.photos?.[0] || '',
          savedAt: data.parked_at,
          timerDuration: data.timer_expires_at ? Math.floor((new Date(data.timer_expires_at).getTime() - new Date(data.parked_at).getTime()) / 60000) : undefined,
          timerEndTime: data.timer_expires_at,
        };
        setSavedSpot(spot);
        
        // Check if there's an active timer
        if (spot.timerEndTime) {
          const endTime = new Date(spot.timerEndTime).getTime();
          const now = Date.now();
          if (endTime > now) {
            setTimerRunning(true);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching active parking spot:', error);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerRunning && savedSpot?.timerEndTime) {
      interval = setInterval(() => {
        const endTime = new Date(savedSpot.timerEndTime!).getTime();
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        
        setTimeRemaining(remaining);
        
        if (remaining <= 0) {
          setTimerRunning(false);
          // Show notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Parking Meter Expiring!', {
              body: 'Your parking meter is about to expire. Move your vehicle soon!',
              icon: '/images/logo.jpeg'
            });
          }
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [timerRunning, savedSpot]);

  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });
  };

  const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || 'Unknown location';
    } catch {
      return 'Unable to get address';
    }
  };

  const handleSaveSpot = async () => {
    setIsLoading(true);
    setLocationError(null);

    try {
      const position = await getCurrentLocation();
      const { latitude, longitude } = position.coords;
      const address = await getAddressFromCoords(latitude, longitude);

      // Calculate timer end time if duration is set
      let timerEndTime: string | undefined;
      if (newSpot.timerDuration > 0) {
        timerEndTime = new Date(Date.now() + newSpot.timerDuration * 60 * 1000).toISOString();
      }

      const token = tokenStorage.getAccessToken();
      const payload = {
        latitude: latitude.toString(),
        longitude: longitude.toString(),
        address,
        location_name: newSpot.level,
        notes: newSpot.notes,
        photos: newSpot.photo ? [newSpot.photo] : [],
        timer_expires_at: timerEndTime,
        active: true,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/parking/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const spot: ParkingSpot = {
          id: data.id,
          latitude,
          longitude,
          address,
          level: newSpot.level,
          spot: newSpot.spot,
          notes: newSpot.notes,
          photo: newSpot.photo,
          savedAt: data.parked_at,
          timerDuration: newSpot.timerDuration,
          timerEndTime,
        };

        setSavedSpot(spot);
        
        if (timerEndTime) {
          setTimerRunning(true);
          // Request notification permission
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
          }
        }

        setShowSaveModal(false);
        setNewSpot({ level: '', spot: '', notes: '', photo: '', timerDuration: 60 });
      } else {
        throw new Error('Failed to save parking spot');
      }
    } catch (error: any) {
      setLocationError(error.message || 'Failed to get location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToSpot = () => {
    if (!savedSpot) return;
    
    const { latitude, longitude } = savedSpot;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
    window.open(url, '_blank');
  };

  const handleClearSpot = async () => {
    try {
      const token = tokenStorage.getAccessToken();
      await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/parking/clear/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      setSavedSpot(null);
      setTimerRunning(false);
      setTimeRemaining(null);
    } catch (error) {
      console.error('Error clearing parking spot:', error);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewSpot({ ...newSpot, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const formatTimeRemaining = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetTimer = () => {
    if (savedSpot && savedSpot.timerDuration) {
      const newEndTime = new Date(Date.now() + savedSpot.timerDuration * 60 * 1000).toISOString();
      const updatedSpot = { ...savedSpot, timerEndTime: newEndTime };
      setSavedSpot(updatedSpot);
      localStorage.setItem('parkingSpot', JSON.stringify(updatedSpot));
      setTimerRunning(true);
    }
  };

  const handlePauseTimer = () => {
    setTimerRunning(!timerRunning);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--gold)] mb-2">Parking Reminder</h1>
          <p className="text-[var(--text-secondary)]">
            Save your parking spot and never forget where you parked
          </p>
        </div>

        {/* Current Parking Spot */}
        {savedSpot ? (
          <div className="space-y-6">
            {/* Main Card */}
            <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] overflow-hidden">
              {/* Map Placeholder / Photo */}
              <div className="h-48 bg-[var(--background)] relative flex items-center justify-center">
                {savedSpot.photo ? (
                  <img 
                    src={savedSpot.photo} 
                    alt="Parking spot" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-[var(--gold)] mx-auto mb-2" />
                    <p className="text-[var(--text-muted)]">Your car is parked here</p>
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-[var(--surface)] px-3 py-1 rounded-full text-sm font-medium text-[var(--gold)]">
                  <Car className="w-4 h-4 inline mr-1" />
                  Parked
                </div>
              </div>

              {/* Location Details */}
              <div className="p-6">
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Saved Location</h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[var(--gold)] mt-0.5 flex-shrink-0" />
                    <p className="text-[var(--text-secondary)]">{savedSpot.address}</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[var(--gold)]" />
                    <p className="text-[var(--text-secondary)]">
                      Parked at {new Date(savedSpot.savedAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {(savedSpot.level || savedSpot.spot) && (
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-[var(--gold)]" />
                      <p className="text-[var(--text-secondary)]">
                        {savedSpot.level && `Level ${savedSpot.level}`}
                        {savedSpot.level && savedSpot.spot && ' • '}
                        {savedSpot.spot && `Spot ${savedSpot.spot}`}
                      </p>
                    </div>
                  )}

                  {savedSpot.notes && (
                    <div className="p-3 bg-[var(--background)] rounded-lg">
                      <p className="text-sm text-[var(--text-muted)]">Notes:</p>
                      <p className="text-[var(--text-secondary)]">{savedSpot.notes}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleNavigateToSpot}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--gold)] text-[#0d0d0d] rounded-lg hover:bg-[#d8b87f] transition-colors font-semibold"
                  >
                    <Navigation className="w-5 h-5" />
                    Navigate to Car
                  </button>
                  <button
                    onClick={handleClearSpot}
                    className="p-3 border border-red-500 text-red-400 rounded-lg hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Timer Card */}
            {savedSpot.timerDuration && (
              <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                    <Timer className="w-6 h-6 text-[var(--gold)]" />
                    Parking Meter Timer
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePauseTimer}
                      className="p-2 bg-[var(--background)] rounded-lg hover:bg-[var(--border-color)] transition-colors"
                    >
                      {timerRunning ? (
                        <Pause className="w-5 h-5 text-[var(--gold)]" />
                      ) : (
                        <Play className="w-5 h-5 text-[var(--gold)]" />
                      )}
                    </button>
                    <button
                      onClick={handleResetTimer}
                      className="p-2 bg-[var(--background)] rounded-lg hover:bg-[var(--border-color)] transition-colors"
                    >
                      <RotateCcw className="w-5 h-5 text-[var(--gold)]" />
                    </button>
                  </div>
                </div>

                <div className="text-center py-6">
                  {timeRemaining !== null && timeRemaining > 0 ? (
                    <>
                      <p className={`text-5xl font-bold font-mono ${
                        timeRemaining < 300 ? 'text-red-400' : 
                        timeRemaining < 600 ? 'text-yellow-400' : 
                        'text-[var(--gold)]'
                      }`}>
                        {formatTimeRemaining(timeRemaining)}
                      </p>
                      <p className="text-[var(--text-muted)] mt-2">
                        {timeRemaining < 300 ? 'Time almost up!' : 'Time remaining'}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-5xl font-bold font-mono text-red-400">
                        EXPIRED
                      </p>
                      <p className="text-red-400 mt-2">
                        Your parking meter has expired!
                      </p>
                    </>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      timeRemaining && timeRemaining < 300 ? 'bg-red-500' :
                      timeRemaining && timeRemaining < 600 ? 'bg-yellow-500' :
                      'bg-[var(--gold)]'
                    }`}
                    style={{
                      width: `${timeRemaining && savedSpot.timerDuration 
                        ? (timeRemaining / (savedSpot.timerDuration * 60)) * 100 
                        : 0}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          /* No Saved Spot */
          <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-12 text-center">
            <div className="w-24 h-24 bg-[var(--gold)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Car className="w-12 h-12 text-[var(--gold)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-3">
              No Parking Spot Saved
            </h2>
            <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              Save your parking spot when you park so you can easily find your car later
            </p>
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 px-8 py-4 bg-[var(--gold)] text-[#0d0d0d] rounded-lg hover:bg-[#d8b87f] transition-colors font-semibold mx-auto"
            >
              <MapPin className="w-5 h-5" />
              Save Parking Spot
            </button>
          </div>
        )}

        {/* Quick Save Button - Always visible when spot is saved */}
        {savedSpot && (
          <div className="mt-6">
            <button
              onClick={() => setShowSaveModal(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[var(--surface)] border border-[var(--border-color)] text-[var(--foreground)] rounded-lg hover:border-[var(--gold)] transition-colors"
            >
              <MapPin className="w-5 h-5 text-[var(--gold)]" />
              Save New Parking Spot
            </button>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-8 bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-6">
          <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">
            <Bell className="w-5 h-5 inline mr-2 text-[var(--gold)]" />
            Tips
          </h3>
          <ul className="space-y-2 text-[var(--text-secondary)] text-sm">
            <li>• Take a photo of nearby landmarks to help locate your car</li>
            <li>• Note the parking level and spot number for garages</li>
            <li>• Set a timer if using a parking meter</li>
            <li>• Enable notifications to get alerts when your meter is expiring</li>
          </ul>
        </div>
      </div>

      {/* Save Spot Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Save Parking Spot</h2>
              <button
                onClick={() => setShowSaveModal(false)}
                className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {locationError && (
                <div className="p-3 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm">
                  {locationError}
                </div>
              )}

              {/* Photo Capture */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Photo (Optional)
                </label>
                <div className="flex gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoCapture}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  {newSpot.photo ? (
                    <div className="relative w-full h-32 rounded-lg overflow-hidden">
                      <img src={newSpot.photo} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => setNewSpot({ ...newSpot, photo: '' })}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-[var(--border-color)] rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[var(--gold)] transition-colors"
                    >
                      <Camera className="w-8 h-8 text-[var(--gold)]" />
                      <span className="text-sm text-[var(--text-secondary)]">Take Photo</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Level & Spot */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Level/Floor
                  </label>
                  <input
                    type="text"
                    value={newSpot.level}
                    onChange={(e) => setNewSpot({ ...newSpot, level: e.target.value })}
                    placeholder="e.g., P2"
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Spot Number
                  </label>
                  <input
                    type="text"
                    value={newSpot.spot}
                    onChange={(e) => setNewSpot({ ...newSpot, spot: e.target.value })}
                    placeholder="e.g., 42"
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newSpot.notes}
                  onChange={(e) => setNewSpot({ ...newSpot, notes: e.target.value })}
                  placeholder="e.g., Near the elevator, blue pillar"
                  rows={2}
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none resize-none"
                />
              </div>

              {/* Timer */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  <Timer className="w-4 h-4 inline mr-1" />
                  Parking Meter Timer (minutes)
                </label>
                <select
                  value={newSpot.timerDuration}
                  onChange={(e) => setNewSpot({ ...newSpot, timerDuration: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
                >
                  <option value={0}>No timer</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                  <option value={180}>3 hours</option>
                  <option value={240}>4 hours</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-3 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:border-[var(--gold)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSpot}
                  disabled={isLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--gold)] text-[#0d0d0d] rounded-lg hover:bg-[#d8b87f] transition-colors font-semibold disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-[#0d0d0d] border-t-transparent rounded-full animate-spin" />
                      Getting Location...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      Save Spot
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
