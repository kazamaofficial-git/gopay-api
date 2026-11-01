'use strict';

const { Router } = require('express');
const payment = require('../services/payment.service');
const history = require('../services/history.service');
const logger = require('../utils/logger');
const { requireApiKey } = require('../middleware/api-key');
const { asyncHandler } = require('../middleware/async-handler');

const router = Router();
const merchantHeader = (req) => req.get('x-gopay-merchant-id') || null;

// Cek pembayaran masuk (GET query atau POST body)
router.all(
  '/check-payment',
  requireApiKey,
  asyncHandler(async (req, res) => {
    const source = { ...req.query, ...req.body };
    const transaction = await payment.verify({
      amount: source.amount,
      since: source.startTime || source.start_time,
      merchantId: merchantHeader(req),
      scope: source.trx_id || null,
    });

    if (!transaction) {
      return res.json({ success: true, paid: false, message: 'Pembayaran belum ditemukan atau sudah pernah diklaim' });
    }
    logger.success(`Pembayaran terverifikasi untuk nominal Rp ${transaction.amount}`, transaction);
    res.json({ success: true, paid: true, transaction });
  })
);

router.get(
  '/transactions',
  requireApiKey,
  asyncHandler(async (req, res) => {
    res.json(await history.load({ ...req.query, merchantId: merchantHeader(req) }));
  })
);

// Semua transaksi sejak awal bulan ini
router.get(
  '/transactions/all',
  requireApiKey,
  asyncHandler(async (req, res) => {
    res.json(
      await history.load({
        startTime: history.startOfMonthUnix(),
        pageSize: history.MAX_PAGE_SIZE,
        merchantId: merchantHeader(req),
      })
    );
  })
);

module.exports = router;
