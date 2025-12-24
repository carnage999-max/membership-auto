'use client';

import { useState } from 'react';

export default function HealthDashboardPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Vehicle Health Dashboard</h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Monitor your vehicle's health, diagnostics, and maintenance schedule in real-time
            </p>
          </div>

          {/* Health Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Vehicle Status */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[var(--border-color)] p-6 hover:border-[var(--gold)] transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Vehicle Status</h3>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <p className="text-3xl font-bold text-[var(--gold)] mb-2">Healthy</p>
              <p className="text-sm text-[var(--text-secondary)]">All systems operational</p>
            </div>

            {/* Battery Health */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[var(--border-color)] p-6 hover:border-[var(--gold)] transition-colors">
              <h3 className="text-lg font-semibold text-white mb-4">Battery Health</h3>
              <div className="mb-3">
                <div className="bg-[#0d0d0d] rounded-full h-2 mb-2">
                  <div className="bg-[var(--gold)] h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-2">85%</p>
              <p className="text-sm text-[var(--text-secondary)]">Good condition</p>
            </div>

            {/* Engine Status */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[var(--border-color)] p-6 hover:border-[var(--gold)] transition-colors">
              <h3 className="text-lg font-semibold text-white mb-4">Engine Status</h3>
              <div className="mb-3">
                <div className="bg-[#0d0d0d] rounded-full h-2 mb-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-2">92%</p>
              <p className="text-sm text-[var(--text-secondary)]">Excellent</p>
            </div>

            {/* Oil Life */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[var(--border-color)] p-6 hover:border-[var(--gold)] transition-colors">
              <h3 className="text-lg font-semibold text-white mb-4">Oil Life</h3>
              <div className="mb-3">
                <div className="bg-[#0d0d0d] rounded-full h-2 mb-2">
                  <div className="bg-[var(--gold)] h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-2">68%</p>
              <p className="text-sm text-[var(--text-secondary)]">Service due in 2,500 miles</p>
            </div>
          </div>

          {/* Diagnostics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Recent Diagnostics */}
            <div className="lg:col-span-2 bg-[#1a1a1a] rounded-lg border border-[var(--border-color)] p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Recent Diagnostics</h2>
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-4 border-b border-[var(--border-color)]">
                  <div>
                    <p className="font-semibold text-white">Oil Change Recommended</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Next maintenance due in 2,500 miles</p>
                  </div>
                  <span className="px-3 py-1 bg-[var(--gold)] text-[#0d0d0d] text-xs font-semibold rounded-full">
                    Maintenance
                  </span>
                </div>

                <div className="flex items-start justify-between pb-4 border-b border-[var(--border-color)]">
                  <div>
                    <p className="font-semibold text-white">Tire Pressure Normal</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">All tires within recommended PSI</p>
                  </div>
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                    Good
                  </span>
                </div>

                <div className="flex items-start justify-between pb-4 border-b border-[var(--border-color)]">
                  <div>
                    <p className="font-semibold text-white">Brake Inspection Due</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Annual brake inspection recommended</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                    Upcoming
                  </span>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">Battery Voltage Stable</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Charging system operating normally</p>
                  </div>
                  <span className="px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                    Good
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#1a1a1a] rounded-lg border border-[var(--border-color)] p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Stats</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">Mileage</p>
                  <p className="text-2xl font-bold text-white">42,356 miles</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">Last Service</p>
                  <p className="text-2xl font-bold text-white">28 days ago</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">Fuel Economy</p>
                  <p className="text-2xl font-bold text-white">24.3 MPG</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)] mb-2">Active Alerts</p>
                  <p className="text-2xl font-bold text-[var(--gold)]">2</p>
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Schedule */}
          <div className="bg-[#1a1a1a] rounded-lg border border-[var(--border-color)] p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Upcoming Maintenance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#0d0d0d] rounded-lg">
                <div>
                  <p className="font-semibold text-white">Oil Change & Filter Replacement</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Due in 2,500 miles or 30 days</p>
                </div>
                <button className="px-4 py-2 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-lg hover:bg-[#d8b87f] transition-colors">
                  Schedule
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0d0d0d] rounded-lg">
                <div>
                  <p className="font-semibold text-white">Tire Rotation</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Due in 5,000 miles or 60 days</p>
                </div>
                <button className="px-4 py-2 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-lg hover:bg-[#d8b87f] transition-colors">
                  Schedule
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-[#0d0d0d] rounded-lg">
                <div>
                  <p className="font-semibold text-white">Brake Inspection</p>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">Due in 10,000 miles or 90 days</p>
                </div>
                <button className="px-4 py-2 bg-[var(--gold)] text-[#0d0d0d] font-semibold rounded-lg hover:bg-[#d8b87f] transition-colors">
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
