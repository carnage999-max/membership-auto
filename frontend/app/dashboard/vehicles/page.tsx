'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import vehicleService, { Vehicle, CreateVehicleData } from '@/lib/api/vehicleService';
import { uploadFile } from '@/lib/api/fileService';
import ConfirmDialog from '@/app/components/ConfirmDialog';
import { Car, Plus, Trash2, Edit2, X, AlertCircle, ArrowLeft, Camera, Upload } from 'lucide-react';

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<CreateVehicleData>({
    vin: '',
    make: '',
    model: '',
    year: undefined,
    trim: '',
    licensePlate: '',
    odometer: undefined,
    fuelType: 'gasoline',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; vehicleId: string | null; deleting: boolean }>({
    show: false,
    vehicleId: null,
    deleting: false,
  });
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await vehicleService.getVehicles();
      console.log('Loaded vehicles:', data);
      data.forEach(v => {
        if (v.photoUrl) console.log('Vehicle photo URL:', v.photoUrl);
      });
      setVehicles(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const vehicleData = { ...formData };
      
      // Upload image to S3 if selected
      if (selectedImage) {
        try {
          console.log('Uploading image:', selectedImage.name, selectedImage.type);
          const photoUrl = await uploadFile(selectedImage);
          console.log('Image uploaded successfully, URL:', photoUrl);
          vehicleData.photoUrl = photoUrl;
        } catch (uploadErr: any) {
          console.error('Image upload failed:', uploadErr);
          setError('Failed to upload image. Creating vehicle without photo.');
        }
      }
      
      console.log('Creating vehicle with data:', vehicleData);
      
      await vehicleService.createVehicle(vehicleData);
      setShowAddForm(false);
      setFormData({
        vin: '',
        make: '',
        model: '',
        year: undefined,
        trim: '',
        licensePlate: '',
        odometer: undefined,
        fuelType: 'gasoline',
      });
      setSelectedImage(null);
      setImagePreview(null);
      loadVehicles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add vehicle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm({ show: true, vehicleId: id, deleting: false });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.vehicleId) return;

    setDeleteConfirm({ ...deleteConfirm, deleting: true });

    try {
      await vehicleService.deleteVehicle(deleteConfirm.vehicleId);
      setDeleteConfirm({ show: false, vehicleId: null, deleting: false });
      loadVehicles();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete vehicle');
      setDeleteConfirm({ show: false, vehicleId: null, deleting: false });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ show: false, vehicleId: null, deleting: false });
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedVehicle(null);
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
            <h1 className="text-3xl font-bold text-white mb-2">My Vehicles</h1>
            <p className="text-[#B3B3B3]">Manage your vehicles and connected devices</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#CBA86E] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#B89860] transition-colors"
          >
            <Plus size={20} />
            Add Vehicle
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[#DD4A48]/10 border border-[#DD4A48] rounded-lg flex items-center gap-3">
            <AlertCircle className="text-[#DD4A48]" size={20} />
            <p className="text-[#DD4A48]">{error}</p>
          </div>
        )}

        {/* Add Vehicle Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1A1A1A] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#1A1A1A] border-b border-[#2A2A2A] p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Add New Vehicle</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-[#B3B3B3] hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[#B3B3B3] mb-2">VIN (Optional)</label>
                    <input
                      type="text"
                      value={formData.vin}
                      onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white focus:border-[#CBA86E] focus:outline-none"
                      placeholder="1HGBH41JXMN109186"
                    />
                  </div>

                  <div>
                    <label className="block text-[#B3B3B3] mb-2">Year</label>
                    <input
                      type="number"
                      value={formData.year || ''}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value ? parseInt(e.target.value) : undefined })}
                      className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white focus:border-[#CBA86E] focus:outline-none"
                      placeholder="2020"
                    />
                  </div>

                  <div>
                    <label className="block text-[#B3B3B3] mb-2">Make</label>
                    <input
                      type="text"
                      value={formData.make}
                      onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white focus:border-[#CBA86E] focus:outline-none"
                      placeholder="Toyota"
                    />
                  </div>

                  <div>
                    <label className="block text-[#B3B3B3] mb-2">Model</label>
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white focus:border-[#CBA86E] focus:outline-none"
                      placeholder="Camry"
                    />
                  </div>

                  <div>
                    <label className="block text-[#B3B3B3] mb-2">Trim (Optional)</label>
                    <input
                      type="text"
                      value={formData.trim}
                      onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white focus:border-[#CBA86E] focus:outline-none"
                      placeholder="SE"
                    />
                  </div>

                  <div>
                    <label className="block text-[#B3B3B3] mb-2">License Plate (Optional)</label>
                    <input
                      type="text"
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white focus:border-[#CBA86E] focus:outline-none"
                      placeholder="ABC1234"
                    />
                  </div>

                  <div>
                    <label className="block text-[#B3B3B3] mb-2">Current Odometer (Optional)</label>
                    <input
                      type="number"
                      value={formData.odometer || ''}
                      onChange={(e) => setFormData({ ...formData, odometer: e.target.value ? parseFloat(e.target.value) : undefined })}
                      className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white focus:border-[#CBA86E] focus:outline-none"
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <label className="block text-[#B3B3B3] mb-2">Fuel Type</label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                      className="w-full px-4 py-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-white focus:border-[#CBA86E] focus:outline-none"
                    >
                      <option value="gasoline">Gasoline</option>
                      <option value="diesel">Diesel</option>
                      <option value="electric">Electric</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                {/* Vehicle Photo/VIN Scanner */}
                <div className="pt-4">
                  <label className="block text-[#B3B3B3] mb-2">Vehicle Photo / VIN Scanner (Optional)</label>
                  <div className="border-2 border-dashed border-[#2A2A2A] rounded-lg p-6 text-center hover:border-[#CBA86E] transition-colors">
                    {imagePreview ? (
                      <div className="relative">
                        <Image
                          src={imagePreview}
                          alt="Vehicle preview"
                          width={400}
                          height={300}
                          className="mx-auto rounded-lg object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute top-2 right-2 p-2 bg-[#DD4A48] text-white rounded-full hover:bg-[#C43E3B] transition-colors"
                        >
                          <X size={16} />
                        </button>
                        <p className="text-[#B3B3B3] text-sm mt-3">
                          {selectedImage?.name}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="w-16 h-16 bg-[#CBA86E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Camera className="text-[#CBA86E]" size={32} />
                        </div>
                        <p className="text-white mb-2">Take a photo or upload image</p>
                        <p className="text-[#707070] text-sm mb-4">
                          Scan VIN from windshield, registration, or upload vehicle photo
                        </p>
                        <label className="inline-flex items-center gap-2 px-6 py-3 bg-[#CBA86E] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#B89860] transition-colors cursor-pointer">
                          <Upload size={20} />
                          Choose File
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleImageSelect}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                  <p className="text-[#707070] text-xs mt-2">
                    Tip: Take a clear photo of your VIN for easy reference
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-6 py-3 bg-[#0D0D0D] border border-[#2A2A2A] text-[#B3B3B3] font-semibold rounded-lg hover:border-[#CBA86E] hover:text-[#CBA86E] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-[#CBA86E] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#B89860] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Adding...' : 'Add Vehicle'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Vehicle List */}
        {vehicles.length === 0 ? (
          <div className="text-center py-16">
            <Car className="mx-auto text-[#707070] mb-4" size={64} />
            <h2 className="text-xl font-semibold text-white mb-2">No vehicles yet</h2>
            <p className="text-[#B3B3B3] mb-6">Add your first vehicle to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#CBA86E] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#B89860] transition-colors"
            >
              <Plus size={20} />
              Add Your First Vehicle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg overflow-hidden hover:border-[#CBA86E] transition-colors"
              >
                {/* Vehicle Photo */}
                {vehicle.photoUrl ? (
                  <div className="relative w-full h-48 bg-[#0D0D0D]">
                    <Image
                      src={vehicle.photoUrl}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        console.error('Image failed to load:', vehicle.photoUrl);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-[#0D0D0D] flex items-center justify-center">
                    <Car className="text-[#2A2A2A]" size={64} />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-[#CBA86E]/10 rounded-lg flex items-center justify-center">
                      <Car className="text-[#CBA86E]" size={24} />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(vehicle)}
                        className="p-2 text-[#B3B3B3] hover:text-[#CBA86E] transition-colors"
                        title="View Details"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(vehicle.id)}
                        className="p-2 text-[#B3B3B3] hover:text-[#DD4A48] transition-colors"
                        title="Delete Vehicle"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </h3>
                {vehicle.trim && (
                  <p className="text-[#CBA86E] mb-3">{vehicle.trim}</p>
                )}

                <div className="space-y-2 text-sm">
                  {vehicle.vin && (
                    <div className="flex justify-between">
                      <span className="text-[#707070]">VIN:</span>
                      <span className="text-[#B3B3B3]">{vehicle.vin.slice(-8)}</span>
                    </div>
                  )}
                  {vehicle.licensePlate && (
                    <div className="flex justify-between">
                      <span className="text-[#707070]">License:</span>
                      <span className="text-[#B3B3B3]">{vehicle.licensePlate}</span>
                    </div>
                  )}
                  {vehicle.odometer && (
                    <div className="flex justify-between">
                      <span className="text-[#707070]">Odometer:</span>
                      <span className="text-[#B3B3B3]">{vehicle.odometer.toLocaleString()} mi</span>
                    </div>
                  )}
                  {vehicle.fuelType && (
                    <div className="flex justify-between">
                      <span className="text-[#707070]">Fuel:</span>
                      <span className="text-[#B3B3B3] capitalize">{vehicle.fuelType}</span>
                    </div>
                  )}
                  </div>

                  {vehicle.dongleId && (
                    <div className="mt-4 pt-4 border-t border-[#2A2A2A]">
                      <div className="flex items-center gap-2 text-[#4CAF50]">
                        <div className="w-2 h-2 bg-[#4CAF50] rounded-full"></div>
                        <span className="text-sm">Device Connected</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vehicle Detail Modal */}
      {showDetailModal && selectedVehicle && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[#1A1A1A] rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#1A1A1A] border-b border-[#2A2A2A] p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Vehicle Details</h2>
              <button
                onClick={handleCloseDetail}
                className="text-[#B3B3B3] hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Vehicle Photo */}
              {selectedVehicle.photoUrl ? (
                <div className="relative w-full h-64 bg-[#0D0D0D] rounded-lg overflow-hidden mb-6">
                  <Image
                    src={selectedVehicle.photoUrl}
                    alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="w-full h-64 bg-[#0D0D0D] rounded-lg flex items-center justify-center mb-6">
                  <Car className="text-[#2A2A2A]" size={96} />
                </div>
              )}

              {/* Vehicle Info */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </h3>
                  {selectedVehicle.trim && (
                    <p className="text-[#CBA86E] text-lg">{selectedVehicle.trim}</p>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedVehicle.vin && (
                    <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-4">
                      <div className="text-[#707070] text-sm mb-1">VIN</div>
                      <div className="text-white font-mono text-sm break-all">{selectedVehicle.vin}</div>
                    </div>
                  )}

                  {selectedVehicle.licensePlate && (
                    <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-4">
                      <div className="text-[#707070] text-sm mb-1">License Plate</div>
                      <div className="text-white font-semibold">{selectedVehicle.licensePlate}</div>
                    </div>
                  )}

                  {selectedVehicle.odometer && (
                    <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-4">
                      <div className="text-[#707070] text-sm mb-1">Odometer</div>
                      <div className="text-white font-semibold">{selectedVehicle.odometer.toLocaleString()} miles</div>
                    </div>
                  )}

                  {selectedVehicle.fuelType && (
                    <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-4">
                      <div className="text-[#707070] text-sm mb-1">Fuel Type</div>
                      <div className="text-white font-semibold capitalize">{selectedVehicle.fuelType}</div>
                    </div>
                  )}
                </div>

                {/* Dongle Status */}
                {selectedVehicle.dongleId && (
                  <div className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-[#4CAF50] rounded-full"></div>
                      <span className="text-white font-semibold">OBD Device Connected</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[#707070]">Device ID:</span>
                        <span className="text-[#B3B3B3] font-mono">{selectedVehicle.dongleId}</span>
                      </div>
                      {selectedVehicle.dongleConnectionType && (
                        <div className="flex justify-between">
                          <span className="text-[#707070]">Connection Type:</span>
                          <span className="text-[#B3B3B3]">{selectedVehicle.dongleConnectionType}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div className="text-[#707070] text-sm">
                  Added on {new Date(selectedVehicle.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6 pt-6 border-t border-[#2A2A2A]">
                <button
                  onClick={handleCloseDetail}
                  className="flex-1 px-6 py-3 bg-[#0D0D0D] border border-[#2A2A2A] text-white rounded-lg hover:bg-[#1A1A1A] transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleCloseDetail();
                    handleDeleteClick(selectedVehicle.id);
                  }}
                  className="px-6 py-3 bg-[#DD4A48] text-white rounded-lg hover:bg-[#C43E3B] transition-colors"
                >
                  Delete Vehicle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.show}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={deleteConfirm.deleting}
      />
    </div>
  );
}
