require('dotenv').config();
const express = require('express');
const cors = require('cors');

const sessionRoutes = require('./routes/session');
const couponRoutes  = require('./routes/coupon');
const adminRoutes   = require('./routes/admin');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/api/session', sessionRoutes);
app.use('/api/coupon',  couponRoutes);
app.use('/api/admin',   adminRoutes);

app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Local / Render: start HTTP server. Vercel: export app as handler.
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => console.log(`Villedas Delight API running on port ${PORT}`));
}
