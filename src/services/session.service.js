'use strict';

const fs = require('fs');
const config = require('../config');
const gojek = require('./gojek.client');
const logger = require('../utils/logger');

let refreshInFlight = null;

function load() {
  try {
    return JSON.parse(fs.readFileSync(config.sessionFile, 'utf8'));
  } catch (err) {
    if (err.code !== 'ENOENT') logger.error(`Gagal membaca file sesi: ${err.message}`);
    return null;
  }
}

function save(session) {
  fs.writeFileSync(config.sessionFile, JSON.stringify(session, null, 2), { mode: 0o600 });
}

function fromTokenResponse(tokens, previous = null) {
  const accessToken = tokens?.access_token;
  if (!accessToken) throw new Error('Respon token tidak berisi access_token');
  const expiresInSec = Number(tokens.expires_in) || 3600;
  return {
    access_token: accessToken,
    refresh_token: tokens.refresh_token || previous?.refresh_token || null,
    expires_at: Date.now() + expiresInSec * 1000,
    updated_at: new Date().toISOString(),
  };
}

function isExpired(session) {
  return !session.expires_at || Date.now() >= session.expires_at - config.session.expiryMarginMs;
}

/** Simpan sesi baru hasil login OTP. */
function create(tokens) {
  const session = fromTokenResponse(tokens);
  save(session);
  logger.info('Sesi GoPay baru tersimpan');
  return session;
}

/** Perbarui token memakai refresh token. Mengembalikan sesi baru, atau null jika gagal. */
function refresh() {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const current = load();
    if (!current?.refresh_token) return null;
    try {
      const tokens = await gojek.refreshTokens(current.refresh_token);
      const next = fromTokenResponse(tokens, current);
      save(next);
      logger.info('Token GoPay berhasil diperbarui');
      return next;
    } catch (err) {
      logger.error(`Gagal memperbarui token: ${err.message}`);
      return null;
    }
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
}

/** Header siap pakai untuk API Gojek, atau null bila belum login. */
async function getHeaders() {
  let session = load();
  if (!session?.access_token) return null;
  if (isExpired(session) && session.refresh_token) {
    session = (await refresh()) || session;
  }
  return gojek.buildHeaders(session.access_token);
}

function startAutoRefresh() {
  const timer = setInterval(() => {
    const session = load();
    if (session?.refresh_token && isExpired(session)) {
      logger.info('Auto refresh: token hampir kedaluwarsa, memperbarui sesi');
      refresh();
    }
  }, config.session.refreshCheckEveryMs);
  timer.unref();
}

module.exports = { create, refresh, getHeaders, startAutoRefresh, hasSession: () => Boolean(load()?.access_token) };
