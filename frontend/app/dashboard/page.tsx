'use client';

// Prevent static generation for this dynamic page
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import vehicleService, { Vehicle } from '@/lib/api/vehicleService';
import appointmentService, { Appointment } from '@/lib/api/appointmentService';
import offerService, { Offer } from '@/lib/api/offerService';
import {
  Car,
  Calendar,
  Tag,
  Users,
  MapPin,
  MessageCircle,
  HelpCircle,
  Upload,
  Wrench,
  DollarSign,
  TrendingUp,
  Phone,
  Heart,
  Activity,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingsData, setSavingsData] = useState<{
    totalSaved: number;
    thisMonth: number;
    servicesUsed: number;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehiclesData, appointmentsData, offersData] = await Promise.all([
        vehicleService.getVehicles(),
        appointmentService.getUpcomingAppointments(),
        offerService.getOffers(),
      ]);
      setVehicles(vehiclesData);
      setAppointments(appointmentsData);
      setOffers(offersData.slice(0, 3)); // Show first 3 offers
      
      // Fetch savings data
      await loadSavingsData();
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSavingsData = async () => {
    try {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/savings/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const currentMonth = new Date().toLocaleString('default', { month: 'short' });
        const thisMonthData = data.monthly_breakdown.find((m: any) => m.month === currentMonth);
        
        setSavingsData({
          totalSaved: data.total_saved || 0,
          thisMonth: thisMonthData?.amount || 0,
          servicesUsed: data.services_used || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load savings data:', error);
      setSavingsData({ totalSaved: 0, thisMonth: 0, servicesUsed: 0 });
    }
  };

  const quickActions = [
    { icon: Tag, label: 'Special Offers', href: '/dashboard/offers', color: '#CBA86E' },
    { icon: Car, label: 'My Vehicles', href: '/dashboard/vehicles', color: '#CBA86E' },
    { icon: Calendar, label: 'Appointments', href: '/dashboard/appointments', color: '#CBA86E' },
    { icon: Wrench, label: 'Service Schedule', href: '/dashboard/service-schedule', color: '#CBA86E' },
    { icon: TrendingUp, label: 'Mileage Tracker', href: '/dashboard/mileage', color: '#CBA86E' },
    { icon: MapPin, label: 'Parking Reminder', href: '/dashboard/parking', color: '#CBA86E' },
    { icon: Users, label: 'Refer Friends', href: '/dashboard/referrals', color: '#CBA86E' },
    { icon: MessageCircle, label: 'Support Chat', href: '/dashboard/chat', color: '#CBA86E' },
    { icon: HelpCircle, label: 'Help & FAQ', href: '/dashboard/help', color: '#CBA86E' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#CBA86E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#0D0D0D]">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-[#1A1A1A] to-[#0D0D0D] border-b border-[#2A2A2A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Welcome back, {user?.name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-[#B3B3B3]">
            Everything about your vehicles in one place
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Savings Tracker - Gamification */}
            {savingsData && savingsData.totalSaved > 0 && (
              <div className="bg-gradient-to-r from-[#CBA86E]/20 to-[#CBA86E]/5 border border-[#CBA86E] rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="text-[#CBA86E]" size={28} />
                      <h2 className="text-2xl font-bold text-white">You've Saved</h2>
                    </div>
                    <p className="text-5xl font-bold text-[#CBA86E] mb-2">
                      ${savingsData.totalSaved.toFixed(2)}
                    </p>
                    <p className="text-[#B3B3B3] text-sm mb-4">
                      in repair costs since joining Membership Auto
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-[#1A1A1A]/50 rounded-lg p-3">
                        <p className="text-xs text-[#B3B3B3] mb-1">This Month</p>
                        <p className="text-xl font-bold text-white">
                          ${savingsData.thisMonth.toFixed(2)}
                        </p>
                      </div>
                      <div className="bg-[#1A1A1A]/50 rounded-lg p-3">
                        <p className="text-xs text-[#B3B3B3] mb-1">Services Used</p>
                        <p className="text-xl font-bold text-white">{savingsData.servicesUsed}</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/savings"
                    className="px-4 py-2 bg-[#CBA86E] text-[#0D0D0D] rounded-lg hover:bg-[#B89860] transition-colors font-semibold text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Car className="text-[#CBA86E]" size={24} />
                  <h3 className="text-[#B3B3B3] font-medium">Vehicles</h3>
                </div>
                <p className="text-3xl font-bold text-white">{vehicles.length}</p>
              </div>

              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="text-[#CBA86E]" size={24} />
                  <h3 className="text-[#B3B3B3] font-medium">Appointments</h3>
                </div>
                <p className="text-3xl font-bold text-white">{appointments.length}</p>
              </div>

              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Tag className="text-[#CBA86E]" size={24} />
                  <h3 className="text-[#B3B3B3] font-medium">Active Offers</h3>
                </div>
                <p className="text-3xl font-bold text-white">{offers.length}</p>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {quickActions.map((action, idx) => (
                  <Link
                    key={idx}
                    href={action.href}
                    className="flex flex-col items-center gap-3 p-6 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg hover:border-[#CBA86E] transition-all group"
                  >
                    <div className="w-12 h-12 bg-[#CBA86E]/10 rounded-lg flex items-center justify-center group-hover:bg-[#CBA86E]/20 transition-colors">
                      <action.icon className="text-[#CBA86E]" size={24} />
                    </div>
                    <span className="text-[#B3B3B3] text-sm text-center group-hover:text-white transition-colors">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Next Appointment */}
            {appointments.length > 0 && (
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Next Appointment</h2>
                  <Link
                    href="/dashboard/appointments"
                    className="text-[#CBA86E] hover:text-[#B89860] transition-colors text-sm"
                  >
                    View All
                  </Link>
                </div>
                <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#CBA86E]/10 rounded-lg flex items-center justify-center shrink-0">
                      <Calendar className="text-[#CBA86E]" size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {new Date(appointments[0].startTime).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h3>
                      <p className="text-[#B3B3B3] text-sm mb-2">
                        {new Date(appointments[0].startTime).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                      {appointments[0].location && (
                        <div className="flex items-center gap-2 text-[#707070] text-sm">
                          <MapPin size={14} />
                          <span>{appointments[0].location.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* My Vehicles */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">My Vehicles</h2>
                <Link
                  href="/dashboard/vehicles"
                  className="text-[#CBA86E] hover:text-[#B89860] transition-colors text-sm"
                >
                  Manage
                </Link>
              </div>
              {vehicles.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="mx-auto text-[#707070] mb-3" size={48} />
                  <p className="text-[#B3B3B3] mb-4">No vehicles added yet</p>
                  <Link
                    href="/dashboard/vehicles"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#CBA86E] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#B89860] transition-colors"
                  >
                    Add Your First Vehicle
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicles.slice(0, 2).map((vehicle) => (
                    <div
                      key={vehicle.id}
                      className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg overflow-hidden"
                    >
                      {/* Vehicle Photo */}
                      <div className="flex items-center gap-4 p-4">
                        {vehicle.photoUrl ? (
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={vehicle.photoUrl}
                              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-[#CBA86E]/10 rounded-lg flex items-center justify-center shrink-0">
                            <Car className="text-[#CBA86E]" size={24} />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </h3>
                          {vehicle.odometer && (
                            <p className="text-[#707070] text-sm">
                              {vehicle.odometer.toLocaleString()} miles
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vehicle Health Status */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Activity className="text-[#CBA86E]" size={24} />
                  Vehicle Health
                </h2>
                <Link
                  href="/dashboard/health"
                  className="text-[#CBA86E] hover:text-[#B89860] transition-colors text-sm"
                >
                  Details
                </Link>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#B3B3B3] text-sm">Overall Status</span>
                  <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded-full text-xs font-semibold">
                    Healthy
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B3B3B3]">Engine</span>
                    <span className="text-green-400">✓ Good</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B3B3B3]">Brakes</span>
                    <span className="text-green-400">✓ Good</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#B3B3B3]">Tires</span>
                    <span className="text-yellow-400">⚠ Check Soon</span>
                  </div>
                </div>
                <Link
                  href="/dashboard/service-schedule"
                  className="block w-full px-4 py-2 bg-[#CBA86E] text-[#0D0D0D] rounded-lg hover:bg-[#B89860] transition-colors text-center font-semibold text-sm mt-4"
                >
                  View Service Schedule
                </Link>
              </div>
            </div>

            {/* Special Offers */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Special Offers</h2>
                <Link
                  href="/dashboard/offers"
                  className="text-[#CBA86E] hover:text-[#B89860] transition-colors text-sm"
                >
                  View All
                </Link>
              </div>
              {offers.length === 0 ? (
                <p className="text-[#B3B3B3] text-sm">No offers available</p>
              ) : (
                <div className="space-y-3">
                  {offers.map((offer) => (
                    <div
                      key={offer.id}
                      className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-4"
                    >
                      <h3 className="text-white font-semibold text-sm mb-2">{offer.title}</h3>
                      <p className="text-[#707070] text-xs line-clamp-2">{offer.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Support */}
            <div className="bg-linear-to-br from-[#CBA86E]/20 to-[#1A1A1A] border border-[#CBA86E] rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Need Help?</h2>
              <p className="text-[#B3B3B3] text-sm mb-6">
                Our team is here to assist you with any questions or concerns.
              </p>
              <div className="space-y-3">
                <Link
                  href="/contact"
                  className="flex items-center gap-3 p-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg hover:border-[#CBA86E] transition-colors text-[#B3B3B3] hover:text-white"
                >
                  <MessageCircle size={20} />
                  <span className="text-sm">Live Chat</span>
                </Link>
                <Link
                  href="/contact"
                  className="flex items-center gap-3 p-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg hover:border-[#CBA86E] transition-colors text-[#B3B3B3] hover:text-white"
                >
                  <Phone size={20} />
                  <span className="text-sm">Call Support</span>
                </Link>
              </div>
            </div>

            {/* Membership Status */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Membership</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-[#707070] text-sm mb-1">Status</p>
                  <p className="text-white font-semibold">Active</p>
                </div>
                <div>
                  <p className="text-[#707070] text-sm mb-1">Email</p>
                  <p className="text-white font-semibold text-sm">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
