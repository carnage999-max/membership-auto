'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Search, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react';
import ConfirmModal from '@/components/ConfirmModal';

interface Offer {
  id: string;
  title: string;
  description: string;
  discount_type: string;
  discount_value: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  redemption_count: number;
  max_redemptions: number;
}

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    valid_from: '',
    valid_until: '',
    max_redemptions: '',
    is_active: true,
  });

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/offers/`, {
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const offersData = data.results || data;
        setOffers(Array.isArray(offersData) ? offersData : []);
      }
    } catch (error) {
      console.error('Error loading offers:', error);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOffers = Array.isArray(offers) ? offers.filter(offer =>
    offer.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  const openCreateModal = () => {
    setEditingOffer(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      title: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      valid_from: today,
      valid_until: '',
      max_redemptions: '',
      is_active: true,
    });
    setShowModal(true);
  };

  const openEditModal = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      discount_type: offer.discount_type,
      discount_value: offer.discount_value.toString(),
      valid_from: offer.valid_from.split('T')[0],
      valid_until: offer.valid_until.split('T')[0],
      max_redemptions: offer.max_redemptions?.toString() || '',
      is_active: offer.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingOffer
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/offers/${editingOffer.id}/`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/offers/`;
      
      const response = await fetch(url, {
        method: editingOffer ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          discount_value: parseFloat(formData.discount_value),
          max_redemptions: formData.max_redemptions ? parseInt(formData.max_redemptions) : null,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        loadOffers();
      } else {
        console.error('Failed to save offer');
      }
    } catch (error) {
      console.error('Error saving offer:', error);
    }
  };

  const openDeleteConfirmation = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    setOfferToDelete(offer || null);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    if (!offerToDelete) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/offers/${offerToDelete.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        loadOffers();
      } else {
        console.error('Failed to delete offer');
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
    }
  };

  const toggleOfferStatus = async (offerId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/offers/${offerId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        loadOffers();
      }
    } catch (error) {
      console.error('Error toggling offer status:', error);
    }
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Offers & Promotions</h1>
          <p className="text-text-secondary">Create and manage promotional offers</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-background rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Offer
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search offers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </div>

      {/* Offers List */}
      {filteredOffers.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <Tag className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchTerm ? 'No offers found' : 'No offers yet'}
          </h3>
          <p className="text-text-secondary mb-6">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : 'Create your first promotional offer to get started.'}
          </p>
          {!searchTerm && (
            <button className="flex items-center gap-2 px-6 py-3 bg-gold text-background rounded-lg hover:bg-opacity-90 transition-colors mx-auto">
              <Plus className="w-4 h-4" />
              Create First Offer
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map((offer) => (
            <div key={offer.id} className="bg-surface border border-border rounded-lg p-6 hover:border-gold transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {offer.title}
                  </h3>
                  <p className="text-sm text-text-secondary line-clamp-2">
                    {offer.description}
                  </p>
                </div>
                <button
                  onClick={() => toggleOfferStatus(offer.id, offer.is_active)}
                  className={`p-2 rounded-lg border transition-colors ${
                    offer.is_active 
                      ? 'border-success text-success hover:bg-success hover:bg-opacity-10' 
                      : 'border-error text-error hover:bg-error hover:bg-opacity-10'
                  }`}
                >
                  {offer.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Discount:</span>
                  <span className="text-foreground font-semibold">
                    {offer.discount_type === 'percentage' ? `${offer.discount_value}%` : `$${offer.discount_value}`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Redemptions:</span>
                  <span className="text-foreground">
                    {offer.redemption_count || 0} / {offer.max_redemptions || '∞'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Valid Until:</span>
                  <span className="text-foreground">
                    {new Date(offer.valid_until).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-border">
                <button 
                  onClick={() => openEditModal(offer)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-background rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  <Edit className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-foreground">Edit</span>
                </button>
                <button 
                  onClick={() => openDeleteConfirmation(offer.id)}
                  className="px-3 py-2 border border-error text-error rounded-lg hover:bg-error hover:bg-opacity-10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-border rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-surface">
              <h2 className="text-xl font-bold text-foreground">
                {editingOffer ? 'Edit Offer' : 'Create New Offer'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Offer Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    placeholder="e.g., Summer Sale - 20% Off"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    rows={3}
                    placeholder="Describe the offer details..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Discount Type *
                    </label>
                    <select
                      required
                      value={formData.discount_type}
                      onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.discount_value}
                      onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder={formData.discount_type === 'percentage' ? 'e.g., 20' : 'e.g., 50'}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Valid From *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.valid_from}
                      onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Valid Until *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Max Redemptions
                    </label>
                    <input
                      type="number"
                      value={formData.max_redemptions}
                      onChange={(e) => setFormData({ ...formData, max_redemptions: e.target.value })}
                      className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 text-gold bg-background border-border rounded focus:ring-gold"
                      />
                      <span className="text-sm font-medium text-foreground">Active</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-background border border-border rounded-lg text-foreground hover:bg-opacity-80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gold text-background rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  {editingOffer ? 'Save Changes' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title="Delete Offer"
        message={`Are you sure you want to delete "${offerToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
