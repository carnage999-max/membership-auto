'use client';

import { useEffect, useRef } from 'react';
// @ts-ignore - leaflet types issue with Next.js
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '@/lib/api/appointmentService';

interface LocationMapProps {
  locations: Location[];
  userLocation?: { lat: number; lng: number } | null;
}

// Fix for default marker icons in Leaflet
// @ts-ignore
const defaultIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// @ts-ignore
const userIcon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [32, 50],
  iconAnchor: [16, 50],
  popupAnchor: [1, -42],
  shadowSize: [50, 50],
});

// Custom icon for service centers (using data URL for gold marker)
const createServiceIcon = () => {
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#CBA86E" width="32" height="32">
      <path d="M12 0C7.03 0 3 4.03 3 9c0 5.25 9 15 9 15s9-9.75 9-15c0-4.97-4.03-9-9-9zm0 13.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 4.5 12 4.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5z"/>
    </svg>
  `;
  
  // @ts-ignore
  return L.icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(svgString)}`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export default function LocationMap({ locations, userLocation }: LocationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    if (!map.current) {
      const centerLat = userLocation?.lat ?? locations[0]?.lat ?? 40.7128;
      const centerLng = userLocation?.lng ?? locations[0]?.lng ?? -74.0060;
      const zoomLevel = userLocation ? 12 : 10;

      // @ts-ignore
      map.current = L.map(mapContainer.current).setView([centerLat, centerLng], zoomLevel);

      // Add tile layer
      // @ts-ignore
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add user location marker if available
    if (userLocation && map.current) {
      // @ts-ignore
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
      })
        .bindPopup(
          `<div class="text-sm">
            <p class="font-semibold">Your Location</p>
          </div>`
        )
        .addTo(map.current);
      markersRef.current.push(userMarker);
    }

    // Add location markers
    const serviceIcon = createServiceIcon();
    
    locations.forEach((location) => {
      if (location.lat && location.lng && map.current) {
        const popupContent = `
          <div class="text-sm p-2">
            <p class="font-semibold text-white">${location.name}</p>
            <p class="text-gray-300 text-xs mt-1">${location.address || 'Address not available'}</p>
            ${location.phone ? `<p class="text-gray-400 text-xs mt-1"><strong>Phone:</strong> ${location.phone}</p>` : ''}
          </div>
        `;

        // @ts-ignore
        const marker = L.marker([location.lat, location.lng], {
          icon: serviceIcon,
        })
          .bindPopup(popupContent)
          .addTo(map.current);
        
        markersRef.current.push(marker);
      }
    });

    // Fit bounds if there are markers
    if (markersRef.current.length > 0 && map.current) {
      // @ts-ignore
      const group = new L.FeatureGroup(markersRef.current);
      map.current.fitBounds(group.getBounds().pad(0.1), { maxZoom: 14 });
    }
  }, [locations, userLocation]);

  return (
    <div
      ref={mapContainer}
      className="w-full h-96 rounded-lg border border-[#2A2A2A] overflow-hidden"
      style={{ zIndex: 0 }}
    />
  );
}
