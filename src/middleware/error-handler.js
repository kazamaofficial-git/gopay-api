'use strict';

const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

function notFound(req, res) {
  const wantsApi = req.path.startsWith('/api') || req.accepts(['html', 'json']) === 'json';
  if (wantsApi) return res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
  res.status(404).sendFile('404.html', { root: require('../config').publicDir });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ success: false, code: err.code, message: err.message });
  }

  if (err.response) {
    logger.error(`API GoPay membalas HTTP ${err.response.status}`);
    return res.status(502).json({
      success: false,
      code: 'UPSTREAM_ERROR',
      message: 'Gagal mengambil data dari API GoPay',
      error: `HTTP ${err.response.status}`,
    });
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, code: 'BAD_JSON', message: 'Body JSON tidak valid' });
  }

  logger.error(`Kesalahan tak terduga: ${err.message}`);
  res.status(500).json({ success: false, code: 'INTERNAL_ERROR', message: 'Terjadi kesalahan pada server' });
}

module.exports = { notFound, errorHandler };
