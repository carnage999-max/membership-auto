'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
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
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const [vehicles] = useState([
    {
      id: 1,
      make: "Honda",
      model: "Civic",
      year: 2020,
      vin: "1HGBH41JXMN109186",
      odometer: 45000,
    },
  ]);

  const [upcomingServices] = useState([
    {
      id: 1,
      date: "2024-02-15",
      service: "Oil Change & Tire Rotation",
      location: "Main Service Center",
      duration: "30 minutes",
    },
  ]);

  const [serviceHistory] = useState([
    {
      id: 1,
      date: "2024-01-10",
      service: "Brake Pad Replacement",
      cost: "$0.00",
      savings: "$450.00",
    },
    {
      id: 2,
      date: "2023-12-05",
      service: "Transmission Fluid Flush",
      cost: "$0.00",
      savings: "$280.00",
    },
  ]);

  const totalSavings = 3281;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Header */}
      <header className="bg-[#0d0d0d] border-b border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-black flex items-center justify-center">
                <Image
                  src="/images/logo.jpeg"
                  alt="Membership Auto logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>
              <span className="text-[var(--gold)] font-bold text-xl">
                Membership Auto
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <button className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
                Settings
              </button>
              <button className="px-4 py-2 bg-[var(--error)] text-white rounded-full hover:bg-[#f06561] transition-colors">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Panel */}
      <section className="bg-[#111111] py-12 border-b border-[var(--border-color)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--gold)] mb-2">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xl text-[var(--text-secondary)]">
            Here's everything about your vehicle in one place.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Gamification Panel */}
              <div className="bg-gradient-to-br from-[#cba86e] to-[#e0bf7f] rounded-lg p-8 text-[#0d0d0d] shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg mb-2 font-semibold">Total Savings</p>
                    <p className="text-5xl font-bold">
                      ${totalSavings.toLocaleString()}
                    </p>
                    <p className="text-sm mt-2 opacity-90">
                      in repair costs since joining!
                    </p>
                  </div>
                  <div className="flex items-center justify-center w-20 h-20 rounded-full bg-black/20">
                    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Vehicle Profile */}
              <div className="bg-[var(--surface)] rounded-lg shadow-lg p-6 border border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">
                    Vehicle Profile
                  </h2>
                  <button className="px-4 py-2 bg-[var(--gold)] text-[#0d0d0d] rounded-full hover:bg-[#d8b87f] text-sm transition-colors">
                    Add Vehicle
                  </button>
                </div>
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="border border-[var(--border-color)] rounded-lg p-6 bg-[#111111]"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </h3>
                        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                          <p>
                            <strong>VIN:</strong> {vehicle.vin}
                          </p>
                          <p>
                            <strong>Odometer:</strong>{" "}
                            {vehicle.odometer.toLocaleString()} miles
                          </p>
                        </div>
                      </div>
                      <button className="text-[var(--gold)] hover:text-[#d8b87f] font-semibold">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upcoming Scheduled Services */}
              <div className="bg-[var(--surface)] rounded-lg shadow-lg p-6 border border-[var(--border-color)]">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
                  Upcoming Scheduled Services
                </h2>
                {upcomingServices.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingServices.map((service) => (
                      <div
                        key={service.id}
                        className="border border-[var(--border-color)] rounded-lg p-4 bg-[#111111]"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-white mb-1">
                              {service.service}
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)]">
                              {service.location}
                            </p>
                            <p className="text-sm text-[var(--text-secondary)]">
                              {service.date} • {service.duration}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button className="px-4 py-2 text-sm border border-[var(--border-color)] rounded-lg hover:bg-[#1a1a1a] transition-colors">
                              Reschedule
                            </button>
                            <button className="px-4 py-2 text-sm bg-[var(--gold)] text-[#0d0d0d] rounded-lg hover:bg-[#d8b87f] transition-colors">
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--text-secondary)]">
                    No upcoming services scheduled.
                  </p>
                )}
                <Link
                  href="/appointments"
                  className="mt-4 inline-block text-[var(--gold)] hover:text-[#d8b87f] font-semibold"
                >
                  Schedule Service →
                </Link>
              </div>

              {/* Service History */}
              <div className="bg-[var(--surface)] rounded-lg shadow-lg p-6 border border-[var(--border-color)]">
                <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
                  Service History
                </h2>
                <div className="space-y-4">
                  {serviceHistory.map((service) => (
                    <div
                      key={service.id}
                      className="border border-[var(--border-color)] rounded-lg p-4 bg-[#111111]"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white mb-1">
                            {service.service}
                          </h3>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {service.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-[var(--gold)]">
                            {service.cost}
                          </p>
                          <p className="text-xs text-[var(--text-muted)]">
                            Saved {service.savings}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/history"
                  className="mt-4 inline-block text-[var(--gold)] hover:text-[#d8b87f] font-semibold"
                >
                  View Full History →
                </Link>
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Plan Tier & Billing */}
              <div className="bg-[var(--surface)] rounded-lg shadow-lg p-6 border border-[var(--border-color)]">
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
                  Membership Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] mb-1">
                      Plan
                    </p>
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      {user.membership.plan}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] mb-1">
                      Status
                    </p>
                    <p className="text-lg font-semibold text-[var(--success)]">
                      {user.membership.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] mb-1">
                      Renewal Date
                    </p>
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      {user.membership.renewalDate}
                    </p>
                  </div>
                  <button className="w-full px-4 py-2 bg-[#111111] text-[var(--foreground)] rounded-lg hover:bg-[#1a1a1a] font-semibold border border-[var(--border-color)] transition-colors">
                    Manage Billing
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[var(--surface)] rounded-lg shadow-lg p-6 border border-[var(--border-color)]">
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-[var(--gold)] text-[#0d0d0d] rounded-lg hover:bg-[#d8b87f] font-semibold text-left transition-colors">
                    Request a Repair
                  </button>
                  <button className="w-full px-4 py-3 bg-[#111111] text-[var(--foreground)] rounded-lg hover:bg-[#1a1a1a] font-semibold text-left border border-[var(--border-color)] transition-colors">
                    Upload Photos or Videos
                  </button>
                  <button className="w-full px-4 py-3 bg-[#111111] text-[var(--foreground)] rounded-lg hover:bg-[#1a1a1a] font-semibold text-left border border-[var(--border-color)] transition-colors">
                    Track Open Repairs
                  </button>
                  <Link
                    href="/chat"
                    className="block w-full px-4 py-3 bg-[#111111] text-[var(--foreground)] rounded-lg hover:bg-[#1a1a1a] font-semibold text-left border border-[var(--border-color)] transition-colors"
                  >
                    Chat With Your Advisor
                  </Link>
                </div>
              </div>

              {/* Help & Support */}
              <div className="bg-[var(--surface)] rounded-lg shadow-lg p-6 border border-[var(--border-color)]">
                <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">
                  Need Help?
                </h2>
                <div className="space-y-3">
                  <Link
                    href="/help"
                    className="block text-[var(--gold)] hover:text-[#d8b87f] font-semibold"
                  >
                    Help Center
                  </Link>
                  <Link
                    href="/contact"
                    className="block text-[var(--gold)] hover:text-[#d8b87f] font-semibold"
                  >
                    Contact Support
                  </Link>
                  <Link
                    href="/referrals"
                    className="block text-[var(--gold)] hover:text-[#d8b87f] font-semibold"
                  >
                    Refer a Friend
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

