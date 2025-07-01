import React, { useState } from 'react';
import { User, Bell, Database, Key, Palette, Globe, Save, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';

export function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    profile: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'viewer',
      avatar: user?.avatar || '',
      timezone: 'UTC-8',
      language: 'English',
    },
    notifications: {
      emailAlerts: true,
      pipelineUpdates: true,
      dataUpdates: false,
      weeklyReports: true,
      slackIntegration: false,
      webhookUrl: '',
    },
    system: {
      autoSync: true,
      syncInterval: '30',
      retentionPeriod: '90',
      compressionEnabled: true,
      debugMode: false,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '24',
      apiKeyRotation: 'manual',
      lastPasswordChange: '2024-01-15',
    },
    appearance: {
      theme: 'dark',
      compactMode: false,
      animations: true,
      sidebarCollapsed: false,
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Database },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const handleSave = async () => {
    setIsLoading(true);
    setSaveStatus('saving');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSaveStatus('saved');
    setIsLoading(false);
    
    // Reset status after 3 seconds
    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  const updateSettings = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
    setSaveStatus('idle');
  };

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Profile Information</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={settings.profile.name}
              onChange={(e) => updateSettings('profile', 'name', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={settings.profile.email}
              onChange={(e) => updateSettings('profile', 'email', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Role
            </label>
            <select
              value={settings.profile.role}
              onChange={(e) => updateSettings('profile', 'role', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={user?.role !== 'admin'}
            >
              <option value="admin">Administrator</option>
              <option value="viewer">Viewer</option>
            </select>
            {user?.role !== 'admin' && (
              <p className="text-xs text-slate-500 mt-1">Contact admin to change role</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Timezone
            </label>
            <select
              value={settings.profile.timezone}
              onChange={(e) => updateSettings('profile', 'timezone', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="UTC-8">Pacific Time (UTC-8)</option>
              <option value="UTC-5">Eastern Time (UTC-5)</option>
              <option value="UTC+0">UTC</option>
              <option value="UTC+1">Central European Time (UTC+1)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Notification Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Email Alerts</p>
              <p className="text-xs text-slate-400">Receive email notifications for critical alerts</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.emailAlerts}
              onChange={(e) => updateSettings('notifications', 'emailAlerts', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Pipeline Updates</p>
              <p className="text-xs text-slate-400">Get notified when pipelines complete or fail</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.pipelineUpdates}
              onChange={(e) => updateSettings('notifications', 'pipelineUpdates', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Data Updates</p>
              <p className="text-xs text-slate-400">Notifications for data sync and quality issues</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.dataUpdates}
              onChange={(e) => updateSettings('notifications', 'dataUpdates', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Weekly Reports</p>
              <p className="text-xs text-slate-400">Summary reports sent every Monday</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.weeklyReports}
              onChange={(e) => updateSettings('notifications', 'weeklyReports', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Integration Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Webhook URL
            </label>
            <input
              type="url"
              value={settings.notifications.webhookUrl}
              onChange={(e) => updateSettings('notifications', 'webhookUrl', e.target.value)}
              placeholder="https://your-webhook-url.com/alerts"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="text-xs text-slate-500 mt-1">Optional: Receive notifications via webhook</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Data Synchronization</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Auto Sync</p>
              <p className="text-xs text-slate-400">Automatically sync data changes</p>
            </div>
            <input
              type="checkbox"
              checked={settings.system.autoSync}
              onChange={(e) => updateSettings('system', 'autoSync', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Sync Interval (seconds)
            </label>
            <input
              type="number"
              min="10"
              max="300"
              value={settings.system.syncInterval}
              onChange={(e) => updateSettings('system', 'syncInterval', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Data Management</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Data Retention (days)
            </label>
            <input
              type="number"
              min="30"
              max="365"
              value={settings.system.retentionPeriod}
              onChange={(e) => updateSettings('system', 'retentionPeriod', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Compression</p>
              <p className="text-xs text-slate-400">Enable data compression</p>
            </div>
            <input
              type="checkbox"
              checked={settings.system.compressionEnabled}
              onChange={(e) => updateSettings('system', 'compressionEnabled', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Account Security</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Two-Factor Authentication</p>
              <p className="text-xs text-slate-400">Add an extra layer of security</p>
            </div>
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => updateSettings('security', 'twoFactorAuth', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Session Timeout (hours)
            </label>
            <select
              value={settings.security.sessionTimeout}
              onChange={(e) => updateSettings('security', 'sessionTimeout', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="1">1 hour</option>
              <option value="8">8 hours</option>
              <option value="24">24 hours</option>
              <option value="168">1 week</option>
            </select>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-4">API Security</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              API Key Rotation
            </label>
            <select
              value={settings.security.apiKeyRotation}
              onChange={(e) => updateSettings('security', 'apiKeyRotation', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="manual">Manual</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
          
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-200">Current API Key</p>
                <p className="text-xs text-slate-400">Last updated: {settings.security.lastPasswordChange}</p>
              </div>
              <Button variant="secondary" size="sm">
                <RefreshCw size={14} className="mr-1" />
                Regenerate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Interface Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Theme
            </label>
            <select
              value={settings.appearance.theme}
              onChange={(e) => updateSettings('appearance', 'theme', e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="dark">Dark Theme</option>
              <option value="light">Light Theme</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Compact Mode</p>
              <p className="text-xs text-slate-400">Reduce spacing and padding</p>
            </div>
            <input
              type="checkbox"
              checked={settings.appearance.compactMode}
              onChange={(e) => updateSettings('appearance', 'compactMode', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">Animations</p>
              <p className="text-xs text-slate-400">Enable smooth transitions and animations</p>
            </div>
            <input
              type="checkbox"
              checked={settings.appearance.animations}
              onChange={(e) => updateSettings('appearance', 'animations', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileSettings();
      case 'notifications': return renderNotificationSettings();
      case 'system': return renderSystemSettings();
      case 'security': return renderSecuritySettings();
      case 'appearance': return renderAppearanceSettings();
      default: return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100">Settings</h1>
        <div className="flex items-center space-x-2">
          {saveStatus === 'saved' && (
            <Badge variant="success" size="sm">Settings Saved</Badge>
          )}
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isLoading || saveStatus === 'saved'}
            isLoading={isLoading}
          >
            <Save size={16} className="mr-2" />
            {isLoading ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-6">
              {renderTabContent()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}