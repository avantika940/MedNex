/**
 * Settings Page
 * 
 * User preferences and application settings
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Database, 
  Download,
  Upload,
  Trash2,
  Save,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    saveHistory: true,
    autoSave: true,
    confidenceThreshold: 40,
    maxHistoryEntries: 50,
    theme: 'auto',
    language: 'en',
    apiTimeout: 30000
  });

  const [isDirty, setIsDirty] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [historyStats, setHistoryStats] = useState({
    total: 0,
    lastWeek: 0,
    avgConfidence: 0
  });

  // Load settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('mednex-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Load history stats
    const history = JSON.parse(localStorage.getItem('mednex-history') || '[]');
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekEntries = history.filter((entry: any) => 
      new Date(entry.timestamp) > weekAgo
    );
    const avgConfidence = history.length > 0 
      ? history.reduce((acc: number, entry: any) => acc + entry.confidence, 0) / history.length
      : 0;

    setHistoryStats({
      total: history.length,
      lastWeek: lastWeekEntries.length,
      avgConfidence: Math.round(avgConfidence)
    });
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const saveSettings = () => {
    localStorage.setItem('mednex-settings', JSON.stringify(settings));
    setIsDirty(false);
  };

  const resetSettings = () => {
    const defaultSettings = {
      notifications: true,
      saveHistory: true,
      autoSave: true,
      confidenceThreshold: 40,
      maxHistoryEntries: 50,
      theme: 'auto',
      language: 'en',
      apiTimeout: 30000
    };
    setSettings(defaultSettings);
    setIsDirty(true);
  };

  const exportData = () => {
    const data = {
      settings,
      history: JSON.parse(localStorage.getItem('mednex-history') || '[]'),
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mednex-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.settings) {
          setSettings(data.settings);
          localStorage.setItem('mednex-settings', JSON.stringify(data.settings));
        }
        if (data.history) {
          localStorage.setItem('mednex-history', JSON.stringify(data.history));
        }
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('mednex-history');
      localStorage.removeItem('mednex-settings');
      resetSettings();
      alert('All data cleared successfully!');
    }
  };

  return (
    <div className="min-h-screen gradient-primary pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 rounded-full bg-blue-100">
              <Settings className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-blue-100 mt-1">
                Customize your MedNex experience and manage your data
              </p>
            </div>
          </div>

          {/* Save/Reset Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={saveSettings}
              disabled={!isDirty}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                isDirty 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="h-4 w-4" />
              <span>Save Changes</span>
            </button>
            <button
              onClick={resetSettings}
              className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset to Default</span>
            </button>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* General Settings */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>General Settings</span>
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Enable Notifications</label>
                  <p className="text-blue-200 text-sm">Get notified about analysis results</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Save Search History</label>
                  <p className="text-blue-200 text-sm">Keep track of your previous searches</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.saveHistory}
                    onChange={(e) => handleSettingChange('saveHistory', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-white font-medium">Auto-save Results</label>
                  <p className="text-blue-200 text-sm">Automatically save analysis results</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Analysis Settings */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Analysis Settings</span>
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-white font-medium block mb-2">
                  Confidence Threshold: {settings.confidenceThreshold}%
                </label>
                <p className="text-blue-200 text-sm mb-3">
                  Minimum confidence level for displaying predictions
                </p>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.confidenceThreshold}
                  onChange={(e) => handleSettingChange('confidenceThreshold', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="text-white font-medium block mb-2">
                  Max History Entries: {settings.maxHistoryEntries}
                </label>
                <p className="text-blue-200 text-sm mb-3">
                  Maximum number of searches to keep in history
                </p>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={settings.maxHistoryEntries}
                  onChange={(e) => handleSettingChange('maxHistoryEntries', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div>
                <label className="text-white font-medium block mb-2">API Timeout</label>
                <p className="text-blue-200 text-sm mb-3">Request timeout in milliseconds</p>
                <select
                  value={settings.apiTimeout}
                  onChange={(e) => handleSettingChange('apiTimeout', parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  <option value={15000}>15 seconds</option>
                  <option value={30000}>30 seconds</option>
                  <option value={60000}>60 seconds</option>
                  <option value={120000}>2 minutes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Management */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Data Management</span>
            </h2>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{historyStats.total}</div>
                <div className="text-blue-200 text-sm">Total Searches</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{historyStats.lastWeek}</div>
                <div className="text-blue-200 text-sm">This Week</div>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-white">{historyStats.avgConfidence}%</div>
                <div className="text-blue-200 text-sm">Avg Confidence</div>
              </div>
            </div>

            {/* Data Actions */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={exportData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                <Download className="h-4 w-4" />
                <span>Export Data</span>
              </button>
              
              <label className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>Import Data</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
              
              <button
                onClick={clearAllData}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-300"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All Data</span>
              </button>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Privacy & Security</span>
            </h2>
            
            <div className="space-y-4 text-blue-100 text-sm">
              <p>• All data is stored locally in your browser</p>
              <p>• No personal information is sent to external servers</p>
              <p>• Medical data is processed securely through encrypted connections</p>
              <p>• You can export or delete your data at any time</p>
              <p>• API calls are made directly to medical AI services</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
