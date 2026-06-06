const express  = require('express');
const router   = express.Router();
const supabase = require('../supabase');
const { PLATFORMS } = require('../config');

// POST /api/session  — create or hydrate a session
router.post('/', async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

    await supabase
      .from('sessions')
      .upsert({ session_id: sessionId }, { onConflict: 'session_id' });

    const { data: actions } = await supabase
      .from('actions')
      .select('platform')
      .eq('session_id', sessionId);

    const { data: coupon } = await supabase
      .from('coupons')
      .select('code, expires_at, redeemed')
      .eq('session_id', sessionId)
      .maybeSingle();

    const visitedPlatforms = actions ? actions.map(a => a.platform) : [];
    const allVisited = PLATFORMS.every(p => visitedPlatforms.includes(p));

    res.json({ sessionId, visitedPlatforms, allVisited, coupon: coupon || null });
  } catch (err) {
    console.error('session POST:', err.message);
    res.status(500).json({ error: 'Failed to process session' });
  }
});

// POST /api/session/:sessionId/action  — record a platform visit
router.post('/:sessionId/action', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { platform }  = req.body;

    if (!PLATFORMS.includes(platform))
      return res.status(400).json({ error: 'Invalid platform' });

    const { data: session } = await supabase
      .from('sessions')
      .select('session_id')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (!session) return res.status(404).json({ error: 'Session not found' });

    await supabase
      .from('actions')
      .upsert({ session_id: sessionId, platform }, { onConflict: 'session_id,platform' });

    const { data: actions } = await supabase
      .from('actions')
      .select('platform')
      .eq('session_id', sessionId);

    const visitedPlatforms = actions.map(a => a.platform);
    const allVisited = PLATFORMS.every(p => visitedPlatforms.includes(p));

    res.json({ visitedPlatforms, allVisited });
  } catch (err) {
    console.error('action POST:', err.message);
    res.status(500).json({ error: 'Failed to track action' });
  }
});

module.exports = router;
