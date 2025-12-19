'use client';

import { useState, useEffect } from 'react';
import { MapPin, Plus, Search, Edit, Trash2, Clock, X } from 'lucide-react';
import { State, City } from 'country-state-city';
import { useToast } from '@/components/ToastProvider';
import ConfirmModal from '@/components/ConfirmModal';

interface Location {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone: string;
  email?: string;
  capacity?: number;
  current_appointments?: number;
  hours: any;
  operating_hours?: any;
  is_active?: boolean;
  status?: string;
  created_at?: string;
}

export default function LocationsPage() {
  const { showSuccess, showError, showWarning } = useToast();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showHoursModal, setShowHoursModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [editingHoursLocation, setEditingHoursLocation] = useState<Location | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    phone: '',
    email: '',
    capacity: '',
    is_active: true,
  });
  const [hoursData, setHoursData] = useState<{[key: string]: {open: string, close: string, closed: boolean}}>({
    monday: { open: '08:00', close: '18:00', closed: false },
    tuesday: { open: '08:00', close: '18:00', closed: false },
    wednesday: { open: '08:00', close: '18:00', closed: false },
    thursday: { open: '08:00', close: '18:00', closed: false },
    friday: { open: '08:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '16:00', closed: false },
    sunday: { open: '10:00', close: '14:00', closed: true },
  });
  const [selectedStateCode, setSelectedStateCode] = useState('');
  
  // Get US states
  const usStates = State.getStatesOfCountry('US');
  
  // Get cities for selected state
  const cities = selectedStateCode 
    ? City.getCitiesOfState('US', selectedStateCode)
    : [];

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/locations/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const locationsData = data.locations || data.results || data;
        setLocations(Array.isArray(locationsData) ? locationsData : []);
      } else {
        showError('Failed to load locations. Please refresh the page.');
        setLocations([]);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
      showError('Network error. Please check your connection and try again.');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = Array.isArray(locations) ? locations.filter(location =>
    location.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const openCreateModal = () => {
    setEditingLocation(null);
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      phone: '',
      email: '',
      capacity: '',
      is_active: true,
    });
    setSelectedStateCode('');
    setShowModal(true);
  };

  const openEditModal = (location: Location) => {
    setEditingLocation(location);
    
    // Parse address back into components if it's a combined address
    let addressParts = { address: '', city: '', state: '', zip_code: '' };
    if (location.address && !location.city) {
      // Address is combined, try to parse it
      const parts = location.address.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        addressParts.address = parts[0] || '';
        addressParts.city = parts[1] || '';
        const stateZip = parts[2].split(' ');
        addressParts.state = stateZip[0] || '';
        addressParts.zip_code = stateZip[1] || '';
      } else {
        addressParts.address = location.address;
      }
    } else {
      addressParts = {
        address: location.address || '',
        city: location.city || '',
        state: location.state || '',
        zip_code: location.zip_code || '',
      };
    }
    
    setFormData({
      name: location.name,
      address: addressParts.address,
      city: addressParts.city,
      state: addressParts.state,
      zip_code: addressParts.zip_code,
      phone: location.phone || '',
      email: location.email || '',
      capacity: location.capacity?.toString() || '10',
      is_active: location.is_active ?? true,
    });
    
    // Find state code from state name
    const stateObj = usStates.find(s => s.name === addressParts.state || s.isoCode === addressParts.state);
    setSelectedStateCode(stateObj?.isoCode || '');
    setShowModal(true);
  };

  const handleStateChange = (stateCode: string) => {
    setSelectedStateCode(stateCode);
    const state = usStates.find(s => s.isoCode === stateCode);
    setFormData({ 
      ...formData, 
      state: state?.name || '',
      city: '' // Reset city when state changes
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingLocation
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/locations/${editingLocation.id}/`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/locations/`;
      
      // Create hours object with default values
      const hours = {
        monday: "8:00 AM - 6:00 PM",
        tuesday: "8:00 AM - 6:00 PM",
        wednesday: "8:00 AM - 6:00 PM",
        thursday: "8:00 AM - 6:00 PM",
        friday: "8:00 AM - 6:00 PM",
        saturday: "9:00 AM - 4:00 PM",
        sunday: "Closed"
      };
      
      const response = await fetch(url, {
        method: editingLocation ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code,
          phone: formData.phone,
          hours: hours,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        loadLocations();
        showSuccess(editingLocation ? 'Location updated successfully!' : 'Location created successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(errorData.error || 'Failed to save location. Please try again.');
      }
    } catch (error) {
      console.error('Error saving location:', error);
      showError('Network error. Please check your connection and try again.');
    }
  };

  const openDeleteConfirmation = (locationId: string) => {
    const location = locations.find(loc => loc.id === locationId);
    setLocationToDelete(location || null);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    if (!locationToDelete) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/locations/${locationToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok || response.status === 204) {
        loadLocations();
        showSuccess('Location deleted successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(errorData.error || 'Failed to delete location. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting location:', error);
      showError('Network error. Please check your connection and try again.');
    }
  };

  const openHoursModal = (location: Location) => {
    setEditingHoursLocation(location);
    
    // Parse existing hours if available
    if (location.hours && typeof location.hours === 'object') {
      const parsedHours: {[key: string]: {open: string, close: string, closed: boolean}} = {};
      
      Object.entries(location.hours).forEach(([day, timeStr]) => {
        const dayLower = day.toLowerCase();
        if (typeof timeStr === 'string') {
          if (timeStr.toLowerCase() === 'closed') {
            parsedHours[dayLower] = { open: '09:00', close: '17:00', closed: true };
          } else {
            // Parse "8:00 AM - 6:00 PM" format
            const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?\s*-\s*(\d+):(\d+)\s*(AM|PM)?/i);
            if (match) {
              const openHour = parseInt(match[1]);
              const openMin = match[2];
              const openPeriod = match[3];
              const closeHour = parseInt(match[4]);
              const closeMin = match[5];
              const closePeriod = match[6];
              
              let open24 = openHour;
              let close24 = closeHour;
              
              if (openPeriod && openPeriod.toUpperCase() === 'PM' && openHour !== 12) open24 += 12;
              if (openPeriod && openPeriod.toUpperCase() === 'AM' && openHour === 12) open24 = 0;
              if (closePeriod && closePeriod.toUpperCase() === 'PM' && closeHour !== 12) close24 += 12;
              if (closePeriod && closePeriod.toUpperCase() === 'AM' && closeHour === 12) close24 = 0;
              
              parsedHours[dayLower] = {
                open: `${open24.toString().padStart(2, '0')}:${openMin}`,
                close: `${close24.toString().padStart(2, '0')}:${closeMin}`,
                closed: false
              };
            } else {
              parsedHours[dayLower] = { open: '08:00', close: '18:00', closed: false };
            }
          }
        }
      });
      
      setHoursData(parsedHours);
    }
    
    setShowHoursModal(true);
  };

  const handleSaveHours = async () => {
    if (!editingHoursLocation) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      
      // Convert hoursData to backend format
      const hours: {[key: string]: string} = {};
      Object.entries(hoursData).forEach(([day, time]) => {
        if (time.closed) {
          hours[day] = 'Closed';
        } else {
          // Convert 24h to 12h format
          const openHour = parseInt(time.open.split(':')[0]);
          const openMin = time.open.split(':')[1];
          const closeHour = parseInt(time.close.split(':')[0]);
          const closeMin = time.close.split(':')[1];
          
          const openPeriod = openHour >= 12 ? 'PM' : 'AM';
          const closePeriod = closeHour >= 12 ? 'PM' : 'AM';
          const open12 = openHour > 12 ? openHour - 12 : (openHour === 0 ? 12 : openHour);
          const close12 = closeHour > 12 ? closeHour - 12 : (closeHour === 0 ? 12 : closeHour);
          
          hours[day] = `${open12}:${openMin} ${openPeriod} - ${close12}:${closeMin} ${closePeriod}`;
        }
      });
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/locations/${editingHoursLocation.id}/`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ hours }),
        }
      );

      if (response.ok) {
        setShowHoursModal(false);
        loadLocations();
        showSuccess('Operating hours updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(errorData.error || 'Failed to save hours. Please try again.');
      }
    } catch (error) {
      console.error('Error saving hours:', error);
      showError('Network error. Please check your connection and try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Service Locations</h1>
          <p className="text-text-secondary">Manage service center locations and availability</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-background rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Location
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search by name, city, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      {/* Locations List */}
      {filteredLocations.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <MapPin className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? 'No locations found' : 'No locations yet'}
          </h3>
          <p className="text-text-secondary mb-6">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : 'Add your first service location to get started.'}
          </p>
          {!searchTerm && (
            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 px-6 py-3 bg-gold text-background rounded-lg hover:bg-opacity-90 transition-colors mx-auto"
            >
              <Plus className="w-4 h-4" />
              Add First Location
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredLocations.map((location) => (
            <div key={location.id} className="bg-surface border border-border rounded-lg p-6 hover:border-gold transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="w-12 h-12 bg-gold bg-opacity-10 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-6 h-6 text-gold" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {location.name}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {location.address}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border shrink-0 ${
                  (location.is_active ?? location.status === 'active')
                    ? 'border-success text-success' 
                    : 'border-error text-error'
                }`}>
                  {(location.is_active ?? location.status === 'active') ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Phone:</span>
                  <span className="text-foreground">{location.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Email:</span>
                  <span className="text-foreground">{location.email || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Capacity:</span>
                  <span className="text-foreground">
                    {location.current_appointments || 0} / {location.capacity || 0}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <button 
                  onClick={() => openEditModal(location)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-background rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  <Edit className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-foreground">Edit</span>
                </button>
                <button 
                  onClick={() => openHoursModal(location)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-background rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  <Clock className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-foreground">Hours</span>
                </button>
                <button 
                  onClick={() => openDeleteConfirmation(location.id)}
                  className="px-3 py-2 border border-error rounded-lg hover:bg-error transition-colors group"
                >
                  <Trash2 className="w-4 h-4 text-error group-hover:text-background transition-colors" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface">
              <h2 className="text-xl font-bold text-foreground">
                {editingLocation ? 'Edit Location' : 'Add New Location'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="e.g., Downtown Service Center"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="e.g., 123 Main Street"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    State *
                  </label>
                  <select
                    required
                    value={selectedStateCode}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    <option value="">Select a state</option>
                    {usStates.map((state) => (
                      <option key={state.isoCode} value={state.isoCode}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    City *
                  </label>
                  <select
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      !selectedStateCode 
                        ? 'bg-surface text-text-muted border-border cursor-not-allowed' 
                        : 'bg-background text-foreground border-border focus:ring-gold'
                    }`}
                    disabled={!selectedStateCode}
                  >
                    <option value="">{!selectedStateCode ? 'Select a state first' : 'Select a city'}</option>
                    {cities.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  {!selectedStateCode && (
                    <p className="text-xs text-text-muted mt-1">Please select a state to enable city selection</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="e.g., 10001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="e.g., 10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="e.g., (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="e.g., location@example.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-gold bg-background border-border rounded focus:ring-gold"
                    />
                    <span className="text-sm font-medium text-foreground">Active</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-background border border-border rounded-lg text-foreground hover:bg-opacity-80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gold text-background rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  {editingLocation ? 'Save Changes' : 'Create Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hours Modal */}
      {showHoursModal && editingHoursLocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface">
              <div>
                <h2 className="text-xl font-bold text-foreground">Operating Hours</h2>
                <p className="text-sm text-text-secondary mt-1">{editingHoursLocation.name}</p>
              </div>
              <button
                onClick={() => setShowHoursModal(false)}
                className="text-text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Hours Form */}
            <div className="p-6 space-y-4">
              {Object.entries(hoursData).map(([day, times]) => (
                <div key={day} className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-foreground capitalize">
                      {day}
                    </label>
                  </div>
                  
                  {!times.closed ? (
                    <>
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={times.open}
                          onChange={(e) => setHoursData({
                            ...hoursData,
                            [day]: { ...times, open: e.target.value }
                          })}
                          className="px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                        <span className="text-text-muted">to</span>
                        <input
                          type="time"
                          value={times.close}
                          onChange={(e) => setHoursData({
                            ...hoursData,
                            [day]: { ...times, close: e.target.value }
                          })}
                          className="px-3 py-2 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                      </div>
                      <button
                        onClick={() => setHoursData({
                          ...hoursData,
                          [day]: { ...times, closed: true }
                        })}
                        className="px-3 py-2 text-sm text-text-secondary hover:text-error transition-colors"
                      >
                        Closed
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-4">
                      <span className="text-text-muted">Closed</span>
                      <button
                        onClick={() => setHoursData({
                          ...hoursData,
                          [day]: { ...times, closed: false }
                        })}
                        className="px-3 py-2 text-sm text-gold hover:text-opacity-80 transition-colors"
                      >
                        Set Hours
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button
                type="button"
                onClick={() => setShowHoursModal(false)}
                className="px-4 py-2 bg-background border border-border rounded-lg text-foreground hover:bg-opacity-80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveHours}
                className="px-4 py-2 bg-gold text-background rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Save Hours
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title="Delete Location"
        message={`Are you sure you want to delete "${locationToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
