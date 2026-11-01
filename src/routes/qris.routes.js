'use strict';

const path = require('path');
const { Router } = require('express');
const QRCode = require('qrcode');
const config = require('../config');
const checkout = require('../services/checkout.service');
const { requireApiKey } = require('../middleware/api-key');
const { rateLimit } = require('../middleware/rate-limit');
const { asyncHandler } = require('../middleware/async-handler');

const router = Router();
const publicStatusLimit = rateLimit({ windowMs: 60 * 1000, max: 40 });

const baseUrl = (req) => config.publicBaseUrl || `${req.protocol}://${req.get('host')}`;

// Buat QRIS dinamis (GET query atau POST body)
router.all('/create-qris', requireApiKey, (req, res) => {
  const order = checkout.create(req.body?.amount ?? req.query.amount);
  res.json({
    success: true,
    data: {
      qris_id: order.id,
      trx_id: order.trxId,
      qris_url: `${baseUrl(req)}/qr/${order.id}`,
      qris_code: order.code,
      amount: order.amount,
      expires_at: order.expiresAt.toISOString(),
      expires_in: '5 menit',
    },
  });
});

// Halaman bayar untuk pembeli. Gambar mentah: ?format=raw atau ?raw=1
router.get('/qr/:id', (req, res) => {
  if (req.query.format === 'raw' || req.query.raw === '1') {
    return res.redirect(302, `/qr/${encodeURIComponent(req.params.id)}/image.svg`);
  }
  res.sendFile(path.join(config.publicDir, 'pay.html'));
});

router.get('/qr/:id/image.svg', async (req, res) => {
  const order = checkout.get(req.params.id);
  if (!order) return res.status(404).send('QRIS tidak ditemukan');
  if (checkout.isExpired(order)) return res.status(410).send('QRIS kedaluwarsa');

  const svg = await QRCode.toString(order.code, { type: 'svg', margin: 1, errorCorrectionLevel: 'M' });
  res.type('image/svg+xml').set('Cache-Control', 'no-store').send(svg);
});

// Status publik untuk halaman bayar (tanpa API key)
router.get(
  '/api/qr-status/:id',
  publicStatusLimit,
  asyncHandler(async (req, res) => {
    const result = await checkout.checkStatus(req.params.id);
    res.json({ success: result.status === 'PAID' || result.status === 'PENDING', ...result });
  })
);

module.exports = router;
