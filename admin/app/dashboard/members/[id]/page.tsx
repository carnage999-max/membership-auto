'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Car, 
  Award, 
  CreditCard,
  Edit,
  CheckCircle,
  Clock,
  XCircle,
  User
} from 'lucide-react';

interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  vin: string;
  photo_url: string | null;
}

interface Appointment {
  id: string;
  date: string;
  service: string;
  status: string;
}

interface MemberDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  membership_id: string;
  role: string;
  rewards_balance: number;
  created_at: string;
  is_active: boolean;
  vehicles: Vehicle[];
  recent_appointments: Appointment[];
}

export default function MemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const memberId = params?.id as string;
  
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (memberId) {
      loadMemberDetail();
    }
  }, [memberId]);

  const loadMemberDetail = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/members/${memberId}/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMember(data);
      } else {
        setError('Failed to load member details');
      }
    } catch (error) {
      console.error('Error loading member:', error);
      setError('Error loading member details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any; label: string }> = {
      scheduled: { color: 'border-info text-info', icon: Clock, label: 'Scheduled' },
      confirmed: { color: 'border-warning text-warning', icon: Clock, label: 'Confirmed' },
      in_progress: { color: 'border-warning text-warning', icon: Clock, label: 'In Progress' },
      completed: { color: 'border-success text-success', icon: CheckCircle, label: 'Completed' },
      cancelled: { color: 'border-error text-error', icon: XCircle, label: 'Cancelled' },
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

  if (error || !member) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => router.push('/dashboard/members')}
          className="flex items-center gap-2 text-text-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Members
        </button>
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <User className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {error || 'Member not found'}
          </h3>
          <p className="text-text-secondary">
            Unable to load member details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/dashboard/members')}
          className="flex items-center gap-2 text-text-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Members
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-gold text-background rounded-lg hover:bg-opacity-90 transition-colors">
          <Edit className="w-4 h-4" />
          Edit Member
        </button>
      </div>

      {/* Member Info Card */}
      <div className="bg-surface border border-border rounded-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gold bg-opacity-10 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {member.name || 'No name'}
              </h1>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${
                  member.is_active 
                    ? 'border-success text-success' 
                    : 'border-error text-error'
                }`}>
                  {member.is_active ? 'Active' : 'Inactive'}
                </span>
                <span className="px-3 py-1 border border-gold text-gold rounded-full text-xs font-medium capitalize">
                  {member.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-text-muted">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">Email</span>
            </div>
            <p className="text-foreground">{member.email}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-text-muted">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Phone</span>
            </div>
            <p className="text-foreground">{member.phone || 'N/A'}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-text-muted">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-medium">Membership ID</span>
            </div>
            <p className="text-foreground font-mono">{member.membership_id || 'N/A'}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-text-muted">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Member Since</span>
            </div>
            <p className="text-foreground">
              {new Date(member.created_at).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="w-8 h-8 text-gold" />
            <h3 className="text-sm font-medium text-text-secondary">Rewards Balance</h3>
          </div>
          <p className="text-3xl font-bold text-gold">{member.rewards_balance.toLocaleString()} pts</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Car className="w-8 h-8 text-foreground" />
            <h3 className="text-sm font-medium text-text-secondary">Vehicles</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{member.vehicles.length}</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-foreground" />
            <h3 className="text-sm font-medium text-text-secondary">Appointments</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{member.recent_appointments.length}</p>
        </div>
      </div>

      {/* Vehicles Section */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Car className="w-5 h-5 text-gold" />
          Vehicles
        </h2>
        {member.vehicles.length === 0 ? (
          <div className="text-center py-8">
            <Car className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">No vehicles registered</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {member.vehicles.map((vehicle) => (
              <div key={vehicle.id} className="bg-background border border-border rounded-lg overflow-hidden">
                <div className="relative w-full h-40 bg-surface">
                  {vehicle.photo_url ? (
                    <img 
                      src={vehicle.photo_url} 
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `
                          <div class="w-full h-full flex items-center justify-center">
                            <svg class="w-16 h-16 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                            </svg>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="w-16 h-16 text-text-muted" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-3">
                    <h3 className="font-semibold text-foreground">
                      {vehicle.year} {vehicle.make}
                    </h3>
                    <p className="text-sm text-text-secondary">{vehicle.model}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">VIN:</span>
                      <span className="text-foreground font-mono text-xs">{vehicle.vin || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Appointments Section */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gold" />
          Recent Appointments
        </h2>
        {member.recent_appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-text-muted mx-auto mb-3" />
            <p className="text-text-secondary">No appointments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {member.recent_appointments.map((appointment) => (
              <div key={appointment.id} className="bg-background border border-border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-foreground">{appointment.service}</h3>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Clock className="w-4 h-4" />
                      {new Date(appointment.date).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
