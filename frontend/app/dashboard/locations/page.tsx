'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import locationService from '@/lib/api/locationService';
import { Location } from '@/lib/api/appointmentService';
import { MapPin, Phone, Clock, Navigation, Calendar, ArrowLeft } from 'lucide-react';
import LocationMap from '@/lib/components/LocationMap';

type LocationWithDistance = Location & { distance?: number };

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [sortedLocations, setSortedLocations] = useState<LocationWithDistance[]>([]);

  useEffect(() => {
    loadLocations();
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation && locations.length > 0) {
      const withDistances: LocationWithDistance[] = locations.map((loc) => {
        if (loc.lat && loc.lng) {
          const distance = locationService.calculateDistance(
            userLocation.lat,
            userLocation.lng,
            loc.lat,
            loc.lng
          );
          return { ...loc, distance };
        }
        return { ...loc };
      });

      // Sort by distance
      withDistances.sort((a, b) => {
        if (a.distance === undefined) return 1;
        if (b.distance === undefined) return -1;
        return a.distance - b.distance;
      });

      setSortedLocations(withDistances);
    } else {
      setSortedLocations(locations.map(loc => ({ ...loc })));
    }
  }, [userLocation, locations]);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await locationService.getLocations();
      setLocations(data);
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
        }
      );
    }
  };

  const getDayOfWeek = (): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-16 h-16 border-4 border-[#CBA86E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D0D0D] py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[#B3B3B3] hover:text-[#CBA86E] transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Service Locations</h1>
            <p className="text-[#B3B3B3]">Find a service center near you</p>
          </div>
        </div>

      {/* Location Permission Notice */}
      {!userLocation && (
        <div className="bg-[#CBA86E]/10 border border-[#CBA86E]/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-[#CBA86E] mt-0.5 shrink-0" />
            <div>
              <p className="text-white font-medium">Enable Location</p>
              <p className="text-gray-400 text-sm mt-1">
                Allow location access to see distances and get sorted results by proximity.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Locations Grid */}
      {sortedLocations.length === 0 ? (
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Locations Found</h3>
          <p className="text-gray-400">Service locations will appear here once available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedLocations.map((location) => (
            <div
              key={location.id}
              className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6 hover:border-[#CBA86E] transition-colors"
            >
              {/* Location Name & Distance */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {location.name}
                  </h3>
                  {location.distance !== undefined && (
                    <p className="text-[#CBA86E] text-sm font-medium">
                      {location.distance} miles away
                    </p>
                  )}
                </div>
                <div className="bg-[#CBA86E]/10 p-2 rounded-lg">
                  <MapPin className="w-5 h-5 text-[#CBA86E]" />
                </div>
              </div>

              {/* Address */}
              {location.address && (
                <div className="mb-4">
                  <p className="text-gray-400 text-sm">{location.address}</p>
                </div>
              )}

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
                {/* Phone */}
                {location.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a
                      href={`tel:${location.phone}`}
                      className="text-sm text-white hover:text-[#CBA86E] transition-colors"
                    >
                      {locationService.formatPhoneNumber(location.phone)}
                    </a>
                  </div>
                )}

                {/* Today's Hours */}
                {location.hours && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-400">
                      {location.hours[getDayOfWeek()] || 'Closed today'}
                    </span>
                  </div>
                )}
              </div>

              {/* Hours Details */}
              {location.hours && (
                <div className="mb-6 p-3 bg-[#0D0D0D] rounded-lg">
                  <p className="text-xs font-medium text-gray-400 mb-2">Hours</p>
                  <div className="space-y-1">
                    {Object.entries(location.hours).map(([day, hours]) => (
                      <div
                        key={day}
                        className={`flex justify-between text-xs ${
                          day === getDayOfWeek()
                            ? 'text-[#CBA86E] font-medium'
                            : 'text-gray-500'
                        }`}
                      >
                        <span className="capitalize">{day}</span>
                        <span>{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                {location.lat && location.lng && (
                  <a
                    href={locationService.getDirectionsUrl(location.lat, location.lng)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0D0D0D] text-white text-sm font-medium rounded-lg hover:bg-[#CBA86E] hover:text-black transition-colors border border-[#2A2A2A]"
                  >
                    <Navigation className="w-4 h-4" />
                    Directions
                  </a>
                )}
                <Link
                  href={`/dashboard/appointments?location=${location.id}`}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#CBA86E] text-black text-sm font-semibold rounded-lg hover:bg-[#B89860] transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map View */}
      {sortedLocations.length > 0 && (
        <div className="bg-[#1A1A1A] rounded-xl border border-[#2A2A2A] p-6 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-[#CBA86E]" />
            <h2 className="text-xl font-semibold text-white">Map View</h2>
          </div>
          <LocationMap 
            locations={sortedLocations}
            userLocation={userLocation}
          />
        </div>
      )}
      </div>
    </div>
  );
}
