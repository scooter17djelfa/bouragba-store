import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import emailService from '../../services/emailService';
import { useSettings } from '../../context/SettingsContext';

const COLOR_PRESETS = [
  { name: 'البرتقالي الملكي (الافتراضي)', primary: '#ea580c', dark: '#c2410c', light: '#f97316' },
  { name: 'الأزرق الملكي (Royal Blue)', primary: '#2563eb', dark: '#1d4ed8', light: '#3b82f6' },
  { name: 'الأخضر الزمردي (Emerald)', primary: '#059669', dark: '#047857', light: '#10b981' },
  { name: 'البنفسجي الفاخر (Deep Violet)', primary: '#7c3aed', dark: '#6d28d9', light: '#8b5cf6' },
  { name: 'الأحمر القرمزي (Crimson)', primary: '#dc2626', dark: '#b91c1c', light: '#ef4444' },
  { name: 'الذهبي الأنيق (Luxury Amber)', primary: '#d97706', dark: '#b45309', light: '#f59e0b' },
  { name: 'الكحلي الليلي (Midnight)', primary: '#0f172a', dark: '#020617', light: '#1e293b' },
];

const AdminSettings = () => {
  const { updateSettingsState, storeLogo: currentGlobalLogo } = useSettings();

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

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await api.getSettings();
        if (data) setSettings(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const applyColorPreset = (preset) => {
    setSettings(prev => ({
      ...prev,
      theme_primary: preset.primary,
      theme_primary_dark: preset.dark,
      theme_primary_light: preset.light,
    }));
    // Instant live preview
    document.documentElement.style.setProperty('--primary', preset.primary);
    document.documentElement.style.setProperty('--primary-dark', preset.dark);
    document.documentElement.style.setProperty('--primary-light', preset.light);
  };

  // Handle Logo Upload via Cloudinary / Local API
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const res = await api.uploadImage(file);
      if (res && res.url) {
        setSettings(prev => ({ ...prev, store_logo: res.url }));
        updateSettingsState({ store_logo: res.url });
        alert('تم رفع الشعار بنجاح! تذكر النقر على "حفظ التعديلات" لتثبيت التغيير بشكل دائم.');
      }
    } catch (err) {
      alert('فشل رفع الشعار: ' + err.message);
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  // Test EmailJS configuration
  const handleTestEmail = async () => {
    if (!settings.emailjs_service_id || !settings.emailjs_template_id || !settings.emailjs_public_key) {
      alert('يرجى ملء جميع حقول EmailJS أولاً (Service ID, Template ID, Public Key)');
      return;
    }

    try {
      setTestingEmail(true);
      setEmailTestResult(null);
      const res = await emailService.sendEmail({
        serviceId: settings.emailjs_service_id,
        templateId: settings.emailjs_template_id,
        publicKey: settings.emailjs_public_key,
        templateParams: {
          to_email: settings.emailjs_to_email || settings.store_email || 'test@domain.com',
          from_name: 'نظام فحص متجر بوراقبة',
          message: 'هذه رسالة تجريبية لتأكيد نجاح ربط EmailJS بمتجر بوراقبة ستور.',
          date: new Date().toLocaleString('ar-DZ'),
        },
      });

      if (res.success) {
        setEmailTestResult({ success: true, message: 'تم إرسال بريد الاختبار بنجاح! تفقد بريدك الإلكتروني.' });
      } else {
        setEmailTestResult({ success: false, message: 'فشل إرسال البريد: ' + (res.error || 'تأكد من صحة المفاتيح وقالب EmailJS') });
      }
    } catch (err) {
      setEmailTestResult({ success: false, message: 'خطأ أثناء الاتصال بـ EmailJS: ' + err.message });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      await api.updateSettings(settings);
      updateSettingsState(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      const updated = await api.getSettings();
      if (updated) {
        setSettings(prev => ({ ...prev, ...updated }));
        updateSettingsState(updated);
      }
    } catch (err) {
      alert('فشل حفظ الإعدادات: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-settings-page">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">
            <i className="fa-solid fa-sliders" style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}></i>
            إعدادات المتجر، الهوية، الأمان، و Cloudinary & EmailJS
          </h2>
          <p className="admin-section-sub">
            التحكم الشامل في ألوان المتجر، الشعار الموحد، كلمة سر الإدارة، وتكامل السحابة
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="btn-primary"
          disabled={saving}
          id="btn-save-settings"
        >
          {saving ? (
            <>
              <i className="fa-solid fa-circle-notch fa-spin"></i>
              جاري الحفظ...
            </>
          ) : saved ? (
            <>
              <i className="fa-solid fa-check"></i>
              تم حفظ الإعدادات بنجاح
            </>
          ) : (
            <>
              <i className="fa-solid fa-floppy-disk"></i>
              حفظ التعديلات
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-settings-form">
        {/* 1. Identity & Unified Logo Card */}
        <div className="admin-card highlight-border">
          <h3 className="admin-card-title">
            <i className="fa-solid fa-gem" style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}></i>
            هوية المتجر والشعار الموحد (Logo)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
            تغيير الشعار والاسم هنا يحدث فوراً في كامل الموقع: شريط العنوان (Navbar)، الواجهة الرئيسية، شاشة التحميل (Loading)، وأيقونة المتصفح (Favicon).
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.25rem', flexWrap: 'wrap', background: 'var(--gray-50)', padding: '1rem', borderRadius: 'var(--radius)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: '#ffffff', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
              <img
                src={settings.store_logo || '/logo.png'}
                alt="شعار المتجر"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                onError={(e) => { e.currentTarget.src = '/logo.png'; }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '220px' }}>
              <label className="form-label" style={{ marginBottom: '0.25rem' }}>رفع شعار جديد (ملف صورة)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="form-input"
                style={{ padding: '0.4rem', fontSize: '0.85rem' }}
              />
              {uploadingLogo && <small style={{ color: 'var(--primary)', marginTop: '0.25rem', display: 'block' }}>جاري رفع الشعار...</small>}
            </div>
            <div style={{ flex: 1.5, minWidth: '240px' }}>
              <label className="form-label" style={{ marginBottom: '0.25rem' }}>أو رابط الشعار المباشر (URL)</label>
              <input
                type="text"
                name="store_logo"
                value={settings.store_logo || ''}
                onChange={handleChange}
                placeholder="/logo.png أو رابط صورة سحابي"
                className="form-input"
                dir="ltr"
              />
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: '1.25rem' }}>
            <div className="form-group full-width">
              <label className="form-label">اسم المتجر الرسمي *</label>
              <input
                type="text"
                name="store_name"
                value={settings.store_name || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="Bouragba Store | بوراقبة ستور"
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">نبذة ووصف المتجر</label>
              <textarea
                name="store_desc"
                rows={2}
                value={settings.store_desc || ''}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">عنوان ومقر المحل</label>
              <input
                type="text"
                name="store_address"
                value={settings.store_address || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="الجلفة، طريق الولاية مقابل ثانوية طهيري"
              />
            </div>
          </div>
        </div>

        {/* 2. Color Palette & Theme Customizer Card */}
        <div className="admin-card highlight-border">
          <h3 className="admin-card-title">
            <i className="fa-solid fa-palette" style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}></i>
            تخصيص ألوان وهوية الموقع (Theme Colors)
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
            اختر لوحة ألوان جاهزة بضغطة زر أو خصص اللون الرئيسي ليتغير طابع الموقع بالكامل تلقائياً
          </p>

          <div style={{ marginTop: '1rem' }}>
            <label className="form-label">لوحات ألوان جاهزة وسريعة:</label>
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {COLOR_PRESETS.map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => applyColorPreset(p)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '8px',
                    border: settings.theme_primary === p.primary ? '2px solid #000' : '1px solid var(--border)',
                    background: '#ffffff',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: p.primary, display: 'inline-block' }}></span>
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">اللون الرئيسي (Primary Color)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="color"
                  name="theme_primary"
                  value={settings.theme_primary || '#ea580c'}
                  onChange={(e) => {
                    handleChange(e);
                    document.documentElement.style.setProperty('--primary', e.target.value);
                  }}
                  style={{ width: '48px', height: '42px', padding: '2px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  name="theme_primary"
                  value={settings.theme_primary || '#ea580c'}
                  onChange={(e) => {
                    handleChange(e);
                    document.documentElement.style.setProperty('--primary', e.target.value);
                  }}
                  className="form-input"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">درجة اللون الغامقة (Hover / Dark)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="color"
                  name="theme_primary_dark"
                  value={settings.theme_primary_dark || '#c2410c'}
                  onChange={handleChange}
                  style={{ width: '48px', height: '42px', padding: '2px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}
                />
                <input
                  type="text"
                  name="theme_primary_dark"
                  value={settings.theme_primary_dark || '#c2410c'}
                  onChange={handleChange}
                  className="form-input"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Security & Admin Password Card */}
        <div className="admin-card">
          <div className="card-top-header">
            <div>
              <h3 className="admin-card-title">
                <i className="fa-solid fa-shield-halved" style={{ marginLeft: '0.5rem', color: '#dc2626' }}></i>
                أمان لوحة التحكم وكلمة المرور
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                كلمة السر المطلوبة لتسجيل الدخول إلى لوحة الإدارة (/admin). تدعم كلاً من قاعدة البيانات وملف .env / متغيرات بيئة Railway
              </p>
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">كلمة سر لوحة التحكم (Admin Password) *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="admin_password"
                  value={settings.admin_password || ''}
                  onChange={handleChange}
                  className="form-input"
                  dir="ltr"
                  placeholder="ADMIN123"
                  style={{ paddingLeft: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    left: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--gray-500)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                  title={showPassword ? 'إخفاء' : 'إظهار'}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              <small style={{ color: 'var(--gray-500)', fontSize: '0.78rem', marginTop: '0.35rem', display: 'block' }}>
                الكلمة الافتراضية الأولية هي <code>ADMIN123</code>، أو القيمة المكتوبة في <code>ADMIN_PASSWORD</code> بملف <code>.env</code>
              </small>
            </div>
          </div>
        </div>

        {/* 4. Cloudinary Integration Card */}
        <div className="admin-card highlight-border">
          <div className="card-top-header">
            <div>
              <h3 className="admin-card-title">
                <i className="fa-solid fa-cloud" style={{ color: '#0284c7', marginLeft: '0.5rem' }}></i>
                إعدادات حساب Cloudinary لتخزين الصور سحابياً
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                عند تعبئة هذه البيانات، تُرفع صور المنتجات والشعار إلى حسابك السحابي دائماً ولا تختفي عند إعادة تشغيل الخادم على Railway
              </p>
            </div>

            <div className="cloud-status-indicator">
              {settings.cloudinaryConfigured ? (
                <span className="status-badge status-completed">
                  <i className="fa-solid fa-circle-check"></i> متصل بـ Cloudinary
                </span>
              ) : (
                <span className="status-badge status-pending">
                  <i className="fa-solid fa-circle-info"></i> غير مكتمل (تخزين محلي مؤقت)
                </span>
              )}
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Cloud Name (اسم السحابة) *</label>
              <input
                type="text"
                name="cloudinary_cloud_name"
                value={settings.cloudinary_cloud_name || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="مثال: djbouragba"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">API Key *</label>
              <input
                type="text"
                name="cloudinary_api_key"
                value={settings.cloudinary_api_key || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="مثال: 984572918471928"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">API Secret *</label>
              <input
                type="password"
                name="cloudinary_api_secret"
                value={settings.cloudinary_api_secret || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="••••••••••••••••••••••••"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Upload Preset (اختياري)</label>
              <input
                type="text"
                name="cloudinary_upload_preset"
                value={settings.cloudinary_upload_preset || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="bouragba_preset"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* 5. EmailJS Integration Card */}
        <div className="admin-card highlight-border">
          <div className="card-top-header">
            <div>
              <h3 className="admin-card-title">
                <i className="fa-solid fa-envelope-open-text" style={{ color: '#8b5cf6', marginLeft: '0.5rem' }}></i>
                إعدادات خدمة EmailJS لإشعارات البريد
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-500)', marginTop: '0.25rem' }}>
                تُستخدم لإرسال تنبيهات الطلبات الجديدة فورياً إلى بريدك، ورسائل صفحة تواصل معنا
              </p>
            </div>

            <div className="cloud-status-indicator">
              {settings.emailjsConfigured ? (
                <span className="status-badge status-completed">
                  <i className="fa-solid fa-circle-check"></i> جاهز للإرسال
                </span>
              ) : (
                <span className="status-badge status-pending">
                  <i className="fa-solid fa-circle-info"></i> بانتظار الإعداد
                </span>
              )}
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Service ID *</label>
              <input
                type="text"
                name="emailjs_service_id"
                value={settings.emailjs_service_id || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="service_xxxxx"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Template ID *</label>
              <input
                type="text"
                name="emailjs_template_id"
                value={settings.emailjs_template_id || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="template_xxxxx"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Public Key (User ID) *</label>
              <input
                type="text"
                name="emailjs_public_key"
                value={settings.emailjs_public_key || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="public_key_xxxx"
                dir="ltr"
              />
            </div>

            <div className="form-group">
              <label className="form-label">البريد المستلم للإشعارات (Target Email)</label>
              <input
                type="email"
                name="emailjs_to_email"
                value={settings.emailjs_to_email || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="info@bouragbastore.dz"
                dir="ltr"
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleTestEmail}
              disabled={testingEmail}
              className="btn-secondary"
              style={{ fontSize: '0.88rem' }}
            >
              {testingEmail ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  جاري إرسال التجربة...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane"></i>
                  إرسال بريد تجريبي الآن
                </>
              )}
            </button>

            {emailTestResult && (
              <span
                style={{
                  fontSize: '0.85rem',
                  color: emailTestResult.success ? 'var(--success, #16a34a)' : 'var(--danger, #dc2626)',
                  fontWeight: 600,
                }}
              >
                {emailTestResult.message}
              </span>
            )}
          </div>
        </div>

        {/* 6. Contact Page & Social Media Card */}
        <div className="admin-card">
          <h3 className="admin-card-title">
            <i className="fa-solid fa-address-book" style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}></i>
            إدارة أرقام الاتصال وشبكات التواصل والخريطة
          </h3>

          <div className="form-grid" style={{ marginTop: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">رقم الهاتف للاتصال *</label>
              <input
                type="text"
                name="store_phone"
                value={settings.store_phone || ''}
                onChange={handleChange}
                className="form-input"
                dir="ltr"
                style={{ textAlign: 'right' }}
                placeholder="0550039581"
              />
            </div>

            <div className="form-group">
              <label className="form-label">رقم واتساب المباشر *</label>
              <input
                type="text"
                name="store_whatsapp"
                value={settings.store_whatsapp || ''}
                onChange={handleChange}
                className="form-input"
                dir="ltr"
                style={{ textAlign: 'right' }}
                placeholder="0550039581"
              />
            </div>

            <div className="form-group">
              <label className="form-label">البريد الإلكتروني الرسمي *</label>
              <input
                type="email"
                name="store_email"
                value={settings.store_email || ''}
                onChange={handleChange}
                className="form-input"
                dir="ltr"
                style={{ textAlign: 'right' }}
                placeholder="info@bouragbastore.dz"
              />
            </div>

            <div className="form-group">
              <label className="form-label">أوقات العمل الرئيسية</label>
              <input
                type="text"
                name="contact_hours_main"
                value={settings.contact_hours_main || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="السبت - الخميس: 09:00 - 20:00"
              />
            </div>

            <div className="form-group">
              <label className="form-label">أوقات العمل يوم الجمعة</label>
              <input
                type="text"
                name="contact_hours_friday"
                value={settings.contact_hours_friday || ''}
                onChange={handleChange}
                className="form-input"
                placeholder="الجمعة: 14:00 - 20:00"
              />
            </div>

            <div className="form-group full-width">
              <label className="form-label">
                <i className="fa-solid fa-map-location-dot" style={{ marginLeft: '0.4rem', color: 'var(--primary)' }}></i>
                رابط خريطة Google Maps (Embed URL)
              </label>
              <input
                type="text"
                name="contact_map_url"
                value={settings.contact_map_url || ''}
                onChange={handleChange}
                className="form-input"
                dir="ltr"
                placeholder="https://www.google.com/maps/embed?..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fa-brands fa-facebook-f" style={{ marginLeft: '0.4rem', color: '#1877f2' }}></i>
                فيسبوك
              </label>
              <input
                type="url"
                name="contact_facebook"
                value={settings.contact_facebook || ''}
                onChange={handleChange}
                className="form-input"
                dir="ltr"
                placeholder="https://facebook.com/..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fa-brands fa-instagram" style={{ marginLeft: '0.4rem', color: '#e4405f' }}></i>
                إنستغرام
              </label>
              <input
                type="url"
                name="contact_instagram"
                value={settings.contact_instagram || ''}
                onChange={handleChange}
                className="form-input"
                dir="ltr"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <i className="fa-brands fa-tiktok" style={{ marginLeft: '0.4rem', color: '#000000' }}></i>
                تيك توك
              </label>
              <input
                type="url"
                name="contact_tiktok"
                value={settings.contact_tiktok || ''}
                onChange={handleChange}
                className="form-input"
                dir="ltr"
                placeholder="https://tiktok.com/@..."
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
