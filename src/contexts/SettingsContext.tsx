import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, SettingsKey } from '../types';

// Default settings
const defaultSettings: AppSettings = {
  // Default Settings
  defaultCompressionMode: 'preset',
  defaultQualityPreset: 'balanced',
  
  // UI Preferences
  showFileSizes: true,
  autoDownload: false,
  
  // Performance
  maxFileSizeMB: 25,
  maxBatchSize: 25,
  
  // Custom Mode Defaults
  defaultCustomFormat: 'jpeg',
  defaultCustomQuality: 'high',
  defaultCustomMaxWidth: 1600,
  defaultCustomMaxHeight: 900,
};

// Settings context
interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends SettingsKey>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
  getSetting: <K extends SettingsKey>(key: K) => AppSettings[K];
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Settings provider component
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('imageCompressSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Merge with defaults to handle missing properties
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('imageCompressSettings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  }, [settings, isLoaded]);

  // Update a single setting
  const updateSetting = <K extends SettingsKey>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Reset all settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  // Get a setting value
  const getSetting = <K extends SettingsKey>(key: K): AppSettings[K] => {
    return settings[key];
  };

  const value: SettingsContextType = {
    settings,
    updateSetting,
    resetSettings,
    getSetting,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use settings
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}; 