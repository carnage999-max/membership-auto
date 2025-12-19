'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Car,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface KPICard {
  title: string;
  value: string;
  change: number;
  icon: any;
  color: string;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPICard[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [membershipData, setMembershipData] = useState<any[]>([]);
  const [appointmentsData, setAppointmentsData] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/analytics/dashboard/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Set KPIs
        setKpis([
          {
            title: 'Total Members',
            value: data.total_members?.toLocaleString() || '0',
            change: data.members_change || 0,
            icon: Users,
            color: 'var(--gold)',
          },
          {
            title: 'Active Vehicles',
            value: data.total_vehicles?.toLocaleString() || '0',
            change: data.vehicles_change || 0,
            icon: Car,
            color: 'var(--info)',
          },
          {
            title: 'Monthly Revenue',
            value: `$${(data.monthly_revenue || 0).toLocaleString()}`,
            change: data.revenue_change || 0,
            icon: DollarSign,
            color: 'var(--success)',
          },
          {
            title: 'Appointments Today',
            value: data.appointments_today?.toString() || '0',
            change: data.appointments_change || 0,
            icon: Calendar,
            color: 'var(--warning)',
          },
        ]);

        setRevenueData(data.revenue_chart || []);
        setMembershipData(data.membership_tiers || []);
        setAppointmentsData(data.appointments_chart || []);
      } else {
        console.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#CBA86E', '#64B5F6', '#4CAF50', '#FFB74D'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--gold)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
          Dashboard Overview
        </h1>
        <p className="text-[var(--text-secondary)]">
          Welcome back! Here's what's happening with Membership Auto today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          const isPositive = kpi.change >= 0;

          return (
            <div
              key={index}
              className="bg-[var(--surface)] border border-[var(--border-color)] rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${kpi.color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color: kpi.color }} />
                </div>
                <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{Math.abs(kpi.change)}%</span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-1">
                {kpi.value}
              </h3>
              <p className="text-sm text-[var(--text-secondary)]">{kpi.title}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Revenue Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="month" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="var(--gold)"
                strokeWidth={2}
                dot={{ fill: 'var(--gold)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Membership Distribution */}
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Membership Tiers
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={membershipData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {membershipData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6">
        {/* Appointments Chart */}
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Appointments This Week
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={appointmentsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="day" stroke="var(--text-secondary)" />
              <YAxis stroke="var(--text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="scheduled" fill="var(--info)" name="Scheduled" />
              <Bar dataKey="completed" fill="var(--success)" name="Completed" />
              <Bar dataKey="cancelled" fill="var(--error)" name="Cancelled" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity - Shows only if data is available */}
      {revenueData.length === 0 && membershipData.length === 0 && appointmentsData.length === 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-lg p-12 text-center">
          <Activity className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            No Data Available Yet
          </h3>
          <p className="text-[var(--text-secondary)]">
            Dashboard analytics will appear here once you have members, vehicles, and appointments.
          </p>
        </div>
      )}
    </div>
  );
}
