'use client';

import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Lock, User, Database, Save, Mail, Shield, Activity, Server, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function SettingsPage() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    appointmentReminders: true,
    systemUpdates: false,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [systemStatus, setSystemStatus] = useState({
    database: 'healthy',
    api: 'online',
    lastBackup: new Date().toISOString(),
  });

  useEffect(() => {
    loadAdminData();
    checkSystemStatus();
  }, []);

  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/settings/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAdminData({
          name: data.name || 'Admin User',
          email: data.email || 'admin@membershipauto.com',
        });
        setNotifications(data.notifications || {
          emailAlerts: true,
          appointmentReminders: true,
          systemUpdates: false,
        });
      } else {
        // Fallback to localStorage
        const email = localStorage.getItem('adminEmail') || 'admin@membershipauto.com';
        setAdminData({
          name: 'Admin User',
          email: email,
        });
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      // Fallback to localStorage
      const email = localStorage.getItem('adminEmail') || 'admin@membershipauto.com';
      setAdminData({
        name: 'Admin User',
        email: email,
      });
    }
  };

  const checkSystemStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/system/status/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSystemStatus(data);
      }
    } catch (error) {
      console.log('System status check failed');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/settings/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: adminData.name,
          email: adminData.email,
          notifications: notifications,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess('Settings saved successfully!');
        localStorage.setItem('adminEmail', adminData.email);
        // Reload data to confirm changes
        await loadAdminData();
        // Notify other components (like sidebar) to refresh
        window.dispatchEvent(new Event('adminSettingsUpdated'));
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(errorData.error || 'Failed to save settings. Please try again.');
      }
    } catch (error) {
      showError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showWarning('Passwords do not match. Please try again.');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showWarning('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/change-password/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          old_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        showSuccess('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to change password. Please check your current password.');
      }
    } catch (error) {
      showError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    setLoading(true);
    showInfo('Starting database backup...');

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/system/backup/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess(`Database backup completed successfully! File: ${data.filename || 'backup file created'}`);
        checkSystemStatus();
      } else {
        const errorData = await response.json().catch(() => ({}));
        showError(errorData.error || 'Failed to create database backup. Please try again.');
      }
    } catch (error) {
      showError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-text-secondary">Manage admin dashboard preferences and configuration</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg border flex items-center space-x-3 ${
          message.type === 'success' 
            ? 'border-success bg-surface' 
            : 'border-error bg-surface'
        }`}>
          {message.type === 'success' ? (
            <Check className="w-5 h-5 text-success" />
          ) : (
            <AlertCircle className="w-5 h-5 text-error" />
          )}
          <span className={message.type === 'success' ? 'text-success' : 'text-error'}>
            {message.text}
          </span>
        </div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Account Settings */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-8 h-8 text-gold" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Account Settings</h2>
              <p className="text-sm text-text-secondary">Manage your admin account details</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={adminData.name}
                onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="email"
                  value={adminData.email}
                  readOnly
                  disabled
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-lg text-text-secondary cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-text-muted mt-1">Email address cannot be changed</p>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-8 h-8 text-info" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
              <p className="text-sm text-text-secondary">Configure notification preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium text-foreground">Email Alerts</div>
                <div className="text-sm text-text-secondary">Receive alerts via email</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})}
                className="w-5 h-5 text-gold rounded focus:ring-gold"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium text-foreground">Appointment Reminders</div>
                <div className="text-sm text-text-secondary">Get notified about upcoming appointments</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.appointmentReminders}
                onChange={(e) => setNotifications({...notifications, appointmentReminders: e.target.checked})}
                className="w-5 h-5 text-gold rounded focus:ring-gold"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="font-medium text-foreground">System Updates</div>
                <div className="text-sm text-text-secondary">Notifications about system maintenance</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.systemUpdates}
                onChange={(e) => setNotifications({...notifications, systemUpdates: e.target.checked})}
                className="w-5 h-5 text-gold rounded focus:ring-gold"
              />
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-8 h-8 text-error" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">Security</h2>
              <p className="text-sm text-text-secondary">Manage password and security settings</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Current Password
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  placeholder="Enter new password (min 8 characters)"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
              className="px-4 py-2 border border-error text-error rounded-lg hover:bg-surface transition-colors disabled:opacity-50"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-8 h-8 text-warning" />
            <div>
              <h2 className="text-lg font-semibold text-foreground">System</h2>
              <p className="text-sm text-text-secondary">Platform configuration and maintenance</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-background rounded-lg">
              <div className="flex items-center space-x-2">
                <Server className="w-5 h-5 text-text-secondary" />
                <div>
                  <div className="font-medium text-foreground">Database Status</div>
                  <div className="text-sm text-text-secondary">Last backup: {new Date(systemStatus.lastBackup).toLocaleString()}</div>
                </div>
              </div>
              <span className="px-3 py-1 border border-success text-success rounded-full text-sm font-medium flex items-center space-x-1">
                <Activity className="w-4 h-4" />
                <span>{systemStatus.database}</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-background rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-text-secondary" />
                <div>
                  <div className="font-medium text-foreground">API Status</div>
                  <div className="text-sm text-text-secondary">All services operational</div>
                </div>
              </div>
              <span className="px-3 py-1 border border-success text-success rounded-full text-sm font-medium flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>{systemStatus.api}</span>
              </span>
            </div>

            <button
              onClick={handleBackup}
              disabled={loading}
              className="w-full px-4 py-2 border border-warning text-warning rounded-lg hover:bg-surface transition-colors disabled:opacity-50"
            >
              {loading ? 'Running Backup...' : 'Run Database Backup'}
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-gold text-background rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
