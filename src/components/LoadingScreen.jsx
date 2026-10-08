import React, { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import './LoadingScreen.css';

const LoadingScreen = () => {
  const { storeLogo, storeName, loadingSettings } = useSettings();
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // When settings finish loading, give a smooth minimum presentation time
    // so the user sees a smooth professional entry without sudden flickers
    const minTimer = setTimeout(() => {
      setFading(true);
      const hideTimer = setTimeout(() => {
        setVisible(false);
      }, 500); // 500ms smooth fade-out animation
      return () => clearTimeout(hideTimer);
    }, 750);

    return () => clearTimeout(minTimer);
  }, [loadingSettings]);

  if (!visible) return null;

  return (
    <aside
      className={`site-loading-overlay ${fading ? 'fade-out' : ''}`}
      aria-label="شاشة التحميل"
      aria-live="polite"
    >
      <div className="loading-card">
        {/* Dynamic Store Logo Above Spinner */}
        <div className="loading-logo-wrap">
          <img
            src={storeLogo}
            alt={storeName}
            className="loading-logo-img"
            onError={(e) => {
              e.currentTarget.src = '/logo.png';
            }}
          />
        </div>

        {/* YouTube-Style Circular Buffering Spinner */}
        <div className="youtube-spinner-container">
          <svg className="youtube-spinner" viewBox="0 0 50 50">
            <circle
              className="youtube-spinner-path"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
            />
          </svg>
        </div>

        {/* Store Title & Loading Text */}
        <div className="loading-text-group">
          <h2 className="loading-store-name">{storeName}</h2>
          <span className="loading-sub-pulse">مرحباً بكم، جاري تجهيز المتجر...</span>
        </div>
      </div>
    </aside>
  );
};

export default LoadingScreen;
