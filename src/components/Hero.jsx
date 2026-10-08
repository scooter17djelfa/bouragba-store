import React from 'react';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import './Hero.css';

const Hero = () => {
  const { storeLogo, storeName, settings } = useSettings();

  return (
    <section className="store-hero" aria-label="تعريف بمتجر بوراقبة ستور">
      <div className="hero-content">
        {/* Main Title */}
        <h1 className="hero-title">
          <span className="hero-title-highlight">{storeName}</span>
        </h1>

        {/* Address and Description */}
        <p className="hero-desc">
          {settings.store_address || 'المحل متواجد في ولاية الجلفة طريق الولاية مقابل ثانوية طهيري'}
        </p>

        {/* Dynamic Store Logo */}
        <div className="hero-logo-container" style={{ margin: '1.5rem auto 2rem auto', textAlign: 'center' }}>
          <img
            src={storeLogo}
            alt={storeName}
            className="hero-logo-image"
            style={{
              maxWidth: '320px',
              maxHeight: '260px',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'inline-block',
             
              transition: 'transform 0.3s ease'
            }}
            onError={(e) => {
              e.currentTarget.src = '/logo.png';
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="hero-actions">
          <a href="#shop-grid" className="btn-hero-primary" id="hero-browse-btn">
            <i className="fa-solid fa-boxes-stacked" style={{ marginLeft: '0.4rem' }}></i>
            تصفح المنتجات
          </a>
          
          <Link to="/contact" className="btn-hero-secondary" id="hero-contact-btn">
            <i className="fa-solid fa-headset" style={{ marginLeft: '0.4rem' }}></i>
            تواصل معنا
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
