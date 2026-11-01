'use strict';

const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const session = require('./services/session.service');
const claims = require('./stores/claim.store');
const orders = require('./stores/qris.store');

function warnAboutConfig() {
  if (!config.apiKey || config.apiKey === 'YOUR_API_KEY_HERE') logger.warn('API_KEY belum diisi di .env, endpoint backend akan menolak semua request');
  if (!config.qrisStatic) logger.warn('QRIS_STATIC belum diisi di .env, /create-qris tidak bisa dipakai');
  if (!session.hasSession()) logger.warn('Sesi GoPay belum ada. Jalankan `npm run login` sekali di server');
}

claims.startCleanup();
orders.startCleanup();
session.startAutoRefresh();

const server = app.listen(config.port, () => {
  logger.system(`${config.brand.name} GoPay API berjalan di port ${config.port}`);
  warnAboutConfig();
});

const shutdown = (signal) => {
  logger.system(`${signal} diterima, menutup server`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10 * 1000).unref();
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
