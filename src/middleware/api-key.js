'use strict';

const crypto = require('crypto');
const config = require('../config');
const { AppError } = require('../utils/errors');

const PLACEHOLDER = 'YOUR_API_KEY_HERE';

function safeEqual(a, b) {
  const left = crypto.createHash('sha256').update(a).digest();
  const right = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(left, right);
}

/** Lindungi endpoint backend. Key dibaca dari header `X-Api-Key` atau query `api_key`. */
function requireApiKey(req, _res, next) {
  if (!config.apiKey || config.apiKey === PLACEHOLDER) {
    return next(new AppError(500, 'API_KEY belum dikonfigurasi di .env', 'API_KEY_NOT_CONFIGURED'));
  }
  const provided = req.get('x-api-key') || req.query.api_key || req.query.apikey;
  if (typeof provided !== 'string' || !safeEqual(provided, config.apiKey)) {
    return next(new AppError(401, 'Autentikasi gagal: API Key tidak valid', 'INVALID_API_KEY'));
  }
  next();
}

module.exports = { requireApiKey };
