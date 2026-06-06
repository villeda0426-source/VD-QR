import { API_BASE_URL } from '../config/config.js';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'API error');
  return json;
}

export const api = {
  initSession: (sessionId) =>
    request('/api/session', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),

  trackAction: (sessionId, platform) =>
    request(`/api/session/${sessionId}/action`, {
      method: 'POST',
      body: JSON.stringify({ platform }),
    }),

  generateCoupon: (sessionId) =>
    request('/api/coupon/generate', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    }),

  admin: {
    getStats: (apiKey) =>
      request('/api/admin/stats', { headers: { 'x-admin-key': apiKey } }),

    getCoupons: (apiKey) =>
      request('/api/admin/coupons', { headers: { 'x-admin-key': apiKey } }),

    redeemCoupon: (apiKey, code, redeemedBy) =>
      request(`/api/admin/coupons/${code}/redeem`, {
        method: 'POST',
        headers: { 'x-admin-key': apiKey },
        body: JSON.stringify({ redeemedBy }),
      }),
  },
};
