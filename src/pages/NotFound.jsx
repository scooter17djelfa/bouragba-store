import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();
  const { storeName, storeLogo } = useSettings();

  return (
    <div className="not-found-page page-enter">
      <div className="container not-found-container">
        <div className="not-found-card">
          {/* Logo badge */}
          <div className="not-found-logo-wrap">
            <img
              src={storeLogo}
              alt={storeName}
              className="not-found-logo"
              onError={(e) => {
                e.currentTarget.src = '/logo.png';
              }}
            />
          </div>

          {/* 404 Big Numbers */}
          <div className="error-code-wrapper">
            <span className="error-digit">4</span>
            <div className="error-compass">
              <i className="fa-solid fa-compass fa-spin" style={{ animationDuration: '10s' }}></i>
            </div>
            <span className="error-digit">4</span>
          </div>

          <h1 className="not-found-title">الصفحة غير موجودة</h1>
          <p className="not-found-desc">
            عذراً، يبدو أن الرابط الذي طلبته غير صحيح، أو تم نقل الصفحة أو إزالتها.
          </p>

          {/* Action Buttons */}
          <div className="not-found-actions">
            <Link to="/" className="btn-primary" id="btn-404-home">
              <i className="fa-solid fa-house"></i>
              <span>الرئيسية</span>
            </Link>

            <Link to="/shop" className="btn-secondary" id="btn-404-shop">
              <i className="fa-solid fa-store"></i>
              <span>تصفح المنتجات</span>
            </Link>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-outline"
              id="btn-404-back"
            >
              <i className="fa-solid fa-arrow-right"></i>
              <span>الرجوع للخلف</span>
            </button>
          </div>

          {/* Quick Helpful Links */}
          <div className="not-found-quick-links">
            <span className="quick-links-label">روابط قد تهمك:</span>
            <div className="quick-links-badges">
              <Link to="/shop?category=هواتف ذكية" className="quick-badge">
                <i className="fa-solid fa-mobile-screen-button"></i> هواتف ذكية
              </Link>
              <Link to="/shop?category=إكسسوارات" className="quick-badge">
                <i className="fa-solid fa-headphones"></i> إكسسوارات
              </Link>
              <Link to="/contact" className="quick-badge">
                <i className="fa-solid fa-headset"></i> تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
