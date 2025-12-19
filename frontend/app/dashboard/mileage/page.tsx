'use client';

import { useState, useEffect } from 'react';
import { Fuel, Plus, TrendingUp, DollarSign, Gauge, Calendar, Car, Trash2, X } from 'lucide-react';
import { tokenStorage } from '@/lib/auth/tokenStorage';

interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  gallons: number;
  pricePerGallon: number;
  totalCost: number;
  mpg: number | null;
  notes?: string;
}

interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  odometer: number;
}

export default function MileageTrackerPage() {
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [newLog, setNewLog] = useState({
    date: new Date().toISOString().split('T')[0],
    odometer: '',
    gallons: '',
    pricePerGallon: '',
    totalCost: '',
    notes: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
      fetchFuelLogs();
    }
  }, [selectedVehicle]);

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
        }
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchFuelLogs = async () => {
    setLoading(true);
    try {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vehicles/fuel-logs/?vehicle_id=${selectedVehicle}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Transform backend data to frontend format
        const transformedLogs: FuelLog[] = data.map((log: any) => ({
          id: log.id,
          vehicleId: log.vehicle,
          date: log.timestamp ? new Date(log.timestamp).toISOString().split('T')[0] : '',
          odometer: Number(log.odometer) || 0,
          gallons: Number(log.gallons) || 0,
          pricePerGallon: log.price ? Number(log.price) / Number(log.gallons || 1) : 0,
          totalCost: Number(log.price) || 0,
          mpg: Number(log.mpg) || 0,
          notes: ''
        }));
        setFuelLogs(transformedLogs);
      } else {
        console.error('Failed to fetch fuel logs:', response.status);
        setFuelLogs([]);
      }
    } catch (error) {
      console.error('Error fetching fuel logs:', error);
      setFuelLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (fuelLogs.length === 0) {
      return {
        avgMpg: 0,
        totalGallons: 0,
        totalCost: 0,
        costPerMile: 0,
        totalMiles: 0,
      };
    }

    const validMpgLogs = fuelLogs.filter(log => log.mpg !== null);
    const avgMpg = validMpgLogs.length > 0 
      ? validMpgLogs.reduce((sum, log) => sum + (log.mpg || 0), 0) / validMpgLogs.length 
      : 0;
    const totalGallons = fuelLogs.reduce((sum, log) => sum + log.gallons, 0);
    const totalCost = fuelLogs.reduce((sum, log) => sum + log.totalCost, 0);
    const totalMiles = fuelLogs.length > 1 
      ? fuelLogs[0].odometer - fuelLogs[fuelLogs.length - 1].odometer 
      : 0;
    const costPerMile = totalMiles > 0 ? totalCost / totalMiles : 0;

    return { avgMpg, totalGallons, totalCost, costPerMile, totalMiles };
  };

  const stats = calculateStats();

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = tokenStorage.getAccessToken();
      const totalCost = parseFloat(newLog.totalCost) || parseFloat(newLog.gallons) * parseFloat(newLog.pricePerGallon);
      
      const payload = {
        vehicle: selectedVehicle,
        timestamp: new Date(newLog.date).toISOString(),
        odometer: parseFloat(newLog.odometer),
        gallons: parseFloat(newLog.gallons),
        price: totalCost,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/vehicles/fuel-logs/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        // Refresh the fuel logs list
        await fetchFuelLogs();
        setShowAddModal(false);
        setNewLog({
          date: new Date().toISOString().split('T')[0],
          odometer: '',
          gallons: '',
          pricePerGallon: '',
          totalCost: '',
          notes: '',
        });
      } else {
        console.error('Failed to add fuel log');
      }
    } catch (error) {
      console.error('Error adding fuel log:', error);
    }
  };

  const handleDeleteLog = (logId: string) => {
    setFuelLogs(fuelLogs.filter(log => log.id !== logId));
  };

  const handlePriceOrGallonsChange = (field: 'gallons' | 'pricePerGallon', value: string) => {
    const updatedLog = { ...newLog, [field]: value };
    
    // Auto-calculate total cost
    const gallons = parseFloat(field === 'gallons' ? value : updatedLog.gallons);
    const price = parseFloat(field === 'pricePerGallon' ? value : updatedLog.pricePerGallon);
    
    if (!isNaN(gallons) && !isNaN(price)) {
      updatedLog.totalCost = (gallons * price).toFixed(2);
    }
    
    setNewLog(updatedLog);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--gold)] mb-2">Mileage Tracker</h1>
            <p className="text-[var(--text-secondary)]">
              Track your fuel economy and driving costs
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 md:mt-0 flex items-center gap-2 px-6 py-3 bg-[var(--gold)] text-[#0d0d0d] rounded-lg hover:bg-[#d8b87f] transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add Fill-Up
          </button>
        </div>

        {/* Vehicle Selector */}
        <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-4 mb-6">
          <div className="flex items-center gap-4">
            <Car className="w-6 h-6 text-[var(--gold)]" />
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="flex-1 px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
            >
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-4">
            <div className="flex items-center gap-3 mb-2">
              <Gauge className="w-5 h-5 text-[var(--gold)]" />
              <span className="text-sm text-[var(--text-muted)]">Avg MPG</span>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{stats.avgMpg.toFixed(1)}</p>
          </div>

          <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-4">
            <div className="flex items-center gap-3 mb-2">
              <Fuel className="w-5 h-5 text-[var(--gold)]" />
              <span className="text-sm text-[var(--text-muted)]">Total Gallons</span>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{stats.totalGallons.toFixed(1)}</p>
          </div>

          <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-4">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-[var(--gold)]" />
              <span className="text-sm text-[var(--text-muted)]">Total Spent</span>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">${stats.totalCost.toFixed(2)}</p>
          </div>

          <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-4">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-[var(--gold)]" />
              <span className="text-sm text-[var(--text-muted)]">Cost/Mile</span>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">${stats.costPerMile.toFixed(3)}</p>
          </div>

          <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-4">
            <div className="flex items-center gap-3 mb-2">
              <Car className="w-5 h-5 text-[var(--gold)]" />
              <span className="text-sm text-[var(--text-muted)]">Total Miles</span>
            </div>
            <p className="text-2xl font-bold text-[var(--foreground)]">{stats.totalMiles.toLocaleString()}</p>
          </div>
        </div>

        {/* MPG Chart Visualization */}
        <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-6 mb-8">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">MPG Trend</h2>
          <div className="h-48 flex items-end justify-between gap-2">
            {fuelLogs.slice().reverse().map((log, index) => {
              const maxMpg = Math.max(...fuelLogs.filter(l => l.mpg).map(l => l.mpg || 0));
              const height = log.mpg ? (log.mpg / maxMpg) * 100 : 0;
              return (
                <div key={log.id} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-xs text-[var(--gold)] mb-1">{log.mpg || '-'}</span>
                    <div
                      className="w-full bg-gradient-to-t from-[var(--gold)] to-[#d8b87f] rounded-t transition-all"
                      style={{ height: `${height}%`, minHeight: log.mpg ? '20px' : '4px' }}
                    />
                  </div>
                  <span className="text-xs text-[var(--text-muted)] mt-2">
                    {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fuel Log Table */}
        <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border-color)]">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Fill-Up History</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--gold)]"></div>
            </div>
          ) : fuelLogs.length === 0 ? (
            <div className="p-8 text-center">
              <Fuel className="w-12 h-12 text-[var(--gold)] mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">No fill-ups recorded yet.</p>
              <p className="text-sm text-[var(--text-muted)] mt-2">Add your first fill-up to start tracking!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--background)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Odometer</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Gallons</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Price/Gal</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Total</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">MPG</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-secondary)]">Notes</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--text-secondary)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fuelLogs.map((log, index) => (
                    <tr key={log.id} className="border-t border-[var(--border-color)] hover:bg-[var(--background)]/50">
                      <td className="px-4 py-3 text-[var(--foreground)]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[var(--gold)]" />
                          {new Date(log.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--foreground)]">{log.odometer.toLocaleString()}</td>
                      <td className="px-4 py-3 text-[var(--foreground)]">{log.gallons.toFixed(2)}</td>
                      <td className="px-4 py-3 text-[var(--foreground)]">${log.pricePerGallon.toFixed(2)}</td>
                      <td className="px-4 py-3 text-[var(--foreground)] font-semibold">${log.totalCost.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        {log.mpg ? (
                          <span className={`font-semibold ${log.mpg >= stats.avgMpg ? 'text-green-400' : 'text-yellow-400'}`}>
                            {log.mpg.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-[var(--text-muted)]">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)] text-sm">{log.notes || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Fill-Up Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
              <h2 className="text-xl font-bold text-[var(--foreground)]">Add Fill-Up</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            
            <form onSubmit={handleAddLog} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newLog.date}
                  onChange={(e) => setNewLog({ ...newLog, date: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Odometer Reading
                </label>
                <input
                  type="number"
                  value={newLog.odometer}
                  onChange={(e) => setNewLog({ ...newLog, odometer: e.target.value })}
                  placeholder="e.g., 52500"
                  required
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Gallons
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={newLog.gallons}
                    onChange={(e) => handlePriceOrGallonsChange('gallons', e.target.value)}
                    placeholder="e.g., 12.5"
                    required
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Price per Gallon
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={newLog.pricePerGallon}
                    onChange={(e) => handlePriceOrGallonsChange('pricePerGallon', e.target.value)}
                    placeholder="e.g., 3.45"
                    required
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Total Cost
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newLog.totalCost}
                  onChange={(e) => setNewLog({ ...newLog, totalCost: e.target.value })}
                  placeholder="Auto-calculated"
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={newLog.notes}
                  onChange={(e) => setNewLog({ ...newLog, notes: e.target.value })}
                  placeholder="e.g., Highway driving"
                  className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:border-[var(--gold)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-[var(--gold)] text-[#0d0d0d] rounded-lg hover:bg-[#d8b87f] transition-colors font-semibold"
                >
                  Add Fill-Up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
