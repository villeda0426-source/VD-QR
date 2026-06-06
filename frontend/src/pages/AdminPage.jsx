import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client.js';

const LS_ADMIN_KEY = 'vd_admin_key';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getBadge(coupon) {
  if (coupon.redeemed) return { label: 'Redeemed', cls: 'badge-redeemed' };
  if (new Date(coupon.expires_at) < new Date()) return { label: 'Expired', cls: 'badge-expired' };
  return { label: 'Active', cls: 'badge-active' };
}

export default function AdminPage() {
  const [apiKey,   setApiKey]   = useState(() => sessionStorage.getItem(LS_ADMIN_KEY) || '');
  const [authed,   setAuthed]   = useState(false);
  const [stats,    setStats]    = useState(null);
  const [coupons,  setCoupons]  = useState([]);
  const [filter,   setFilter]   = useState('all');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const loadData = useCallback(async (key) => {
    setLoading(true);
    try {
      const [statsData, couponsData] = await Promise.all([
        api.admin.getStats(key),
        api.admin.getCoupons(key),
      ]);
      setStats(statsData);
      setCoupons(couponsData.coupons);
      setAuthed(true);
      sessionStorage.setItem(LS_ADMIN_KEY, key);
      setError('');
    } catch {
      setError('Invalid admin key or server error.');
      setAuthed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-login if key saved from previous session
  useEffect(() => {
    const saved = sessionStorage.getItem(LS_ADMIN_KEY);
    if (saved) loadData(saved);
  }, [loadData]);

  async function handleLogin(e) {
    e.preventDefault();
    await loadData(apiKey);
  }

  async function handleRedeem(code) {
    if (!window.confirm(`Mark coupon ${code} as redeemed?`)) return;
    try {
      await api.admin.redeemCoupon(apiKey, code, 'staff');
      setCoupons(prev => prev.map(c =>
        c.code === code ? { ...c, redeemed: true, redeemed_at: new Date().toISOString() } : c
      ));
      setStats(s => s ? { ...s, redeemedCoupons: s.redeemedCoupons + 1, pendingCoupons: s.pendingCoupons - 1 } : s);
    } catch (err) {
      alert('Failed to redeem: ' + err.message);
    }
  }

  const filtered = coupons.filter(c => {
    if (filter === 'active')   return !c.redeemed && new Date(c.expires_at) >= new Date();
    if (filter === 'redeemed') return c.redeemed;
    if (filter === 'expired')  return !c.redeemed && new Date(c.expires_at) < new Date();
    return true;
  });

  if (!authed) {
    return (
      <div className="admin-page">
        <div className="login-card">
          <h2>Admin Login</h2>
          {error && <p style={{ color: 'red', marginBottom: 12, fontSize: '0.85rem' }}>{error}</p>}
          <form onSubmit={handleLogin}>
            <input
              type="password"
              className="input-field"
              placeholder="Enter admin API key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">Villedas Delight — Admin Dashboard</div>

      {stats && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{stats.totalSessions ?? '—'}</div>
            <div className="stat-label">Sessions</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{stats.totalCoupons ?? '—'}</div>
            <div className="stat-label">Coupons Issued</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{stats.redeemedCoupons ?? '—'}</div>
            <div className="stat-label">Redeemed</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{stats.pendingCoupons ?? '—'}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      )}

      <div className="filter-row">
        {['all', 'active', 'redeemed', 'expired'].map(f => (
          <button
            key={f}
            className={`filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <button
          className="filter-btn"
          onClick={() => loadData(apiKey)}
          style={{ marginLeft: 'auto' }}
        >
          Refresh
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="coupons-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Created</th>
              <th>Expires</th>
              <th>Status</th>
              <th>Redeemed At</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#aaa' }}>No coupons found.</td></tr>
            )}
            {filtered.map(coupon => {
              const badge = getBadge(coupon);
              return (
                <tr key={coupon.code}>
                  <td><strong style={{ fontFamily: 'monospace' }}>{coupon.code}</strong></td>
                  <td>{formatDate(coupon.created_at)}</td>
                  <td>{formatDate(coupon.expires_at)}</td>
                  <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                  <td>{coupon.redeemed ? formatDate(coupon.redeemed_at) : '—'}</td>
                  <td>
                    <button
                      className="redeem-btn"
                      disabled={coupon.redeemed || new Date(coupon.expires_at) < new Date()}
                      onClick={() => handleRedeem(coupon.code)}
                    >
                      Redeem
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
