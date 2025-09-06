import React, { useState, useEffect } from 'react';
import { User, Settings as SettingsIcon, Bell, Shield, Database, Palette, Globe, Zap, Key, Download, Upload, Trash2, Save, Edit, Eye, EyeOff, Slack, Mail, Calendar, Github, Chrome, Smartphone, Monitor, Moon, Sun, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { 
  settingsService,
  UserProfile,
  UserPreferences,
  UserIntegration,
  NotificationSetting,
  UserSession,
  ActivityLog
} from './services/settingsService';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'integrations' | 'notifications' | 'security' | 'data' | 'appearance'>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);

  // Data states
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    email: '',
    role: 'Product Owner',
    department: '',
    timezone: 'Europe/Brussels',
    language: 'English'
  });

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    compact_mode: false,
    auto_save: true,
    smart_suggestions: true,
    dashboard_layout: 'overview_first',
    priority_view: 'matrix_view',
    items_per_page: 25,
    theme: 'light',
    sidebar_collapsed: false,
    show_tooltips: true,
    date_format: 'MM/DD/YYYY',
    time_format: '24h',
    default_priority_level: 'medium',
    default_meeting_duration: 60
  });

  const [integrations, setIntegrations] = useState<UserIntegration[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load all settings data
  const loadSettingsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        profile,
        preferences,
        integrationsData,
        notifications,
        sessions,
        activity
      ] = await Promise.all([
        settingsService.getUserProfile(),
        settingsService.getUserPreferences(),
        settingsService.getUserIntegrations(),
        settingsService.getNotificationSettings(),
        settingsService.getUserSessions(),
        settingsService.getActivityLog(20)
      ]);

      if (profile) setUserProfile(profile);
      if (preferences) setUserPreferences(preferences);
      setIntegrations(integrationsData);
      setNotificationSettings(notifications);
      setUserSessions(sessions);
      setActivityLog(activity);

    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettingsData();

    // Subscribe to real-time changes
    const unsubscribe = settingsService.subscribeToSettingsChanges(() => {
      loadSettingsData();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Helper functions
  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  // Profile update handlers
const updateUserProfile = (field: keyof UserProfile, value: string) => {
  setUserProfile(prev => ({
    ...prev,
    [field]: value
  }));
};

  const saveProfile = async () => {
    try {
      setSaving(true);
      const result = await settingsService.updateUserProfile(userProfile);
      if (result) {
        showSuccess('Profile updated successfully');
      } else {
        showError('Failed to update profile');
      }
    } catch (err) {
      showError('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  // Preferences update handlers
  const handlePreferenceUpdate = async (field: keyof UserPreferences, value: any) => {
    try {
      const updatedPreferences = { ...userPreferences, [field]: value };
      setUserPreferences(updatedPreferences);
      
      const result = await settingsService.updateUserPreferences({ [field]: value });
      if (result) {
        showSuccess('Preferences updated');
      } else {
        showError('Failed to update preferences');
      }
    } catch (err) {
      showError('Error updating preferences');
    }
  };

  // Integration handlers
  const handleIntegrationToggle = async (integrationType: string, connected: boolean) => {
    try {
      let result;
      if (connected) {
        result = await settingsService.disconnectIntegration(integrationType);
      } else {
        result = await settingsService.connectIntegration(integrationType);
      }

      if (result) {
        await loadSettingsData(); // Reload to get updated data
        showSuccess(`Integration ${connected ? 'disconnected' : 'connected'} successfully`);
      } else {
        showError(`Failed to ${connected ? 'disconnect' : 'connect'} integration`);
      }
    } catch (err) {
      showError('Error updating integration');
    }
  };

  // Notification handlers
  const handleNotificationToggle = async (settingType: string, type: 'email_enabled' | 'push_enabled' | 'slack_enabled', currentValue: boolean) => {
    try {
      const result = await settingsService.updateNotificationSetting(settingType, {
        [type]: !currentValue
      });

      if (result) {
        await loadSettingsData(); // Reload to get updated data
        showSuccess('Notification settings updated');
      } else {
        showError('Failed to update notification settings');
      }
    } catch (err) {
      showError('Error updating notification settings');
    }
  };

  // Password change handler
  const handlePasswordChange = async () => {
    try {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        showError('New passwords do not match');
        return;
      }

      if (passwordForm.newPassword.length < 8) {
        showError('New password must be at least 8 characters long');
        return;
      }

      setSaving(true);
      const result = await settingsService.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      
      if (result) {
        showSuccess('Password changed successfully');
        setShowPasswordForm(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showError('Failed to change password');
      }
    } catch (err) {
      showError('Error changing password');
    } finally {
      setSaving(false);
    }
  };

  // Session management
  const handleRevokeSession = async (sessionId: string) => {
    try {
      const result = await settingsService.revokeSession(sessionId);
      if (result) {
        await loadSettingsData();
        showSuccess('Session revoked successfully');
      } else {
        showError('Failed to revoke session');
      }
    } catch (err) {
      showError('Error revoking session');
    }
  };

  // Data export/import handlers
  const exportData = async () => {
    try {
      setExportLoading(true);
      const downloadUrl = await settingsService.requestDataExport();
      
      if (downloadUrl) {
        // Create download link
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `virtual-po-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccess('Data export started. Download will begin shortly.');
      } else {
        showError('Failed to export data');
      }
    } catch (err) {
      showError('Error exporting data');
    } finally {
      setExportLoading(false);
    }
  };

  const importData = async () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) return;

        try {
          setImportLoading(true);
          const result = await settingsService.importData(file);
          
          if (result) {
            await loadSettingsData();
            showSuccess('Data imported successfully');
          } else {
            showError('Failed to import data');
          }
        } catch (err) {
          showError('Error importing data');
        } finally {
          setImportLoading(false);
        }
      };
      
      input.click();
    } catch (err) {
      showError('Error importing data');
    }
  };

  const deleteAllData = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      setSaving(true);
      const result = await settingsService.deleteAllUserData();
      
      if (result) {
        showSuccess('All data deleted successfully');
        setShowDeleteConfirm(false);
        // Optionally redirect to login or refresh
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        showError('Failed to delete data');
      }
    } catch (err) {
      showError('Error deleting data');
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-600 mt-1">Manage your account, preferences, and integrations</p>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="text-green-500" size={20} />
            <p className="text-green-800">{successMessage}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="text-red-500" size={20} />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
            { id: 'integrations', label: 'Integrations', icon: Zap },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'security', label: 'Security', icon: Shield },
            { id: 'data', label: 'Data Management', icon: Database },
            { id: 'appearance', label: 'Appearance', icon: Palette }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-6">Profile Information</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) => handleProfileUpdate('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={userProfile.email}
                      onChange={(e) => handleProfileUpdate('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                      value={userProfile.role}
                      onChange={(e) => handleProfileUpdate('role', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Product Owner">Product Owner</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Project Manager">Project Manager</option>
                      <option value="Scrum Master">Scrum Master</option>
                      <option value="Business Analyst">Business Analyst</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={userProfile.department || ''}
                      onChange={(e) => handleProfileUpdate('department', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                    <select
                      value={userProfile.timezone}
                      onChange={(e) => handleProfileUpdate('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Europe/Brussels">Europe/Brussels (CET)</option>
                      <option value="Europe/London">Europe/London (GMT)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                      <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                      <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                    <select
                      value={userProfile.language}
                      onChange={(e) => handleProfileUpdate('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="English">English</option>
                      <option value="Dutch">Nederlands</option>
                      <option value="French">Français</option>
                      <option value="German">Deutsch</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={saveProfile}
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
                >
                  {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold mb-4">Profile Picture</h3>
              <div className="text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-blue-600" />
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Change Picture
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 mt-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {activityLog.slice(0, 5).map((activity, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium text-gray-900">{activity.activity_description}</p>
                    <p className="text-gray-500">{new Date(activity.created_at!).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">System Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Compact Mode</label>
                  <p className="text-sm text-gray-600">Reduce spacing and show more content</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userPreferences.compact_mode}
                    onChange={(e) => handlePreferenceUpdate('compact_mode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Auto-save drafts</label>
                  <p className="text-sm text-gray-600">Automatically save work in progress</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={userPreferences.auto_save}
                    onChange={(e) => handlePreferenceUpdate('auto_save', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Smart suggestions</label>
                  <p className="text-sm text-gray-600">AI-powered recommendations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={userPreferences.smart_suggestions}
                    onChange={(e) => handlePreferenceUpdate('smart_suggestions', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">Default Views</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dashboard Layout</label>
                <select 
                  value={userPreferences.dashboard_layout}
                  onChange={(e) => handlePreferenceUpdate('dashboard_layout', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="overview_first">Overview First</option>
                  <option value="priorities_first">Priorities First</option>
                  <option value="custom">Custom Layout</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority View</label>
                <select 
                  value={userPreferences.priority_view}
                  onChange={(e) => handlePreferenceUpdate('priority_view', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="matrix_view">Matrix View</option>
                  <option value="list_view">List View</option>
                  <option value="kanban_view">Kanban View</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Items per page</label>
                <select 
                  value={userPreferences.items_per_page}
                  onChange={(e) => handlePreferenceUpdate('items_per_page', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">Connected Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {integrations.map(integration => {
                const iconMap: { [key: string]: any } = {
                  slack: Slack,
                  gmail: Mail,
                  calendar: Calendar,
                  github: Github,
                  jira: Database,
                  teams: Chrome,
                  zoom: Chrome
                };
                const Icon = iconMap[integration.integration_type] || Database;
                
                return (
                  <div key={integration.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Icon className="text-gray-600" size={24} />
                        <div>
                          <h4 className="font-medium text-gray-900">{integration.integration_name}</h4>
                          <p className="text-sm text-gray-600">
                            {integration.integration_type === 'slack' && 'Real-time notifications and team communication'}
                            {integration.integration_type === 'gmail' && 'Email intelligence and automated responses'}
                            {integration.integration_type === 'calendar' && 'Meeting scheduling and calendar integration'}
                            {integration.integration_type === 'github' && 'Development workflow and issue tracking'}
                            {integration.integration_type === 'jira' && 'Project management and issue tracking'}
                            {integration.integration_type === 'teams' && 'Team collaboration and video conferencing'}
                            {integration.integration_type === 'zoom' && 'Video conferencing and meeting recordings'}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleIntegrationToggle(integration.integration_type, integration.connected)}
                        className={`px-3 py-1 text-sm rounded-lg ${
                          integration.connected
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {integration.connected ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                    {integration.connected && integration.last_sync && (
                      <p className="text-xs text-gray-500">
                        Last synced: {new Date(integration.last_sync).toLocaleString()}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl p-6 border border-slate-200">
          <h3 className="text-lg font-semibold mb-6">Notification Preferences</h3>
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-700 border-b border-gray-200 pb-2">
              <div>Notification Type</div>
              <div className="text-center">Email</div>
              <div className="text-center">Push</div>
              <div className="text-center">Slack</div>
            </div>

            {notificationSettings.map(setting => (
              <div key={setting.id} className="grid grid-cols-4 gap-4 items-center py-3 border-b border-gray-100 last:border-b-0">
                <div>
                  <h4 className="font-medium text-gray-900">{setting.setting_name}</h4>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
                <div className="text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.email_enabled}
                      onChange={() => handleNotificationToggle(setting.setting_type, 'email_enabled', setting.email_enabled)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.push_enabled}
                      onChange={() => handleNotificationToggle(setting.setting_type, 'push_enabled', setting.push_enabled)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                <div className="text-center">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={setting.slack_enabled}
                      onChange={() => handleNotificationToggle(setting.setting_type, 'slack_enabled', setting.slack_enabled)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">Password & Authentication</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Change Password</h4>
                  <p className="text-sm text-gray-600">Last changed 3 months ago</p>
                </div>
                <button
                  onClick={() => setShowPasswordForm(!showPasswordForm)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Change
                </button>
              </div>

              {showPasswordForm && (
                <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={passwordVisible ? 'text' : 'password'}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={handlePasswordChange}
                      disabled={saving}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center space-x-2 disabled:opacity-50"
                    >
                      {saving ? <Loader size={16} className="animate-spin" /> : null}
                      <span>Update Password</span>
                    </button>
                    <button
                      onClick={() => setShowPasswordForm(false)}
                      className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-600">Add extra security to your account</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Enable
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">Session Management</h3>
            <div className="space-y-4">
              {userSessions.map((session, index) => (
                <div key={session.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {session.device_type === 'mobile' ? (
                      <Smartphone className="text-gray-600" size={20} />
                    ) : (
                      <Monitor className="text-gray-600" size={20} />
                    )}
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {session.device_type || 'Desktop'} - {session.browser || 'Chrome'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {session.is_current ? 'Current session' : `Last active ${new Date(session.last_active).toLocaleDateString()}`}
                        {session.location && ` • ${session.location}`}
                      </p>
                    </div>
                  </div>
                  {session.is_current ? (
                    <span className="text-green-600 text-sm">Active</span>
                  ) : (
                    <button 
                      onClick={() => handleRevokeSession(session.id!)}
                      className="text-red-600 hover:text-red-700 text-sm"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Data Management Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">Data Export & Import</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Export Your Data</h4>
                <p className="text-sm text-gray-600 mb-4">Download all your data in JSON format</p>
                <button
                  onClick={exportData}
                  disabled={exportLoading}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
                >
                  {exportLoading ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
                  <span>Export Data</span>
                </button>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Import Data</h4>
                <p className="text-sm text-gray-600 mb-4">Upload previously exported data</p>
                <button
                  onClick={importData}
                  disabled={importLoading}
                  className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50"
                >
                  {importLoading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
                  <span>Import Data</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-red-200">
            <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-red-900 mb-2">Delete All Data</h4>
                <p className="text-sm text-red-700 mb-4">
                  Permanently delete all your data including priorities, meetings, documents, and settings. This action cannot be undone.
                </p>

                <button
                  onClick={deleteAllData}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Delete All Data</span>
                </button>

                {/* Confirmation Modal */}
                {showDeleteConfirm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                      <h3 className="text-lg font-semibold text-red-900 mb-4">Confirm Data Deletion</h3>
                      <p className="text-gray-700 mb-6">
                        Are you sure you want to delete all data? This action cannot be undone.
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                          disabled={saving}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmDelete}
                          disabled={saving}
                          className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"
                        >
                          {saving ? <Loader size={16} className="animate-spin" /> : null}
                          <span>Delete All Data</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">Theme Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Color Theme</label>
                <div className="space-y-2">
                  {[
                    { value: 'light', label: 'Light', icon: Sun },
                    { value: 'dark', label: 'Dark', icon: Moon },
                    { value: 'auto', label: 'Auto (System)', icon: Monitor }
                  ].map(option => {
                    const Icon = option.icon;
                    return (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          value={option.value}
                          checked={userPreferences.theme === option.value}
                          onChange={(e) => handlePreferenceUpdate('theme', e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <Icon size={16} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-900">{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <h3 className="text-lg font-semibold mb-4">Layout Preferences</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Sidebar collapsed by default</label>
                  <p className="text-sm text-gray-600">Start with sidebar minimized</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={userPreferences.sidebar_collapsed}
                    onChange={(e) => handlePreferenceUpdate('sidebar_collapsed', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="font-medium text-gray-900">Show tooltips</label>
                  <p className="text-sm text-gray-600">Display helpful tooltips on hover</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={userPreferences.show_tooltips}
                    onChange={(e) => handlePreferenceUpdate('show_tooltips', e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;