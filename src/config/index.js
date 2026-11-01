'use strict';

const path = require('path');
require('dotenv').config();

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

const env = (key, fallback = '') => {
  const value = process.env[key];
  return value === undefined || value.trim() === '' ? fallback : value.trim();
};

module.exports = Object.freeze({
  rootDir: ROOT_DIR,
  publicDir: path.join(ROOT_DIR, 'public'),

  port: Number(env('PORT', '3000')),
  trustProxy: Number(env('TRUST_PROXY', '1')),
  publicBaseUrl: env('PUBLIC_BASE_URL').replace(/\/+$/, ''),

  apiKey: env('API_KEY'),
  qrisStatic: env('QRIS_STATIC'),
  merchantId: env('GOPAY_MERCHANT_ID'),

  sessionFile: env('SESSION_FILE', path.join(ROOT_DIR, '.GOPAY_SESI_JANGAN_DIHAPUS.json')),

  qris: {
    ttlMs: 5 * MINUTE,
    purgeAfterMs: HOUR,
    minCheckGapMs: 3 * 1000,
  },

  claims: {
    ttlMs: 24 * HOUR,
    cleanupEveryMs: HOUR,
  },

  logs: { max: 100 },

  session: {
    refreshCheckEveryMs: 30 * MINUTE,
    expiryMarginMs: 5 * MINUTE,
  },

  // Endpoint Gojek/GoBiz tidak resmi. Semua bisa di-override lewat .env bila berubah.
  gojek: {
    authUrl: env('GOJEK_AUTH_URL', 'https://accounts.goto-products.com'),
    clientId: env('GOJEK_CLIENT_ID', 'go-biz-web-new'),
    transactionsUrl: env(
      'GOJEK_TRANSACTIONS_URL',
      'https://api.gojekapi.com/merchant-analytics/v2/merchants/transactions'
    ),
    userAgent: env(
      'GOJEK_USER_AGENT',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
    ),
    timeoutMs: 10 * 1000,
  },

  brand: {
    name: 'Kazama Tech',
    repoUrl: 'https://github.com/kazamaofficial-git/gopay-api',
  },
});
