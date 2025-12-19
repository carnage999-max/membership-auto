'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Wrench, CheckCircle, AlertTriangle, Info, MapPin, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { tokenStorage } from '@/lib/auth/tokenStorage';

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  description: string;
  estimatedDuration: string;
  includedJobs: string[];
  dueBy: 'mileage' | 'time' | 'both';
  mileageTrigger?: number;
  timeTrigger?: string;
  currentMileage?: number;
  status: 'upcoming' | 'due-soon' | 'overdue' | 'completed';
  priority: 'high' | 'medium' | 'low';
  lastCompleted?: string;
}

export default function ServiceSchedulePage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [bookingForm, setBookingForm] = useState({
    locationId: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    // Check if token exists
    const token = tokenStorage.getAccessToken();
    if (!token) {
      console.error('No authentication token found');
      setAuthError(true);
      setLoading(false);
      return;
    }
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      fetchServiceSchedule();
    }
  }, [selectedVehicle, filterStatus]);

  const fetchVehicles = async () => {
    try {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vehicles/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVehicles(data);
        if (data.length > 0) {
          setSelectedVehicle(data[0].id.toString());
        } else {
          // No vehicles, stop loading
          setLoading(false);
        }
      } else if (response.status === 401) {
        console.error('Authentication failed - redirecting to login');
        setAuthError(true);
        setLoading(false);
        // Clear invalid token
        tokenStorage.clearAuth();
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        console.error('Failed to fetch vehicles:', response.status);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setLoading(false);
    }
  };

  const fetchServiceSchedule = async () => {
    setLoading(true);
    try {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/services/schedules/?vehicle_id=${selectedVehicle}${filterStatus !== 'all' ? `&status=${filterStatus}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Transform backend data to frontend format
        const transformedServices: ServiceItem[] = data.map((schedule: any) => ({
          id: schedule.id,
          name: schedule.service_type.name,
          category: schedule.service_type.priority === 'high' ? 'Safety' : 'Routine Maintenance',
          description: schedule.service_type.description,
          estimatedDuration: schedule.service_type.estimated_duration,
          includedJobs: schedule.service_type.jobs,
          dueBy: schedule.mileage_trigger && schedule.time_trigger_months ? 'both' : 
                 schedule.mileage_trigger ? 'mileage' : 'time',
          mileageTrigger: schedule.mileage_trigger,
          timeTrigger: schedule.time_trigger_months ? `${schedule.time_trigger_months} months` : undefined,
          currentMileage: vehicles.find(v => v.id === schedule.vehicle)?.odometer,
          status: schedule.status.replace('_', '-') as any,
          priority: schedule.service_type.priority,
          lastCompleted: schedule.last_completed_date,
        }));
        setServices(transformedServices);
      } else {
        console.error('Failed to fetch service schedule:', response.status);
        setServices([]);
      }
    } catch (error) {
      console.error('Error fetching service schedule:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/locations/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  const openBookingModal = (service: ServiceItem) => {
    setSelectedService(service);
    setShowBookingModal(true);
    fetchLocations();
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setSelectedService(null);
    setBookingForm({ locationId: '', date: '', time: '' });
  };

  const handleBookAppointment = async () => {
    if (!selectedService || !bookingForm.locationId || !bookingForm.date || !bookingForm.time) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const token = tokenStorage.getAccessToken();
      const startTime = `${bookingForm.date}T${bookingForm.time}:00`;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/appointments/book/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vehicleId: selectedVehicle,
          locationId: bookingForm.locationId,
          startTime: startTime,
          services: selectedService.includedJobs,
          serviceScheduleId: selectedService.id,
        }),
      });

      if (response.ok) {
        alert('Appointment booked successfully!');
        closeBookingModal();
        fetchServiceSchedule(); // Refresh to show updated status
      } else {
        const error = await response.json();
        alert(`Failed to book appointment: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Network error. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'border-red-500 bg-red-900/20';
      case 'due-soon':
        return 'border-yellow-500 bg-yellow-900/20';
      case 'upcoming':
        return 'border-[var(--border-color)] bg-[var(--surface)]';
      case 'completed':
        return 'border-green-500 bg-green-900/20';
      default:
        return 'border-[var(--border-color)] bg-[var(--surface)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'due-soon':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-[var(--gold)]" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-900/30 text-red-400 border-red-500',
      medium: 'bg-yellow-900/30 text-yellow-400 border-yellow-500',
      low: 'bg-blue-900/30 text-blue-400 border-blue-500',
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const calculateMilesUntilDue = (service: ServiceItem) => {
    if (service.mileageTrigger && service.currentMileage) {
      const lastServiceMileage = service.currentMileage - (service.mileageTrigger * Math.floor(service.currentMileage / service.mileageTrigger));
      return service.mileageTrigger - lastServiceMileage;
    }
    return null;
  };

  const filteredServices = services.filter(service => {
    if (filterStatus === 'all') return true;
    return service.status === filterStatus;
  });

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--gold)] mb-2">Service Schedule</h1>
          <p className="text-[var(--text-secondary)]">
            Keep track of your vehicle's maintenance needs and never miss an important service
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Vehicle Selector */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Select Vehicle
              </label>
              <select
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
              >
                <option value="all">All Services</option>
                <option value="overdue">Overdue</option>
                <option value="due-soon">Due Soon</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Service Cards */}
        {authError ? (
          <div className="text-center py-12 bg-[var(--surface)] rounded-lg border border-red-500/50">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Authentication Required</h3>
            <p className="text-[var(--text-secondary)] mb-4">Your session has expired. Please log in again.</p>
            <p className="text-sm text-[var(--text-secondary)]">Redirecting to login page...</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gold)]"></div>
            <p className="mt-4 text-[var(--text-secondary)]">Loading service schedule...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12 bg-[var(--surface)] rounded-lg border border-[var(--border-color)]">
            <Wrench className="w-16 h-16 text-[var(--gold)] mx-auto mb-4" />
            <p className="text-[var(--text-secondary)]">No services found for the selected filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredServices.map((service) => {
              const milesUntilDue = calculateMilesUntilDue(service);
              
              return (
                <div
                  key={service.id}
                  className={`rounded-lg border-2 p-6 transition-all hover:shadow-lg ${getStatusColor(service.status)}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      {getStatusIcon(service.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-[var(--foreground)]">{service.name}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded border ${getPriorityBadge(service.priority)}`}>
                            {service.priority.toUpperCase()} PRIORITY
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-muted)] mb-1">{service.category}</p>
                        <p className="text-[var(--text-secondary)]">{service.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => openBookingModal(service)}
                      className="px-4 py-2 bg-[var(--gold)] text-[#0d0d0d] rounded-lg hover:bg-[#d8b87f] transition-colors whitespace-nowrap"
                    >
                      Book Service
                    </button>
                  </div>

                  {/* Service Details Grid */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4 pt-4 border-t border-[var(--border-color)]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[var(--gold)]" />
                      <div>
                        <p className="text-xs text-[var(--text-muted)]">Estimated Duration</p>
                        <p className="text-sm font-semibold text-[var(--foreground)]">{service.estimatedDuration}</p>
                      </div>
                    </div>

                    {service.mileageTrigger && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[var(--gold)]" />
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">Service Interval</p>
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            Every {service.mileageTrigger.toLocaleString()} miles
                          </p>
                        </div>
                      </div>
                    )}

                    {milesUntilDue !== null && (
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-[var(--gold)]" />
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">Miles Until Due</p>
                          <p className={`text-sm font-semibold ${milesUntilDue < 500 ? 'text-red-400' : milesUntilDue < 1000 ? 'text-yellow-400' : 'text-[var(--foreground)]'}`}>
                            {milesUntilDue > 0 ? milesUntilDue.toLocaleString() : 'OVERDUE'}
                          </p>
                        </div>
                      </div>
                    )}

                    {service.lastCompleted && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--gold)]" />
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">Last Completed</p>
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {new Date(service.lastCompleted).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Included Jobs */}
                  <div className="pt-4 border-t border-[var(--border-color)]">
                    <p className="text-sm font-semibold text-[var(--foreground)] mb-3">What's Included:</p>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {service.includedJobs.map((job, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                          <CheckCircle className="w-4 h-4 text-[var(--gold)] mt-0.5 flex-shrink-0" />
                          {job}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Information Banner */}
        <div className="mt-8 bg-gradient-to-r from-[var(--gold)]/10 to-transparent border-l-4 border-[var(--gold)] p-6 rounded-lg">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-[var(--gold)] flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">About Your Service Schedule</h3>
              <p className="text-[var(--text-secondary)] mb-3">
                This schedule is based on your vehicle's manufacturer recommendations and your current mileage. 
                Services marked as "Due Soon" should be scheduled within the next 500 miles or 2 weeks.
              </p>
              <p className="text-[var(--text-secondary)]">
                All services are included in your membership plan. Book appointments at any time with no additional cost.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-lg max-w-lg w-full p-6 border border-[var(--border-color)]">
            <h3 className="text-2xl font-bold text-[var(--foreground)] mb-4">Book {selectedService.name}</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Select Location
                </label>
                <select
                  value={bookingForm.locationId}
                  onChange={(e) => setBookingForm({...bookingForm, locationId: e.target.value})}
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)]"
                >
                  <option value="">Choose a location...</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} - {loc.address}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Select Time
                </label>
                <select
                  value={bookingForm.time}
                  onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)]"
                >
                  <option value="">Choose a time...</option>
                  <option value="08:00">8:00 AM</option>
                  <option value="09:00">9:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="16:00">4:00 PM</option>
                  <option value="17:00">5:00 PM</option>
                </select>
              </div>

              <div className="bg-[var(--background)] p-4 rounded-lg">
                <p className="text-sm text-[var(--text-secondary)] mb-2">Estimated Duration:</p>
                <p className="text-[var(--foreground)] font-semibold">{selectedService.estimatedDuration}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeBookingModal}
                className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] hover:bg-opacity-80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBookAppointment}
                className="flex-1 px-4 py-2 bg-[var(--gold)] text-[#0d0d0d] rounded-lg hover:bg-[#d8b87f] transition-colors font-semibold"
              >
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
