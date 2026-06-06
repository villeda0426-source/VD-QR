const express  = require('express');
const router   = express.Router();
const supabase = require('../supabase');

function requireAuth(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_API_KEY)
    return res.status(401).json({ error: 'Unauthorized' });
  next();
}

// GET /api/admin/stats
router.get('/stats', requireAuth, async (_req, res) => {
  try {
    const [{ count: total }, { count: redeemed }, { count: sessions }] = await Promise.all([
      supabase.from('coupons').select('*', { count: 'exact', head: true }),
      supabase.from('coupons').select('*', { count: 'exact', head: true }).eq('redeemed', true),
      supabase.from('sessions').select('*', { count: 'exact', head: true }),
    ]);
    res.json({ totalSessions: sessions, totalCoupons: total, redeemedCoupons: redeemed, pendingCoupons: total - redeemed });
  } catch (err) {
    console.error('admin stats:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/admin/coupons
router.get('/coupons', requireAuth, async (_req, res) => {
  try {
    const { data: coupons, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ coupons });
  } catch (err) {
    console.error('admin coupons:', err.message);
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// PATCH /api/admin/coupons/:code/redeem
router.patch('/coupons/:code/redeem', requireAuth, async (req, res) => {
  try {
    const { code } = req.params;
    const { redeemedBy = 'staff' } = req.body;

    const { data: coupon, error } = await supabase
      .from('coupons')
      .update({ redeemed: true, redeemed_at: new Date().toISOString(), redeemed_by: redeemedBy })
      .eq('code', code)
      .eq('redeemed', false)
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!coupon) return res.status(404).json({ error: 'Coupon not found or already redeemed' });
    res.json({ coupon });
  } catch (err) {
    console.error('admin redeem:', err.message);
    res.status(500).json({ error: 'Failed to redeem coupon' });
  }
});

module.exports = router;
