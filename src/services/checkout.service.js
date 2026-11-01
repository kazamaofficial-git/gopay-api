'use strict';

const config = require('../config');
const store = require('../stores/qris.store');
const qris = require('./qris.service');
const payment = require('./payment.service');
const logger = require('../utils/logger');
const { createQrisId, createTrxId } = require('../utils/ids');
const { AppError } = require('../utils/errors');

function create(amount) {
  if (!config.qrisStatic) {
    throw new AppError(500, 'QRIS_STATIC belum dikonfigurasi di .env', 'QRIS_NOT_CONFIGURED');
  }
  const value = qris.parseAmount(amount);
  const now = Date.now();

  const order = store.create({
    id: createQrisId(),
    trxId: createTrxId(),
    code: qris.buildDynamicQris(config.qrisStatic, value),
    amount: value,
    status: 'PENDING',
    transaction: null,
    createdAt: new Date(now),
    expiresAt: new Date(now + config.qris.ttlMs),
    lastCheckedAt: 0,
  });

  logger.info(`QRIS dinamis dibuat | TRX-ID: ${order.trxId} | Nominal: Rp ${value}`);
  return order;
}

const summary = (order) => ({
  amount: order.amount,
  created_at: order.createdAt.toISOString(),
  expires_at: order.expiresAt.toISOString(),
});

/** Status publik untuk halaman bayar. Tidak membutuhkan API key. */
async function checkStatus(id) {
  const order = store.get(id);
  if (!order) return { status: 'NOT_FOUND', paid: false, message: 'QRIS tidak ditemukan' };

  const base = { order: summary(order) };

  if (order.status === 'PAID') {
    return { ...base, status: 'PAID', paid: true, transaction: order.transaction };
  }
  if (store.isExpired(order)) {
    return { ...base, status: 'EXPIRED', paid: false, message: 'QRIS sudah kedaluwarsa' };
  }

  const pending = { ...base, status: 'PENDING', paid: false, message: 'Belum ada pembayaran masuk' };

  // Batasi jumlah request ke Gojek agar akun merchant tidak terkena rate limit.
  if (Date.now() - order.lastCheckedAt < config.qris.minCheckGapMs) return pending;
  order.lastCheckedAt = Date.now();

  try {
    const matched = await payment.verify({
      amount: order.amount,
      since: order.createdAt,
      scope: order.trxId,
    });
    if (!matched) return pending;

    order.status = 'PAID';
    order.transaction = matched;
    logger.success(`QRIS ${order.id} lunas | Rp ${order.amount}`, { trx_id: order.trxId });
    return { ...base, status: 'PAID', paid: true, transaction: matched };
  } catch (err) {
    logger.error(`Gagal memeriksa QRIS ${order.id}: ${err.message}`);
    return { ...pending, message: 'Gagal memeriksa pembayaran. Coba lagi sebentar.' };
  }
}

module.exports = { create, checkStatus, get: store.get, isExpired: store.isExpired };
