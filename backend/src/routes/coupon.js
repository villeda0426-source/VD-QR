const express  = require('express');
const router   = express.Router();
const crypto   = require('crypto');
const supabase = require('../supabase');
const { PLATFORMS, COUPON_PREFIX, COUPON_EXPIRATION_DAYS } = require('../config');

const CHARSET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars (0/O, 1/I)

function makeCouponCode() {
  const bytes = crypto.randomBytes(6);
  let suffix  = '';
  for (let i = 0; i < 6; i++) suffix += CHARSET[bytes[i] % CHARSET.length];
  return `${COUPON_PREFIX}-${suffix}`;
}

// POST /api/coupon/generate
router.post('/generate', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

    // Return existing coupon if already generated
    const { data: existing } = await supabase
      .from('coupons')
      .select('code, expires_at, redeemed')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (existing) return res.json({ coupon: existing });

    // Verify all platforms visited
    const { data: actions } = await supabase
      .from('actions')
      .select('platform')
      .eq('session_id', sessionId);

    const visited = actions ? actions.map(a => a.platform) : [];
    if (!PLATFORMS.every(p => visited.includes(p)))
      return res.status(403).json({ error: 'Not all platforms visited yet' });

    // Generate a unique code (retry up to 5 times on collision)
    let code;
    for (let i = 0; i < 5; i++) {
      const candidate = makeCouponCode();
      const { data: collision } = await supabase
        .from('coupons').select('code').eq('code', candidate).maybeSingle();
      if (!collision) { code = candidate; break; }
    }
    if (!code) throw new Error('Could not generate unique code');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + COUPON_EXPIRATION_DAYS);

    const { data: coupon, error } = await supabase
      .from('coupons')
      .insert({ code, session_id: sessionId, expires_at: expiresAt.toISOString() })
      .select('code, expires_at, redeemed')
      .single();

    if (error) throw error;
    res.json({ coupon });
  } catch (err) {
    console.error('coupon generate:', err.message);
    res.status(500).json({ error: 'Failed to generate coupon' });
  }
});

module.exports = router;
