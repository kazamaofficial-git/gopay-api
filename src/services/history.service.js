'use strict';

const transactions = require('./transaction.service');
const { badRequest } = require('../utils/errors');

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_PAGE_SIZE = 100;

function fromUnixSeconds(value, fallback) {
  if (value === undefined || value === '') return fallback;
  const seconds = Number(value);
  if (!Number.isFinite(seconds)) throw badRequest('startTime/endTime harus berupa unix timestamp (detik)');
  return new Date(seconds * 1000);
}

/** Riwayat mutasi dalam format ringkas. startTime/endTime dalam unix detik. */
async function load({ startTime, endTime, pageSize, merchantId } = {}) {
  const now = new Date();
  const size = Math.min(Math.max(parseInt(pageSize, 10) || 20, 1), MAX_PAGE_SIZE);

  const items = await transactions.list({
    from: fromUnixSeconds(startTime, new Date(now.getTime() - 3 * DAY_MS)),
    to: fromUnixSeconds(endTime, now),
    size,
    merchantId,
  });

  const formatted = items.map(transactions.toHistoryItem);
  return {
    success: true,
    total_amount: String(formatted.reduce((sum, tx) => sum + tx.amount, 0)),
    data: { transactions: formatted },
  };
}

const startOfMonthUnix = () => {
  const now = new Date();
  return Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000);
};

module.exports = { load, startOfMonthUnix, MAX_PAGE_SIZE };
