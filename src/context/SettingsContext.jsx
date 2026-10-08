import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    store_name: 'Bouragba Store | بوراقبة ستور',
    store_logo: '/logo.png',
    store_phone: '0550039581',
    store_whatsapp: '0550039581',
    store_email: 'info@bouragbastore.dz',
    store_address: 'الجلفة، طريق الولاية مقابل ثانوية طهيري',
    store_desc: 'متجرك المعتمد لأحدث الهواتف الذكية الأصلية والإلكترونيات بضمان رسمي وتوصيل لجميع الولايات',
    admin_password: 'ADMIN123',
    contact_hours_main: 'السبت - الخميس: 09:00 - 20:00',
    contact_hours_friday: 'الجمعة: 14:00 - 20:00',
    contact_map_url: '',
    contact_facebook: '',
    contact_instagram: '',
    contact_tiktok: '',
    cloudinary_cloud_name: '',
    cloudinary_api_key: '',
    cloudinary_api_secret: '',
    cloudinary_upload_preset: '',
    cloudinaryConfigured: false,
    emailjs_service_id: '',
    emailjs_template_id: '',
    emailjs_public_key: '',
    emailjs_to_email: 'info@bouragbastore.dz',
    emailjsConfigured: false,
    theme_primary: '#ea580c',
    theme_primary_dark: '#c2410c',
    theme_primary_light: '#f97316',
  });

  const [loadingSettings, setLoadingSettings] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await api.getSettings();
      if (data && typeof data === 'object') {
        setSettings(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.warn('Could not load settings from server, using defaults:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Sync Document Title, Favicon, and CSS Theme Variables
  useEffect(() => {
    if (settings.store_name) {
      document.title = settings.store_name;
    }

    // Favicon update
    const faviconUrl = settings.store_logo || '/logo.png';
    let link = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;

    // Apply Dynamic Theme Colors
    const root = document.documentElement;
    if (settings.theme_primary) {
      root.style.setProperty('--primary', settings.theme_primary);
    }
    if (settings.theme_primary_dark) {
      root.style.setProperty('--primary-dark', settings.theme_primary_dark);
    } else if (settings.theme_primary) {
      root.style.setProperty('--primary-dark', settings.theme_primary);
    }
    if (settings.theme_primary_light) {
      root.style.setProperty('--primary-light', settings.theme_primary_light);
    } else if (settings.theme_primary) {
      root.style.setProperty('--primary-light', settings.theme_primary);
    }
  }, [settings]);

  const updateSettingsState = (newValues) => {
    setSettings(prev => ({ ...prev, ...newValues }));
  };

  const storeLogo = settings.store_logo || '/logo.png';
  const storeName = settings.store_name || 'Bouragba Store | بوراقبة ستور';

  return (
    <SettingsContext.Provider
      value={{
        settings,
        setSettings,
        updateSettingsState,
        refreshSettings: fetchSettings,
        loadingSettings,
        storeLogo,
        storeName,
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

export default SettingsContext;
