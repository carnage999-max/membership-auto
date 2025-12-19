'use client';

import { useState, useEffect } from 'react';
import { Car, Search, Calendar, Wrench, AlertTriangle, CheckCircle, X, User, Mail, Phone } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  vin: string;
  license_plate: string;
  photo_url: string | null;
  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  health_status: string;
  last_service: string;
  created_at: string;
}

export default function VehiclesPage() {
  const { showSuccess, showError } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/vehicles/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const vehiclesData = data.results || data;
        setVehicles(Array.isArray(vehiclesData) ? vehiclesData : []);
      } else {
        showError('Failed to load vehicles. Please refresh the page.');
        setVehicles([]);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
      showError('Network error. Please check your connection and try again.');
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = Array.isArray(vehicles) ? vehicles.filter(vehicle =>
    `${vehicle.make} ${vehicle.model} ${vehicle.year}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.owner?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const getHealthBadge = (status: string) => {
    const config: Record<string, { color: string; icon: any; label: string }> = {
      good: { color: 'text-success border-success', icon: CheckCircle, label: 'Good' },
      warning: { color: 'text-warning border-warning', icon: AlertTriangle, label: 'Needs Attention' },
      critical: { color: 'text-error border-error', icon: AlertTriangle, label: 'Critical' },
    };
    const { color, icon: Icon, label } = config[status] || config.good;
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Vehicles</h1>
          <p className="text-text-secondary">Manage member vehicles and maintenance records</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <Car className="w-4 h-4" />
          <span>{filteredVehicles.length} vehicles</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search by make, model, VIN, license plate, or owner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      {/* Vehicles Grid */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <Car className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? 'No vehicles found' : 'No vehicles yet'}
          </h3>
          <p className="text-text-secondary">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : 'Vehicles will appear here when members add them.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <div 
              key={vehicle.id} 
              onClick={() => {
                setSelectedVehicle(vehicle);
                setShowModal(true);
              }}
              className="bg-surface border border-border rounded-lg overflow-hidden hover:border-gold transition-colors cursor-pointer"
            >
              {/* Vehicle Image */}
              <div className="relative w-full h-40 bg-background">
                {vehicle.photo_url ? (
                  <img 
                    src={vehicle.photo_url} 
                    alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-background">
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
                {vehicle.health_status && (
                  <div className="absolute top-2 right-2">
                    {getHealthBadge(vehicle.health_status)}
                  </div>
                )}
              </div>

              {/* Vehicle Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="font-semibold text-foreground text-lg">
                    {vehicle.year} {vehicle.make}
                  </h3>
                  <p className="text-sm text-text-secondary">{vehicle.model}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">License:</span>
                    <span className="text-foreground font-mono">{vehicle.license_plate || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Owner:</span>
                    <span className="text-foreground">{vehicle.owner?.name || 'N/A'}</span>
                  </div>
                  {vehicle.last_service && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                      <Wrench className="w-4 h-4" />
                      <span>Last service: {new Date(vehicle.last_service).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicle Detail Modal */}
      {showModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface">
              <h2 className="text-xl font-bold text-foreground">
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Vehicle Image */}
              <div className="relative w-full h-64 bg-background rounded-lg overflow-hidden">
                {selectedVehicle.photo_url ? (
                  <img 
                    src={selectedVehicle.photo_url} 
                    alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-24 h-24 text-text-muted" />
                  </div>
                )}
              </div>

              {/* Vehicle Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Vehicle Information</h3>
                  
                  <div>
                    <label className="text-sm text-text-muted">Make & Model</label>
                    <p className="text-foreground font-medium">{selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</p>
                  </div>

                  <div>
                    <label className="text-sm text-text-muted">Color</label>
                    <p className="text-foreground capitalize">{selectedVehicle.color || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="text-sm text-text-muted">License Plate</label>
                    <p className="text-foreground font-mono">{selectedVehicle.license_plate || 'N/A'}</p>
                  </div>

                  <div>
                    <label className="text-sm text-text-muted">VIN</label>
                    <p className="text-foreground font-mono text-sm break-all">{selectedVehicle.vin || 'N/A'}</p>
                  </div>

                  {selectedVehicle.health_status && (
                    <div>
                      <label className="text-sm text-text-muted">Health Status</label>
                      <div className="mt-1">
                        {getHealthBadge(selectedVehicle.health_status)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground mb-3">Owner Information</h3>
                  
                  <div className="bg-background rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gold" />
                      <div>
                        <label className="text-xs text-text-muted">Name</label>
                        <p className="text-foreground font-medium">{selectedVehicle.owner?.name || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gold" />
                      <div>
                        <label className="text-xs text-text-muted">Email</label>
                        <p className="text-foreground">{selectedVehicle.owner?.email || 'N/A'}</p>
                      </div>
                    </div>

                    {selectedVehicle.owner?.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gold" />
                        <div>
                          <label className="text-xs text-text-muted">Phone</label>
                          <p className="text-foreground">{selectedVehicle.owner.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedVehicle.last_service && (
                    <div>
                      <label className="text-sm text-text-muted">Last Service</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Wrench className="w-4 h-4 text-gold" />
                        <p className="text-foreground">{new Date(selectedVehicle.last_service).toLocaleDateString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-background border border-border rounded-lg text-foreground hover:bg-opacity-80 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
