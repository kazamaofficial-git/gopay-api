'use strict';

const { Router } = require('express');
const { requireApiKey } = require('../middleware/api-key');
const { asyncHandler } = require('../middleware/async-handler');
const session = require('../services/session.service');
const transactions = require('../services/transaction.service');
const logger = require('../utils/logger');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'OK', service: 'GoPay API Gateway', timestamp: new Date() });
});

router.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Layanan API GoPay berfungsi normal', timestamp: new Date() });
});

router.get(
  '/token-status',
  requireApiKey,
  asyncHandler(async (_req, res) => {
    const invalid = (message) => res.json({ success: false, data: { token_status: 'invalid', message } });

    if (!session.hasSession()) {
      return invalid('Sesi belum dikonfigurasi. Jalankan `npm run login` sekali di server.');
    }
    try {
      await transactions.list({ from: new Date(Date.now() - 60 * 60 * 1000), size: 1, statuses: transactions.STATUS.PAID });
      res.json({ success: true, data: { token_status: 'valid', message: 'Token dan sesi GoPay Merchant aktif' } });
    } catch (err) {
      invalid(err.message);
    }
  })
);

router.get('/api/logs', requireApiKey, (_req, res) => {
  res.json({ success: true, logs: logger.list() });
});

module.exports = router;
