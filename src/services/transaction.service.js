'use strict';

const config = require('../config');
const gojek = require('./gojek.client');
const session = require('./session.service');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

const STATUS = Object.freeze({
  PAID: 'SETTLEMENT,CAPTURE',
  ALL: 'SETTLEMENT,CAPTURE,REFUND,PARTIAL_REFUND',
});
const PAYMENT_TYPES = 'QRIS,GOPAY,OFFLINE_CREDIT_CARD,OFFLINE_DEBIT_CARD,CREDIT_CARD';
const DEFAULT_ISSUER = 'GoPay / Bank';

/** Jalankan request ke Gojek; jika 401, perbarui token lalu coba sekali lagi. */
async function withSession(request) {
  const headers = await session.getHeaders();
  if (!headers) {
    throw new AppError(409, 'Sesi GoPay belum ada. Jalankan `npm run login` sekali di server.', 'SESSION_MISSING');
  }
  try {
    return await request(headers);
  } catch (err) {
    if (err.response?.status !== 401) throw err;
    logger.warn('Sesi kedaluwarsa (401), memperbarui token');
    const refreshed = await session.refresh();
    if (!refreshed) throw err;
    return request(gojek.buildHeaders(refreshed.access_token));
  }
}

/** Ambil mentah daftar transaksi dalam rentang waktu. */
async function list({ from, to = new Date(), size = 20, statuses = STATUS.ALL, merchantId }) {
  const response = await withSession((headers) =>
    gojek.fetchTransactions(headers, {
      from: 0,
      size,
      statuses,
      payment_types: PAYMENT_TYPES,
      start_time: from.toISOString(),
      end_time: to.toISOString(),
      merchant_ids: merchantId || config.merchantId,
    })
  );
  const raw = response.data?.transactions || response.data?.data?.transactions || response.data?.data || [];
  return Array.isArray(raw) ? raw : [];
}

const readAmount = (tx) =>
  parseInt(tx.gross_amount || tx.real_gross_amount || tx.amount?.value || tx.amount || 0, 10);
const readId = (tx) => tx.id || tx.order_id || tx.wallstreet_transaction_id;
const readTime = (tx) => tx.transaction_time || tx.created_at || tx.settlement_time || null;

/** Bentuk ringkas untuk endpoint /transactions. */
function toHistoryItem(tx) {
  return {
    amount: readAmount(tx),
    status: tx.transaction_status ? tx.transaction_status.toLowerCase() : 'success',
    time: readTime(tx),
    issuer: tx.qris_provider_aspi_issuer || DEFAULT_ISSUER,
    order_id: tx.order_id,
    transaction_id: tx.id,
  };
}

/** Bentuk hasil untuk pembayaran yang terverifikasi. */
function toPaymentResult(tx) {
  return {
    transaction_id: readId(tx),
    order_id: tx.order_id,
    amount: readAmount(tx),
    payer_issuer: tx.qris_provider_aspi_issuer || DEFAULT_ISSUER,
    payment_type: tx.payment_type || tx.transaction_source || 'GOPAY_INSTORE',
    transaction_time: readTime(tx),
  };
}

module.exports = { STATUS, list, readAmount, readId, readTime, toHistoryItem, toPaymentResult };
