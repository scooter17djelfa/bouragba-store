import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './AdminOverview.css';

const AdminOverview = () => {
  const [stats, setStats] = useState({
    ordersCount: 0,
    revenue: 0,
    totalProductRevenue: 0,
    totalCostOfSold: 0,
    netProfit: 0,
    profitMargin: 0,
    totalInventoryCost: 0,
    potentialProfit: 0,
    productsCount: 0,
    outOfStock: 0,
    recentOrders: [],
  });
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const [statsData, prods] = await Promise.all([
          api.getStats().catch(() => ({})),
          api.getProducts().catch(() => [])
        ]);

        if (statsData) setStats(statsData);
        if (prods) setFeaturedProducts(prods.slice(0, 5));
      } catch (err) {
        console.error('Failed to load overview:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const fmt = (n) => Number(n || 0).toLocaleString('ar-DZ') + ' د.ج';

  return (
    <div className="admin-overview">
      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">
            <i className="fa-solid fa-chart-pie" style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}></i>
            نظرة عامة على المتجر
          </h2>
          <p className="admin-section-sub">مؤشرات الأداء المباشرة وصافي الأرباح المستخرجة من قاعدة بيانات SQLite</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        {/* Net Profit Card - Featured */}
        <div className="admin-stat-card profit-card">
          <div className="stat-card-top">
            <span className="stat-label">صافي الربح المحقق</span>
            <div className="stat-icon-wrap success">
              <i className="fa-solid fa-sack-dollar"></i>
            </div>
          </div>
          <div className="stat-value" style={{ color: '#16a34a' }}>
            {fmt(stats.netProfit)}
          </div>
          <div className="stat-sub-note">
            <i className="fa-solid fa-arrow-trend-up" style={{ color: '#16a34a', marginLeft: '0.35rem' }}></i>
            <span>
              هامش الربح: <strong>{stats.profitMargin || 0}%</strong> من المبيعات
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="admin-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">إجمالي المبيعات</span>
            <div className="stat-icon-wrap primary">
              <i className="fa-solid fa-money-bill-trend-up"></i>
            </div>
          </div>
          <div className="stat-value">{fmt(stats.revenue)}</div>
          <div className="stat-sub-note">
            <i className="fa-solid fa-circle-check" style={{ color: '#16a34a', marginLeft: '0.35rem' }}></i>
            <span>مبيعات الطلبات المؤكدة</span>
          </div>
        </div>

        {/* Cost of Sold Goods */}
        <div className="admin-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">تكلفة شراء المباع</span>
            <div className="stat-icon-wrap warning">
              <i className="fa-solid fa-file-invoice-dollar"></i>
            </div>
          </div>
          <div className="stat-value">{fmt(stats.totalCostOfSold)}</div>
          <div className="stat-sub-note">
            <i className="fa-solid fa-boxes-packing" style={{ color: '#d97706', marginLeft: '0.35rem' }}></i>
            <span>رأس مال المنتجات التي تم بيعها</span>
          </div>
        </div>

        {/* Inventory Capital Value */}
        <div className="admin-stat-card">
          <div className="stat-card-top">
            <span className="stat-label">قيمة المخزون الحالي</span>
            <div className="stat-icon-wrap info">
              <i className="fa-solid fa-warehouse"></i>
            </div>
          </div>
          <div className="stat-value">{fmt(stats.totalInventoryCost)}</div>
          <div className="stat-sub-note">
            <i className="fa-solid fa-coins" style={{ color: '#2563eb', marginLeft: '0.35rem' }}></i>
            <span>ربح متوقع: {fmt(stats.potentialProfit)}</span>
          </div>
        </div>
      </div>

      {/* Secondary Stats Row */}
      <div className="stats-secondary-grid">
        <div className="mini-stat-card">
          <div className="mini-stat-icon">
            <i className="fa-solid fa-truck-ramp-box"></i>
          </div>
          <div className="mini-stat-info">
            <span className="mini-stat-label">إجمالي الطلبات</span>
            <strong className="mini-stat-val">{stats.ordersCount} طلب</strong>
          </div>
        </div>

        <div className="mini-stat-card">
          <div className="mini-stat-icon">
            <i className="fa-solid fa-boxes-stacked"></i>
          </div>
          <div className="mini-stat-info">
            <span className="mini-stat-label">منتجات المتجر</span>
            <strong className="mini-stat-val">{stats.productsCount} منتج</strong>
          </div>
        </div>

        <div className="mini-stat-card">
          <div className="mini-stat-icon" style={{ background: stats.outOfStock > 0 ? '#fef2f2' : '#f0fdf4', color: stats.outOfStock > 0 ? '#dc2626' : '#16a34a' }}>
            <i className={stats.outOfStock > 0 ? 'fa-solid fa-triangle-exclamation' : 'fa-solid fa-check'}></i>
          </div>
          <div className="mini-stat-info">
            <span className="mini-stat-label">المنتجات النافدة</span>
            <strong className="mini-stat-val" style={{ color: stats.outOfStock > 0 ? '#dc2626' : '#16a34a' }}>
              {stats.outOfStock} منتج
            </strong>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="overview-split-grid">
        {/* Recent Orders Card */}
        <div className="admin-box-card">
          <h3 className="box-card-title">
            <i className="fa-solid fa-clock-rotate-left" style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}></i>
            أحدث الطلبات وصافي أرباحها
          </h3>

          {(stats.recentOrders || []).length === 0 ? (
            <div className="empty-box-state">
              <i className="fa-solid fa-receipt"></i>
              <p>لا توجد طلبات مسجلة بعد</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>الطلب</th>
                    <th>العميل</th>
                    <th>الهاتف</th>
                    <th>المبلغ</th>
                    <th>صافي الربح</th>
                    <th>الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map(o => (
                    <tr key={o.id}>
                      <td><strong>#{o.id}</strong></td>
                      <td>{o.customerName}</td>
                      <td dir="ltr" style={{ textAlign: 'left' }}>{o.customerPhone}</td>
                      <td><strong>{fmt(o.total)}</strong></td>
                      <td>
                        <span style={{
                          fontWeight: 700,
                          color: (o.profit || 0) >= 0 ? '#16a34a' : '#dc2626',
                          background: (o.profit || 0) >= 0 ? '#f0fdf4' : '#fef2f2',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.8rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <i className="fa-solid fa-coins" style={{ fontSize: '0.7rem' }}></i>
                          +{fmt(o.profit || 0)}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${o.status}`}>
                          {o.status === 'completed' ? 'مكتمل' : o.status === 'processing' ? 'قيد التجهيز' : o.status === 'cancelled' ? 'ملغي' : 'معلق'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Featured Products List */}
        <div className="admin-box-card">
          <h3 className="box-card-title">
            <i className="fa-solid fa-star" style={{ marginLeft: '0.5rem', color: '#f59e0b' }}></i>
            قائمة المنتجات المتاحة
          </h3>

          {featuredProducts.length === 0 ? (
            <div className="empty-box-state">
              <i className="fa-solid fa-box-open"></i>
              <p>لا توجد منتجات مسجلة في قاعدة البيانات</p>
            </div>
          ) : (
            <div className="featured-prods-list">
              {featuredProducts.map(p => (
                <div key={p.id} className="featured-prod-item">
                  <img src={p.image} alt={p.name} className="featured-prod-img" />
                  <div className="featured-prod-info">
                    <h4>{p.name}</h4>
                    <span>{p.category}</span>
                  </div>
                  <div className="featured-prod-price">
                    <strong>{fmt(p.price)}</strong>
                    <small>المخزون: {p.stock}</small>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
