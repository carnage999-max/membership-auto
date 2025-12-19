'use client';

// Prevent static generation for this dynamic page
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import offerService, { Offer } from '@/lib/api/offerService';
import vehicleService, { Vehicle } from '@/lib/api/vehicleService';
import { Tag, Calendar, AlertCircle, Sparkles, ArrowLeft } from 'lucide-react';

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (vehicles.length > 0) {
      loadOffers(selectedVehicle);
    }
  }, [selectedVehicle]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vehiclesData] = await Promise.all([vehicleService.getVehicles()]);
      setVehicles(vehiclesData);
      await loadOffers();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadOffers = async (vehicleId?: string) => {
    try {
      const data = await offerService.getOffers(vehicleId);
      setOffers(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load offers');
    }
  };

  const handleBookOffer = (offerId: string) => {
    // Navigate to appointments page with offer pre-selected
    router.push(`/dashboard/appointments?offerId=${offerId}`);
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.ceil(
      (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Special Offers</h1>
          <p className="text-[#B3B3B3]">Exclusive deals for our members</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-[#DD4A48]/10 border border-[#DD4A48] rounded-lg flex items-center gap-3">
            <AlertCircle className="text-[#DD4A48]" size={20} />
            <p className="text-[#DD4A48]">{error}</p>
          </div>
        )}

        {/* Filter by Vehicle */}
        {vehicles.length > 0 && (
          <div className="mb-6">
            <label className="block text-[#B3B3B3] mb-2">Filter by Vehicle</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full max-w-md px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-white focus:border-[#CBA86E] focus:outline-none"
            >
              <option value="">All Offers</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Offers Grid */}
        {offers.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="mx-auto text-[#707070] mb-4" size={64} />
            <h2 className="text-xl font-semibold text-white mb-2">No offers available</h2>
            <p className="text-[#B3B3B3]">Check back later for exclusive deals</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => {
              const expired = isExpired(offer.expiry);
              const daysLeft = getDaysUntilExpiry(offer.expiry);
              const urgentOffer = daysLeft <= 7 && !expired;

              return (
                <div
                  key={offer.id}
                  className={`bg-[#1A1A1A] border rounded-lg p-6 transition-all ${
                    expired
                      ? 'border-[#4A4A4A] opacity-60'
                      : urgentOffer
                      ? 'border-[#FFB74D] hover:border-[#CBA86E]'
                      : 'border-[#2A2A2A] hover:border-[#CBA86E]'
                  }`}
                >
                  {/* Offer Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-[#CBA86E]/10 rounded-lg flex items-center justify-center">
                      <Sparkles className="text-[#CBA86E]" size={24} />
                    </div>
                    {urgentOffer && (
                      <span className="px-3 py-1 bg-[#FFB74D]/10 text-[#FFB74D] text-xs font-semibold rounded-full">
                        Ends Soon!
                      </span>
                    )}
                    {expired && (
                      <span className="px-3 py-1 bg-[#DD4A48]/10 text-[#DD4A48] text-xs font-semibold rounded-full">
                        Expired
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-white mb-3">{offer.title}</h3>
                  <p className="text-[#B3B3B3] mb-4 text-sm leading-relaxed">
                    {offer.description}
                  </p>

                  {/* Terms */}
                  {offer.terms && (
                    <div className="mb-4 p-3 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg">
                      <p className="text-[#707070] text-xs">{offer.terms}</p>
                    </div>
                  )}

                  {/* Expiry Date */}
                  <div className="flex items-center gap-2 text-sm text-[#B3B3B3] mb-4">
                    <Calendar size={16} />
                    <span>
                      {expired
                        ? `Expired ${new Date(offer.expiry).toLocaleDateString()}`
                        : `Valid until ${new Date(offer.expiry).toLocaleDateString()}`}
                    </span>
                  </div>

                  {/* Eligible Memberships */}
                  {offer.eligibleMemberships && offer.eligibleMemberships.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[#707070] text-xs mb-2">Eligible Plans:</p>
                      <div className="flex flex-wrap gap-2">
                        {offer.eligibleMemberships.map((tier, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-[#CBA86E]/10 text-[#CBA86E] text-xs rounded-full capitalize"
                          >
                            {tier}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {!expired && (
                    <button
                      onClick={() => handleBookOffer(offer.id)}
                      className="w-full px-6 py-3 bg-[#CBA86E] text-[#0D0D0D] font-semibold rounded-lg hover:bg-[#B89860] transition-colors"
                    >
                      Book Now
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
