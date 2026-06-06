import { useState, useEffect, useCallback } from 'react';
import { BRAND, SOCIAL_PLATFORMS, PLATFORMS_ORDER } from '../config/config.js';
import { api } from '../api/client.js';
import SocialCard        from '../components/SocialCard.jsx';
import ProgressIndicator from '../components/ProgressIndicator.jsx';
import CouponReveal      from '../components/CouponReveal.jsx';

const LS_SESSION = 'vd_session_id';
const LS_VISITED = 'vd_visited';

function getOrCreateSessionId() {
  let sid = localStorage.getItem(LS_SESSION);
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem(LS_SESSION, sid);
  }
  return sid;
}

export default function CampaignPage() {
  const [sessionId,  setSessionId]  = useState(null);
  const [visited,    setVisited]    = useState(new Set());
  const [coupon,     setCoupon]     = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [generating, setGenerating] = useState(false);

  // Sync with backend; fall back to localStorage on failure
  const syncSession = useCallback(async (sid) => {
    try {
      const data = await api.initSession(sid);
      const serverVisited = new Set(data.visitedPlatforms);
      setVisited(serverVisited);
      localStorage.setItem(LS_VISITED, JSON.stringify([...serverVisited]));
      if (data.coupon) setCoupon(data.coupon);
    } catch {
      const cached = JSON.parse(localStorage.getItem(LS_VISITED) || '[]');
      setVisited(new Set(cached));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sid = getOrCreateSessionId();
    setSessionId(sid);
    syncSession(sid);
  }, [syncSession]);

  const generateCoupon = useCallback(async (sid) => {
    if (generating || coupon) return;
    setGenerating(true);
    try {
      const data = await api.generateCoupon(sid);
      setCoupon(data.coupon);
    } catch (err) {
      console.error('Coupon generation failed:', err.message);
    } finally {
      setGenerating(false);
    }
  }, [generating, coupon]);

  const handleSocialClick = useCallback(async (platform) => {
    const { url, key } = platform;

    // Optimistic update
    setVisited(prev => {
      const next = new Set([...prev, key]);
      localStorage.setItem(LS_VISITED, JSON.stringify([...next]));

      // Trigger coupon generation when all 3 hit
      if (next.size === PLATFORMS_ORDER.length) {
        setTimeout(() => generateCoupon(sessionId), 300);
      }
      return next;
    });

    // Open social link
    window.open(url, '_blank', 'noopener,noreferrer');

    // Persist to backend (fire-and-forget)
    if (sessionId) {
      api.trackAction(sessionId, key).catch(() => {});
    }
  }, [sessionId, generateCoupon]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
      </div>
    );
  }

  const completedCount = PLATFORMS_ORDER.filter(p => visited.has(p)).length;
  const allDone = completedCount === PLATFORMS_ORDER.length;

  return (
    <div className="page">
      <header className="hero">
        <div className="hero-logo">{BRAND.name}</div>
        <div className="hero-sub">{BRAND.tagline}</div>
      </header>

      <div className="card-stack">
        {PLATFORMS_ORDER.map(key => (
          <SocialCard
            key={key}
            platform={SOCIAL_PLATFORMS[key]}
            visited={visited.has(key)}
            onClick={() => handleSocialClick(SOCIAL_PLATFORMS[key])}
          />
        ))}
      </div>

      <ProgressIndicator total={PLATFORMS_ORDER.length} completed={completedCount} />

      {generating && !coupon && (
        <p style={{ textAlign: 'center', color: '#888', fontSize: '0.9rem', padding: '8px' }}>
          Generating your coupon...
        </p>
      )}

      {allDone && !coupon && !generating && (
        <button
          className="btn-primary"
          style={{ margin: '0 16px 24px', maxWidth: 388, width: 'calc(100% - 32px)' }}
          onClick={() => generateCoupon(sessionId)}
        >
          Get My Free Drink Coupon
        </button>
      )}

      {coupon && <CouponReveal coupon={coupon} />}
    </div>
  );
}
