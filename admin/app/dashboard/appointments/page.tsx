'use client';

import { useState, useEffect } from 'react';
import { Calendar, Search, Clock, MapPin, User, CheckCircle, XCircle, AlertCircle, X, Plus } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface Appointment {
  id: string;
  member: {
    id: string;
    name: string;
    email: string;
  };
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
  };
  service_type: string;
  status: string;
  scheduled_time: string;
  location: string;
  notes: string;
}

export default function AppointmentsPage() {
  const { showSuccess, showError, showWarning } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    member_id: '',
    vehicle_id: '',
    location_id: '',
    scheduled_time: '',
    service_type: '',
    status: 'scheduled',
    notes: '',
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/appointments/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const appointmentsData = data.results || data;
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      } else {
        showError('Failed to load appointments. Please refresh the page.');
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error loading appointments:', error);
      showError('Network error. Please check your connection and try again.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/members/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(Array.isArray(data.results) ? data.results : []);
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/vehicles/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const vehiclesData = Array.isArray(data.results) ? data.results : [];
        setAllVehicles(vehiclesData);
        setFilteredVehicles(vehiclesData);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const handleMemberSelect = (memberId: string) => {
    setFormData({ ...formData, member_id: memberId, vehicle_id: '' });
    
    if (memberId) {
      // Filter vehicles by selected member
      const memberVehicles = allVehicles.filter(v => v.owner?.id === memberId || v.user_id === memberId);
      setFilteredVehicles(memberVehicles);
    } else {
      // Reset to all vehicles if no member selected
      setFilteredVehicles(allVehicles);
    }
  };

  const loadLocations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/locations/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const locationsData = data.locations || data.results || data;
        setLocations(Array.isArray(locationsData) ? locationsData : []);
      }
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  };

  const openCreateModal = () => {
    setEditingAppointment(null);
    const now = new Date();
    now.setMinutes(0, 0, 0);
    const dateTimeLocal = now.toISOString().slice(0, 16);
    
    setFormData({
      member_id: '',
      vehicle_id: '',
      location_id: '',
      scheduled_time: dateTimeLocal,
      service_type: '',
      status: 'scheduled',
      notes: '',
    });
    loadMembers();
    loadVehicles();
    loadLocations();
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingAppointment
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/appointments/${editingAppointment.id}/`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/appointments/`;
      
      const response = await fetch(url, {
        method: editingAppointment ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: formData.member_id,
          vehicle_id: formData.vehicle_id,
          location_id: formData.location_id,
          start_time: formData.scheduled_time,
          services: formData.service_type,
          status: formData.status,
          notes: formData.notes,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        loadAppointments();
        showSuccess(editingAppointment ? 'Appointment updated successfully!' : 'Appointment created successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(errorData.error || 'Failed to save appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      showError('Network error. Please check your connection and try again.');
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/appointments/${appointmentId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadAppointments();
        const statusMessages = {
          confirmed: 'Appointment confirmed successfully!',
          in_progress: 'Service started successfully!',
          completed: 'Appointment marked as complete!',
          cancelled: 'Appointment cancelled successfully!'
        };
        showSuccess(statusMessages[newStatus as keyof typeof statusMessages] || 'Status updated successfully!');
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(errorData.error || 'Failed to update appointment status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating appointment status:', error);
      showError('Network error. Please check your connection and try again.');
    }
  };

  const filteredAppointments = Array.isArray(appointments) ? appointments.filter(apt => {
    const matchesSearch = 
      apt.member?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) : [];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any; label: string }> = {
      scheduled: { color: 'text-info border-info', icon: Clock, label: 'Scheduled' },
      confirmed: { color: 'text-warning border-warning', icon: AlertCircle, label: 'Confirmed' },
      in_progress: { color: 'text-warning border-warning', icon: AlertCircle, label: 'In Progress' },
      completed: { color: 'text-success border-success', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'text-error border-error', icon: XCircle, label: 'Cancelled' },
    };
    const { color, icon: Icon, label } = config[status] || config.scheduled;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${color}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Appointments</h1>
          <p className="text-text-secondary">Manage service appointments and schedules</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <Calendar className="w-4 h-4" />
            <span>{filteredAppointments.length} appointments</span>
          </div>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-gold text-background rounded-lg hover:bg-opacity-90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            placeholder="Search by member, service type, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Appointments List */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm || statusFilter !== 'all' ? 'No appointments found' : 'No appointments yet'}
          </h3>
          <p className="text-text-secondary">
            {searchTerm || statusFilter !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Appointments will appear here when members book services.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="bg-surface border border-border rounded-lg p-6 hover:border-gold transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      {appointment.service_type}
                    </h3>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Clock className="w-4 h-4" />
                    {new Date(appointment.scheduled_time).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-text-muted" />
                    <span className="text-sm font-medium text-text-muted">Member</span>
                  </div>
                  <p className="text-foreground">{appointment.member?.name || 'N/A'}</p>
                  <p className="text-sm text-text-secondary">{appointment.member?.email}</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4 text-text-muted" />
                    <span className="text-sm font-medium text-text-muted">Vehicle</span>
                  </div>
                  <p className="text-foreground">
                    {appointment.vehicle?.year} {appointment.vehicle?.make} {appointment.vehicle?.model}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-text-muted" />
                    <span className="text-sm font-medium text-text-muted">Location</span>
                  </div>
                  <p className="text-foreground">{appointment.location || 'N/A'}</p>
                </div>
              </div>

              {appointment.notes && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-text-secondary">{appointment.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-border flex items-center gap-2">
                {appointment.status === 'scheduled' && (
                  <button
                    onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                    className="px-4 py-2 bg-warning text-background rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                  >
                    Confirm
                  </button>
                )}
                {appointment.status === 'confirmed' && (
                  <button
                    onClick={() => handleStatusUpdate(appointment.id, 'in_progress')}
                    className="px-4 py-2 bg-info text-background rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                  >
                    Start Service
                  </button>
                )}
                {appointment.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                    className="px-4 py-2 bg-success text-background rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                  >
                    Mark Complete
                  </button>
                )}
                {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                  <button
                    onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                    className="px-4 py-2 border border-error rounded-lg hover:bg-error transition-colors text-sm font-medium group"
                  >
                    <span className="text-error group-hover:text-background transition-colors">Cancel</span>
                  </button>
                )}
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
                {editingAppointment ? 'Edit Appointment' : 'New Appointment'}
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Member *
                  </label>
                  <select
                    required
                    value={formData.member_id}
                    onChange={(e) => handleMemberSelect(e.target.value)}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                  >
                    <option value="">Select a member</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} - {member.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Vehicle *
                  </label>
                  <select
                    required
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    disabled={!formData.member_id}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      !formData.member_id
                        ? 'bg-surface text-text-muted border-border cursor-not-allowed'
                        : 'bg-background text-foreground border-border focus:ring-gold'
                    }`}
                  >
                    <option value="">{!formData.member_id ? 'Select a member first' : 'Select a vehicle'}</option>
                    {filteredVehicles.map((vehicle) => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                  {!formData.member_id && (
                    <p className="text-xs text-text-muted mt-1">Please select a member to view their vehicles</p>
                  )}
                  {formData.member_id && filteredVehicles.length === 0 && (
                    <p className="text-xs text-warning mt-1">This member has no vehicles</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Location *
                  </label>
                  <select
                    required
                    value={formData.location_id}
                    onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
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
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Scheduled Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                  <p className="text-xs text-text-muted mt-1">Click the calendar icon to select a date</p>
                </div>

                {editingAppointment && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Status *
                    </label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Service Type *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.service_type}
                    onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="e.g., Oil Change, Tire Rotation, Inspection"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    rows={3}
                    placeholder="Additional notes or special instructions..."
                  />
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
                  {editingAppointment ? 'Save Changes' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
