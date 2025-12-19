'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import appointmentService, {
  Appointment,
  Location,
  CreateAppointmentData,
  AvailabilitySlot,
} from '@/lib/api/appointmentService';
import vehicleService, { Vehicle } from '@/lib/api/vehicleService';
import ConfirmDialog from '@/app/components/ConfirmDialog';
import { Calendar, MapPin, Clock, Plus, X, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function AppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookForm, setShowBookForm] = useState(false);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const [formData, setFormData] = useState<CreateAppointmentData & { date: string; time: string }>({
    vehicleId: '',
    locationId: '',
    startTime: '',
    endTime: '',
    services: [],
    date: '',
    time: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState<{ show: boolean; appointmentId: string | null; cancelling: boolean }>({
    show: false,
    appointmentId: null,
    cancelling: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsData, locationsData, vehiclesData] = await Promise.all([
        appointmentService.getUpcomingAppointments(),
        appointmentService.getLocations(),
        vehicleService.getVehicles(),
      ]);
      setAppointments(appointmentsData);
      setLocations(locationsData);
      setVehicles(vehiclesData);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async () => {
    if (!formData.locationId || !formData.date) return;

    try {
      setCheckingAvailability(true);
      const slots = await appointmentService.checkAvailability(
        formData.locationId,
        formData.date,
        formData.vehicleId
      );
      setAvailability(slots);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to check availability');
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    if (formData.locationId && formData.date) {
      checkAvailability();
    }
  }, [formData.locationId, formData.date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // Combine date and time into ISO string
      const startDateTime = new Date(formData.date + 'T' + formData.time);
      
      const submitData: CreateAppointmentData = {
        vehicleId: formData.vehicleId || undefined,
        locationId: formData.locationId,
        startTime: startDateTime.toISOString(),
        endTime: formData.endTime || undefined,
        services: formData.services && formData.services.length > 0 ? formData.services : undefined,
      };

      await appointmentService.createAppointment(submitData);
      setShowBookForm(false);
      setFormData({
        vehicleId: '',
        locationId: '',
        startTime: '',
        endTime: '',
        services: [],
        date: '',
        time: '',
      });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to book appointment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelClick = (id: string) => {
    setCancelConfirm({ show: true, appointmentId: id, cancelling: false });
  };

  const handleCancelConfirm = async () => {
    if (!cancelConfirm.appointmentId) return;

    setCancelConfirm({ ...cancelConfirm, cancelling: true });

    try {
      await appointmentService.cancelAppointment(cancelConfirm.appointmentId);
      setCancelConfirm({ show: false, appointmentId: null, cancelling: false });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel appointment');
      setCancelConfirm({ show: false, appointmentId: null, cancelling: false });
    }
  };

  const handleCancelDialogClose = () => {
    setCancelConfirm({ show: false, appointmentId: null, cancelling: false });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-[#CBA86E] bg-[#CBA86E]/10';
      case 'in_progress':
        return 'text-[#FFB74D] bg-[#FFB74D]/10';
      case 'completed':
        return 'text-[#4CAF50] bg-[#4CAF50]/10';
      case 'cancelled':
        return 'text-[#DD4A48] bg-[#DD4A48]/10';
      default:
        return 'text-[#B3B3B3] bg-[#1A1A1A]';
    }
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
            <h1 className="text-3xl font-bold text-white mb-2">Appointments</h1>
            <p className="text-[#B3B3B3]">Manage your service appointments</p>
          </div>
          <button
            onClick={() => setShowBookForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#CBA86E] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#B89860] transition-colors"
          >
            <Plus size={20} />
            Book Appointment
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[#DD4A48]/10 border border-[#DD4A48] rounded-lg flex items-center gap-3">
            <AlertCircle className="text-[#DD4A48]" size={20} />
            <p className="text-[#DD4A48]">{error}</p>
          </div>
        )}

        {/* Book Appointment Modal */}
        {showBookForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#1A1A1A] border-b border-[#2A2A2A] p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Book Appointment</h2>
                <button
                  onClick={() => setShowBookForm(false)}
                  className="text-[#B3B3B3] hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[#B3B3B3] mb-2">Vehicle (Optional)</label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white focus:border-[#CBA86E] focus:outline-none"
                  >
                    <option value="">Select a vehicle</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#B3B3B3] mb-2">Location *</label>
                  <select
                    value={formData.locationId}
                    onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white focus:border-[#CBA86E] focus:outline-none"
                  >
                    <option value="">Select a location</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#B3B3B3] mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white focus:border-[#CBA86E] focus:outline-none scheme-dark"
                  />
                </div>

                <div>
                  <label className="block text-[#B3B3B3] mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Time *
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white focus:border-[#CBA86E] focus:outline-none scheme-dark"
                  />
                </div>

                <div>
                  <label className="block text-[#B3B3B3] mb-2">Services (Optional)</label>
                  <textarea
                    value={(formData.services || []).join(', ')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        services: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    placeholder="Oil change, Brake inspection, etc. (comma separated)"
                    rows={3}
                    className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white focus:border-[#CBA86E] focus:outline-none resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple services with commas
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookForm(false)}
                    className="flex-1 px-6 py-3 bg-[#0D0D0D] border border-[#2A2A2A] text-[#B3B3B3] font-semibold rounded-lg hover:border-[#CBA86E] hover:text-[#CBA86E] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-[#CBA86E] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#B89860] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Booking...' : 'Book Appointment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Appointments List */}
        {appointments.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="mx-auto text-[#707070] mb-4" size={64} />
            <h2 className="text-xl font-semibold text-white mb-2">No appointments scheduled</h2>
            <p className="text-[#B3B3B3] mb-6">Book your first service appointment</p>
            <button
              onClick={() => setShowBookForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#CBA86E] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#B89860] transition-colors"
            >
              <Plus size={20} />
              Book Your First Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 hover:border-[#CBA86E] transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="text-[#CBA86E]" size={20} />
                      <h3 className="text-lg font-semibold text-white">
                        {new Date(appointment.startTime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h3>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-[#B3B3B3]">
                        <Clock size={16} />
                        <span>
                          {new Date(appointment.startTime).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {appointment.location && (
                        <div className="flex items-center gap-2 text-[#B3B3B3]">
                          <MapPin size={16} />
                          <span>{appointment.location.name}</span>
                        </div>
                      )}

                      {appointment.services && appointment.services.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[#707070] mb-1">Services:</p>
                          <div className="flex flex-wrap gap-2">
                            {appointment.services.map((service, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-[#0D0D0D] text-[#B3B3B3] rounded-full text-xs"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span
                      className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status.replace('_', ' ')}
                    </span>

                    {appointment.status === 'scheduled' && (
                      <button
                        onClick={() => handleCancelClick(appointment.id)}
                        className="px-4 py-2 text-[#DD4A48] hover:bg-[#DD4A48]/10 rounded-lg transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancel Confirmation Dialog */}
        <ConfirmDialog
          isOpen={cancelConfirm.show}
          onClose={handleCancelDialogClose}
          onConfirm={handleCancelConfirm}
          title="Cancel Appointment"
          message="Are you sure you want to cancel this appointment? This action cannot be undone."
          confirmText="Cancel Appointment"
          cancelText="Keep Appointment"
          type="danger"
          loading={cancelConfirm.cancelling}
        />
      </div>
    </div>
  );
}
