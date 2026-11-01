'use strict';

const claims = require('../stores/claim.store');
const transactions = require('./transaction.service');
const logger = require('../utils/logger');
const { badRequest } = require('../utils/errors');

const DEFAULT_LOOKBACK_MS = 24 * 60 * 60 * 1000;

/**
 * Cari transaksi lunas dengan nominal tepat sejak `since`.
 * Setiap transaksi hanya bisa diklaim satu `scope`, sehingga dua pembayaran
 * dengan nominal sama tidak saling mengambil transaksi.
 */
async function verify({ amount, since, merchantId, scope = null }) {
  const target = Number(amount);
  if (!Number.isInteger(target) || target <= 0) throw badRequest('Nominal pembayaran tidak valid');

  const sinceDate = since ? new Date(since) : null;
  if (sinceDate && Number.isNaN(sinceDate.getTime())) {
    throw badRequest('startTime tidak valid. Gunakan format ISO, contoh 2026-01-31T10:00:00Z');
  }

  const sinceMs = sinceDate ? sinceDate.getTime() : 0;
  const from = sinceDate || new Date(Date.now() - DEFAULT_LOOKBACK_MS);

  const items = await transactions.list({
    from,
    size: 20,
    statuses: transactions.STATUS.PAID,
    merchantId,
  });

  for (const tx of items) {
    const txId = transactions.readId(tx);
    const time = new Date(transactions.readTime(tx) || 0).getTime();
    if (transactions.readAmount(tx) !== target || time < sinceMs) continue;

    const result = claims.claim(txId, scope);
    if (result === 'taken') {
      logger.info(`TRX ${txId} sudah diklaim pembayaran lain, dilewati`);
      continue;
    }
    if (result === 'claimed') logger.info(`TRX ${txId} diklaim oleh ${scope || 'manual-check'}`);
    return transactions.toPaymentResult(tx);
  }
  return null;
}

module.exports = { verify };
