'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, CreditCard, Bell, Lock, Save, Edit2, X } from 'lucide-react';
import { tokenStorage } from '@/lib/auth/tokenStorage';
import ConfirmDialog from '@/app/components/ConfirmDialog';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  membershipId: string;
  membershipPlan: string;
  membershipStatus: string;
  renewalDate: string;
  monthlyFee: number;
  canCancel?: boolean;
  canReactivate?: boolean;
  autoRenew?: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    membershipId: '',
    membershipPlan: '',
    membershipStatus: 'active',
    renewalDate: '',
    monthlyFee: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    smsNotifications: true,
    appointmentReminders: true,
    serviceAlerts: true,
    offerNotifications: true,
    referralUpdates: true,
  });

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelStatus, setCancelStatus] = useState<'idle' | 'cancelling' | 'success' | 'error'>('idle');
  const [cancelError, setCancelError] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const userProfile: UserProfile = {
          name: data.name || `${data.first_name} ${data.last_name}`.trim(),
          email: data.email,
          phone: data.phone || '',
          membershipId: data.membership_id || 'N/A',
          membershipPlan: data.membership_plan,
          membershipStatus: data.membership_status || 'No Active Membership',
          renewalDate: data.renewal_date,
          monthlyFee: data.monthly_fee || 0,
        };
        setProfile(userProfile);
        setEditedProfile(userProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedProfile(profile);
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const token = tokenStorage.getAccessToken();
      const [firstName, ...lastNameParts] = editedProfile.name.split(' ');
      const lastName = lastNameParts.join(' ');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/profile/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          phone: editedProfile.phone,
        }),
      });

      if (response.ok) {
        setProfile(editedProfile);
        setSaveStatus('success');
        setIsEditing(false);
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveStatus('error');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setPasswordStatus('saving');
    try {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/change-password/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          old_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordStatus('success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordStatus('idle'), 3000);
      } else {
        const data = await response.json();
        setPasswordError(data.error || 'Failed to change password');
        setPasswordStatus('error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('An error occurred. Please try again.');
      setPasswordStatus('error');
    }
  };

  const handleCancelMembership = async () => {
    setCancelStatus('cancelling');
    setCancelError('');
    
    try {
      const token = tokenStorage.getAccessToken();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/users/cancel-membership/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            reason: cancelReason,
          }),
        }
      );

      if (response.ok) {
        setCancelStatus('success');
        setShowCancelDialog(false);
        // Refresh profile to show updated status
        setTimeout(() => {
          fetchProfile();
          setCancelStatus('idle');
        }, 2000);
      } else {
        const data = await response.json();
        setCancelError(data.error || 'Failed to cancel membership');
        setCancelStatus('error');
      }
    } catch (error) {
      console.error('Error cancelling membership:', error);
      setCancelError('An error occurred. Please try again.');
      setCancelStatus('error');
    }
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const downloadMembershipCard = () => {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // Set background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw gold border
    ctx.strokeStyle = '#CBA86E';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    // Draw top accent bar
    ctx.fillStyle = '#CBA86E';
    ctx.fillRect(0, 0, canvas.width, 60);

    // Load and draw logo
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.src = '/images/logo.jpeg';
    
    logoImg.onload = () => {
      // Draw logo on the top-left of the accent bar
      ctx.save();
      ctx.beginPath();
      ctx.arc(25, 30, 20, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(logoImg, 5, 10, 40, 40);
      ctx.restore();

      // Draw company name
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Membership Auto', canvas.width / 2, 42);

      // Draw main content
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Member ID', 40, 120);

      ctx.fillStyle = '#CBA86E';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(profile.membershipId, 40, 160);

      // Draw member name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Name', 40, 200);

      ctx.fillStyle = '#B3B3B3';
      ctx.font = '14px Arial';
      ctx.fillText(profile.name || 'Member Name', 40, 225);

      // Draw plan info
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Plan', 40, 260);

      ctx.fillStyle = '#B3B3B3';
      ctx.font = '14px Arial';
      ctx.fillText(`${profile.membershipPlan} - $${profile.monthlyFee}/month`, 40, 285);

      // Draw expiry date
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Expires', 40, 320);

      ctx.fillStyle = '#B3B3B3';
      ctx.font = '14px Arial';
      const expiryDate = profile.renewalDate
        ? new Date(profile.renewalDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'N/A';
      ctx.fillText(expiryDate, 40, 345);

      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `membership-card-${profile.membershipId}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    logoImg.onerror = () => {
      // If logo fails to load, continue without it
      // Draw company name
      ctx.fillStyle = '#1a1a1a';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Membership Auto', canvas.width / 2, 42);

      // Draw main content
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'left';
      ctx.fillText('Member ID', 40, 120);

      ctx.fillStyle = '#CBA86E';
      ctx.font = 'bold 28px Arial';
      ctx.fillText(profile.membershipId, 40, 160);

      // Draw member name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Name', 40, 200);

      ctx.fillStyle = '#B3B3B3';
      ctx.font = '14px Arial';
      ctx.fillText(profile.name || 'Member Name', 40, 225);

      // Draw plan info
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Plan', 40, 260);

      ctx.fillStyle = '#B3B3B3';
      ctx.font = '14px Arial';
      ctx.fillText(`${profile.membershipPlan} - $${profile.monthlyFee}/month`, 40, 285);

      // Draw expiry date
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px Arial';
      ctx.fillText('Expires', 40, 320);

      ctx.fillStyle = '#B3B3B3';
      ctx.font = '14px Arial';
      const expiryDate = profile.renewalDate
        ? new Date(profile.renewalDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : 'N/A';
      ctx.fillText(expiryDate, 40, 345);

      // Download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `membership-card-${profile.membershipId}.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    };
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--gold)] mb-8">Account Settings</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2">
                  <User className="w-6 h-6 text-[var(--gold)]" />
                  Personal Information
                </h2>
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-[#0d0d0d] rounded-lg hover:bg-[#d8b87f] transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--surface)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg hover:border-[var(--gold)] transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-[#0d0d0d] rounded-lg hover:bg-[#d8b87f] transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      {saveStatus === 'saving' ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {saveStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded-lg text-green-400 text-sm">
                  Profile updated successfully!
                </div>
              )}

              {saveStatus === 'error' && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm">
                  Failed to update profile. Please try again.
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={isEditing ? editedProfile.name : profile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--text-secondary)] opacity-50"
                  />
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    Email cannot be changed. Contact support for assistance.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={isEditing ? editedProfile.phone : profile.phone}
                    onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                    disabled={!isEditing}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-6">
              <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2 mb-6">
                <Lock className="w-6 h-6 text-[var(--gold)]" />
                Change Password
              </h2>

              {passwordStatus === 'success' && (
                <div className="mb-4 p-3 bg-green-900/20 border border-green-500 rounded-lg text-green-400 text-sm">
                  Password changed successfully!
                </div>
              )}

              {passwordError && (
                <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-lg text-red-400 text-sm">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-[var(--background)] border border-[var(--border-color)] rounded-lg text-[var(--foreground)] focus:border-[var(--gold)] focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordStatus === 'saving'}
                  className="w-full px-6 py-3 bg-[var(--gold)] text-[#0d0d0d] rounded-lg font-semibold hover:bg-[#d8b87f] transition-colors disabled:opacity-50"
                >
                  {passwordStatus === 'saving' ? 'Changing Password...' : 'Change Password'}
                </button>
              </form>
            </div>

            {/* Notification Preferences */}
            <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-6">
              <h2 className="text-xl font-bold text-[var(--foreground)] flex items-center gap-2 mb-6">
                <Bell className="w-6 h-6 text-[var(--gold)]" />
                Notification Preferences
              </h2>

              <div className="space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-[var(--border-color)] last:border-0">
                    <div>
                      <p className="text-[var(--foreground)] font-medium">
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-sm text-[var(--text-muted)] mt-1">
                        {key === 'emailNotifications' && 'Receive updates via email'}
                        {key === 'smsNotifications' && 'Receive updates via SMS'}
                        {key === 'appointmentReminders' && 'Get reminders before appointments'}
                        {key === 'serviceAlerts' && 'Alerts for upcoming service needs'}
                        {key === 'offerNotifications' && 'Special offers and promotions'}
                        {key === 'referralUpdates' && 'Updates on your referrals'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle(key as keyof typeof notifications)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        value ? 'bg-[var(--gold)]' : 'bg-[var(--border-color)]'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          value ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Membership Details Sidebar */}
          <div className="space-y-6">
            {/* Membership Card */}
            {profile.membershipStatus === 'No Active Membership' ? (
              <div className="bg-gradient-to-br from-[var(--gold)] to-[#a88850] rounded-lg p-6 text-[#0d0d0d]">
                <h3 className="text-lg font-bold mb-4">Membership Details</h3>
                <div className="space-y-3">
                  <p className="text-sm opacity-80">You don't have an active membership yet.</p>
                  <p className="text-xs opacity-70 mb-4">
                    Upgrade to a membership plan to unlock exclusive benefits and services.
                  </p>
                  <a href="/plans" className="block w-full px-4 py-2 bg-[#0d0d0d] text-[var(--gold)] font-semibold rounded-lg hover:bg-opacity-90 transition-colors text-center">
                    View Membership Plans
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[var(--gold)] to-[#a88850] rounded-lg p-6 text-[#0d0d0d]">
                <h3 className="text-lg font-bold mb-4">Membership Details</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs opacity-80">Member ID</p>
                    <p className="font-mono font-bold">{profile.membershipId}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-80">Plan</p>
                    <p className="text-2xl font-bold">{profile.membershipPlan}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-80">Status</p>
                    <p className="font-semibold capitalize">{profile.membershipStatus}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-80">Monthly Fee</p>
                    <p className="text-xl font-bold">${profile.monthlyFee}/mo</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-80">Next Renewal</p>
                    <p className="font-semibold">{profile.renewalDate ? new Date(profile.renewalDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Information */}
            <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-[var(--gold)]" />
                Billing Information
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-[var(--background)] rounded-lg border border-[var(--border-color)] text-center">
                  <p className="text-[var(--text-muted)] text-sm mb-3">
                    Billing management is coming soon!
                  </p>
                  <p className="text-[var(--text-secondary)] text-xs mb-4">
                    For now, manage your billing through your membership dashboard.
                  </p>
                  <button className="w-full px-4 py-2 border border-[var(--gold)] text-[var(--gold)] rounded-lg hover:bg-[var(--gold)] hover:text-[#0d0d0d] transition-colors">
                    View Billing History
                  </button>
                </div>
                <p className="text-xs text-[var(--text-muted)] text-center">
                  Full billing management features coming in the next update
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[var(--surface)] rounded-lg border border-[var(--border-color)] p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {profile.membershipStatus !== 'No Active Membership' && (
                  <button
                    onClick={downloadMembershipCard}
                    className="w-full px-4 py-2 text-left text-[var(--text-secondary)] hover:text-[var(--gold)] hover:bg-[var(--background)] rounded transition-colors"
                  >
                    Download Membership Card
                  </button>
                )}
                <button className="w-full px-4 py-2 text-left text-[var(--text-secondary)] hover:text-[var(--gold)] hover:bg-[var(--background)] rounded transition-colors">
                  Contact Support
                </button>
                {profile.canCancel && (
                  <button 
                    onClick={() => setShowCancelDialog(true)}
                    className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-900/20 rounded transition-colors"
                  >
                    Cancel Membership
                  </button>
                )}
                {profile.canReactivate && (
                  <button className="w-full px-4 py-2 text-left text-[var(--gold)] hover:bg-[var(--gold)]/10 rounded transition-colors">
                    Reactivate Membership
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Membership Dialog */}
        <ConfirmDialog
          isOpen={showCancelDialog}
          onClose={() => {
            setShowCancelDialog(false);
            setCancelError('');
            setCancelReason('');
          }}
          onConfirm={handleCancelMembership}
          title="Cancel Membership?"
          message="Are you sure you want to cancel your membership? You will lose access to all benefits immediately."
          isLoading={cancelStatus === 'cancelling'}
          isDangerous={true}
        />
      </div>
    </div>
  );
}
