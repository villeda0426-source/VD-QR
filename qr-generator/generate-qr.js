// After deploying, set CAMPAIGN_URL to the real URL and re-run: node generate-qr.js
const QRCode = require('qrcode');
const path   = require('path');

const CAMPAIGN_URL = process.env.CAMPAIGN_URL || 'https://villedasdelight.com';
const OUTPUT_FILE  = path.join(__dirname, 'campaign-qr.png');

QRCode.toFile(OUTPUT_FILE, CAMPAIGN_URL, {
  width:  600,
  margin: 3,
  color:  { dark: '#E91E8C', light: '#FFFFFF' },
  errorCorrectionLevel: 'H',
}, (err) => {
  if (err) { console.error('QR generation failed:', err); process.exit(1); }
  console.log(`QR code saved to: ${OUTPUT_FILE}`);
  console.log(`Points to: ${CAMPAIGN_URL}`);
  console.log('Print at 2"×2" minimum for reliable scanning.');
});
