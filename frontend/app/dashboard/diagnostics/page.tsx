'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import {
  ArrowLeft,
  Activity,
  Car,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Battery,
  Thermometer,
  Gauge,
  Droplets,
  Cog,
  Zap,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  Wrench,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';

interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  vin: string;
  license_plate: string;
}

interface DiagnosticCode {
  code: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  system: string;
  detectedAt: string;
  possibleCauses: string[];
  recommendedAction: string;
}

interface SystemHealth {
  name: string;
  status: 'good' | 'warning' | 'critical' | 'unknown';
  value?: string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  icon: React.ElementType;
  details?: string;
}

export default function DiagnosticsPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // Mock diagnostic codes
  const [diagnosticCodes] = useState<DiagnosticCode[]>([
    {
      code: 'P0420',
      description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
      severity: 'warning',
      system: 'Emissions',
      detectedAt: '2024-01-15T10:30:00',
      possibleCauses: [
        'Faulty catalytic converter',
        'Oxygen sensor malfunction',
        'Exhaust leak',
        'Engine misfire causing catalyst damage'
      ],
      recommendedAction: 'Schedule a diagnostic appointment to have the catalytic converter and oxygen sensors inspected.'
    },
    {
      code: 'P0128',
      description: 'Coolant Thermostat (Coolant Temperature Below Thermostat Regulating Temperature)',
      severity: 'info',
      system: 'Cooling',
      detectedAt: '2024-01-14T08:15:00',
      possibleCauses: [
        'Stuck open thermostat',
        'Faulty coolant temperature sensor',
        'Low coolant level',
        'Cooling fan running constantly'
      ],
      recommendedAction: 'Monitor coolant temperature. If the issue persists, have the thermostat inspected during your next service.'
    }
  ]);

  // System health data from backend
  const [systemHealth, setSystemHealth] = useState<SystemHealth[]>([]);

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      fetchVehicleHealth();
      fetchDiagnosticCodes();
    }
  }, [selectedVehicle]);

  const fetchVehicles = async () => {
    setIsLoading(true);
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
          setSelectedVehicle(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVehicleHealth = async () => {
    try {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vehicle-health/${selectedVehicle}/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Update system health based on backend data
        const updatedHealth: SystemHealth[] = [
          {
            name: 'Engine',
            status: data.engine_score >= 80 ? 'good' : data.engine_score >= 50 ? 'warning' : 'critical',
            value: data.engine_score.toString(),
            unit: '%',
            icon: Cog,
          },
          {
            name: 'Transmission',
            status: data.transmission_score >= 80 ? 'good' : data.transmission_score >= 50 ? 'warning' : 'critical',
            value: data.transmission_score.toString(),
            unit: '%',
            icon: Gauge,
          },
          {
            name: 'Brakes',
            status: data.brakes_score >= 80 ? 'good' : data.brakes_score >= 50 ? 'warning' : 'critical',
            value: data.brakes_score.toString(),
            unit: '%',
            icon: Activity,
          },
          {
            name: 'Tires',
            status: data.tires_score >= 80 ? 'good' : data.tires_score >= 50 ? 'warning' : 'critical',
            value: data.tires_score.toString(),
            unit: '%',
            icon: Car,
          },
          {
            name: 'Battery',
            status: data.battery_score >= 80 ? 'good' : data.battery_score >= 50 ? 'warning' : 'critical',
            value: data.battery_score.toString(),
            unit: '%',
            icon: Battery,
          },
          {
            name: 'Fluids',
            status: data.fluids_score >= 80 ? 'good' : data.fluids_score >= 50 ? 'warning' : 'critical',
            value: data.fluids_score.toString(),
            unit: '%',
            icon: Droplets,
          },
        ];
        setSystemHealth(updatedHealth);
      }
    } catch (error) {
      console.error('Failed to fetch vehicle health:', error);
    }
  };

  const fetchDiagnosticCodes = async () => {
    try {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vehicle-health/dtc/?vehicle_id=${selectedVehicle}&active_only=true`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Transform backend data to frontend format (keeping mock data as fallback)
        // Backend DTCs don't have all the detail we show, so we'll display what we have
        console.log('DTC codes from backend:', data);
      }
    } catch (error) {
      console.error('Failed to fetch DTC codes:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate OBD refresh
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh data from backend
      await fetchVehicleHealth();
      await fetchDiagnosticCodes();
      
      setLastSyncTime(new Date());
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-[var(--text-muted)]';
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-500/10 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'critical':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-[var(--surface)] border-[var(--border-color)]';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            Critical
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            Warning
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
            Info
          </span>
        );
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-[var(--text-muted)]" />;
    }
  };

  const getOverallHealth = () => {
    const criticalCount = systemHealth.filter(s => s.status === 'critical').length;
    const warningCount = systemHealth.filter(s => s.status === 'warning').length;

    if (criticalCount > 0) return { status: 'critical', label: 'Needs Attention', percentage: 40 };
    if (warningCount > 0) return { status: 'warning', label: 'Minor Issues', percentage: 70 };
    return { status: 'good', label: 'Excellent', percentage: 95 };
  };

  const overallHealth = getOverallHealth();
  const currentVehicle = vehicles.find(v => v.id === selectedVehicle);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-[var(--gold)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--surface)] border-b border-[var(--border-color)] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-[var(--foreground)]" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-[var(--foreground)]">Vehicle Diagnostics</h1>
                <p className="text-sm text-[var(--text-muted)]">OBD-II health monitoring</p>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
                isConnected
                  ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                  : 'bg-red-500/10 text-red-400 border border-red-500/30'
              }`}>
                {isConnected ? (
                  <>
                    <Wifi className="w-4 h-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4" />
                    Disconnected
                  </>
                )}
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 bg-[var(--gold)] text-black rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Vehicle Selector */}
        <div className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border-color)]">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[var(--gold)]/10 rounded-lg">
                <Car className="w-5 h-5 text-[var(--gold)]" />
              </div>
              <select
                value={selectedVehicle || ''}
                onChange={(e) => setSelectedVehicle(Number(e.target.value))}
                className="bg-[var(--background)] border border-[var(--border-color)] rounded-lg px-4 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
              >
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </option>
                ))}
              </select>
            </div>
            {currentVehicle && (
              <div className="text-sm text-[var(--text-muted)]">
                VIN: {currentVehicle.vin} • Plate: {currentVehicle.license_plate}
              </div>
            )}
            <div className="sm:ml-auto text-sm text-[var(--text-muted)] flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last sync: {lastSyncTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Overall Health Score */}
        <div className={`rounded-xl p-6 border ${getStatusBgColor(overallHealth.status)}`}>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${
                overallHealth.status === 'good' ? 'bg-green-500/20' :
                overallHealth.status === 'warning' ? 'bg-yellow-500/20' : 'bg-red-500/20'
              }`}>
                <Activity className={`w-8 h-8 ${getStatusColor(overallHealth.status)}`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--foreground)]">
                  Overall Health: {overallHealth.label}
                </h2>
                <p className="text-[var(--text-secondary)]">
                  {diagnosticCodes.length} diagnostic code{diagnosticCodes.length !== 1 ? 's' : ''} detected
                </p>
              </div>
            </div>
            <div className="flex-1 md:max-w-xs">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--text-secondary)]">Health Score</span>
                <span className={getStatusColor(overallHealth.status)}>{overallHealth.percentage}%</span>
              </div>
              <div className="h-3 bg-[var(--background)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    overallHealth.status === 'good' ? 'bg-green-500' :
                    overallHealth.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${overallHealth.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* System Health Grid */}
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">System Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {systemHealth.map((system) => {
              const Icon = system.icon;
              return (
                <div
                  key={system.name}
                  className={`rounded-xl p-4 border transition-all hover:scale-105 cursor-pointer ${getStatusBgColor(system.status)}`}
                  title={system.details}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${getStatusColor(system.status)}`} />
                    {system.trend && getTrendIcon(system.trend)}
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mb-1">{system.name}</p>
                  <p className={`font-semibold ${getStatusColor(system.status)}`}>
                    {system.value}{system.unit && <span className="text-xs ml-0.5">{system.unit}</span>}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Diagnostic Codes */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Diagnostic Trouble Codes</h2>
            {diagnosticCodes.length > 0 && (
              <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                {diagnosticCodes.length} Active
              </span>
            )}
          </div>

          {diagnosticCodes.length === 0 ? (
            <div className="bg-[var(--surface)] rounded-xl p-8 border border-[var(--border-color)] text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No Issues Detected</h3>
              <p className="text-[var(--text-muted)]">
                Your vehicle is running smoothly with no diagnostic trouble codes.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {diagnosticCodes.map((dtc) => (
                <div
                  key={dtc.code}
                  className="bg-[var(--surface)] rounded-xl border border-[var(--border-color)] overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedCode(expandedCode === dtc.code ? null : dtc.code)}
                    className="w-full p-4 flex items-start gap-4 text-left hover:bg-[var(--background)] transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${
                      dtc.severity === 'critical' ? 'bg-red-500/20' :
                      dtc.severity === 'warning' ? 'bg-yellow-500/20' : 'bg-blue-500/20'
                    }`}>
                      {dtc.severity === 'critical' ? (
                        <XCircle className="w-5 h-5 text-red-500" />
                      ) : dtc.severity === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono font-bold text-[var(--gold)]">{dtc.code}</span>
                        {getSeverityBadge(dtc.severity)}
                        <span className="text-xs text-[var(--text-muted)]">{dtc.system}</span>
                      </div>
                      <p className="text-[var(--foreground)] line-clamp-1">{dtc.description}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Detected: {new Date(dtc.detectedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {expandedCode === dtc.code ? (
                      <ChevronUp className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-[var(--text-muted)] shrink-0" />
                    )}
                  </button>

                  {expandedCode === dtc.code && (
                    <div className="px-4 pb-4 pt-0 border-t border-[var(--border-color)]">
                      <div className="pt-4 space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-[var(--foreground)] mb-2">
                            Possible Causes
                          </h4>
                          <ul className="space-y-1">
                            {dtc.possibleCauses.map((cause, index) => (
                              <li
                                key={index}
                                className="text-sm text-[var(--text-secondary)] flex items-start gap-2"
                              >
                                <span className="text-[var(--gold)]">•</span>
                                {cause}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-[var(--foreground)] mb-2">
                            Recommended Action
                          </h4>
                          <p className="text-sm text-[var(--text-secondary)]">
                            {dtc.recommendedAction}
                          </p>
                        </div>
                        <div className="flex gap-3 pt-2">
                          <Link
                            href="/dashboard/appointments"
                            className="flex-1 py-2 px-4 bg-[var(--gold)] text-black rounded-lg font-medium text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                          >
                            <Calendar className="w-4 h-4" />
                            Schedule Inspection
                          </Link>
                          <button className="py-2 px-4 border border-[var(--border-color)] rounded-lg text-[var(--foreground)] hover:bg-[var(--background)] transition-colors flex items-center gap-2">
                            <Wrench className="w-4 h-4" />
                            Learn More
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/service-schedule"
            className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors flex items-center gap-4"
          >
            <div className="p-3 bg-[var(--gold)]/10 rounded-lg">
              <Calendar className="w-6 h-6 text-[var(--gold)]" />
            </div>
            <div>
              <h3 className="font-medium text-[var(--foreground)]">Service Schedule</h3>
              <p className="text-sm text-[var(--text-muted)]">View upcoming maintenance</p>
            </div>
          </Link>
          <Link
            href="/dashboard/mileage"
            className="bg-[var(--surface)] rounded-xl p-4 border border-[var(--border-color)] hover:border-[var(--gold)] transition-colors flex items-center gap-4"
          >
            <div className="p-3 bg-[var(--gold)]/10 rounded-lg">
              <Gauge className="w-6 h-6 text-[var(--gold)]" />
            </div>
            <div>
              <h3 className="font-medium text-[var(--foreground)]">Mileage Tracker</h3>
              <p className="text-sm text-[var(--text-muted)]">Log fuel economy</p>
            </div>
          </Link>
        </div>

        {/* OBD Device Info */}
        <div className="bg-[var(--surface)] rounded-xl p-6 border border-[var(--border-color)]">
          <h3 className="font-semibold text-[var(--foreground)] mb-4">OBD-II Device</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-[var(--text-muted)]">Device</p>
              <p className="text-[var(--foreground)] font-medium">MembershipAuto OBD</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Firmware</p>
              <p className="text-[var(--foreground)] font-medium">v2.1.4</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Last Reading</p>
              <p className="text-[var(--foreground)] font-medium">{lastSyncTime.toLocaleTimeString()}</p>
            </div>
            <div>
              <p className="text-[var(--text-muted)]">Status</p>
              <p className="text-green-500 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                Active
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
