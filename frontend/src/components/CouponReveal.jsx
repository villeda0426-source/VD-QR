import { useState } from 'react';
import { COUPON_REWARD } from '../config/config.js';

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function CouponReveal({ coupon }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(coupon.code);
    } catch {
      // fallback for older mobile browsers
      const el = document.createElement('textarea');
      el.value = coupon.code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();

  return (
    <div className="coupon-overlay">
      <div className="coupon-sheet">
        <span className="coupon-emoji">🎉</span>
        <h2 className="coupon-title">You earned it!</h2>
        <p className="coupon-reward">{COUPON_REWARD}</p>

        <div className="coupon-code-box">
          <span className="coupon-code">{coupon.code}</span>
          <button
            className={`copy-btn ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
          >
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        {coupon.redeemed && (
          <p style={{ color: '#1565C0', fontWeight: 700, marginTop: 12 }}>
            This coupon has already been redeemed.
          </p>
        )}

        {isExpired && !coupon.redeemed && (
          <p style={{ color: '#E65100', fontWeight: 700, marginTop: 12 }}>
            This coupon has expired.
          </p>
        )}

        {coupon.expires_at && !coupon.redeemed && !isExpired && (
          <p className="coupon-expires">
            Valid until {formatDate(coupon.expires_at)}
          </p>
        )}

        <p className="coupon-note">Show this screen to the cashier</p>
      </div>
    </div>
  );
}
