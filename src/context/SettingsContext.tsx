import React, { createContext, useContext, useState, useEffect } from 'react';
import type { StreamSettings } from '../types/anime';

interface SettingsContextType {
  settings: StreamSettings;
  updateSettings: (partial: Partial<StreamSettings>) => void;
  resetSettings: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
}

const DEFAULT_SETTINGS: StreamSettings = {
  apiKey: '',
  apiEndpoint: 'https://api.consumet.org/anime/gogoanime',
  preferredQuality: '1080p',
  autoPlay: true,
  autoNext: true,
  autoSkipIntro: false,
  activeServer: 'server-alpha'
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StreamSettings>(() => {
    try {
      const saved = localStorage.getItem('dkanime_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem('dkanime_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  const updateSettings = (partial: Partial<StreamSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        isSettingsOpen,
        setIsSettingsOpen
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
