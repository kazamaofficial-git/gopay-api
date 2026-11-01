'use strict';

const config = require('../config');

// txId -> { scope, claimedAt }. Satu transaksi hanya boleh diklaim satu scope (trx_id / qris).
const claims = new Map();

/**
 * @returns {'claimed'|'owned'|'taken'}
 *  claimed: baru diklaim scope ini, owned: sudah milik scope ini, taken: milik scope lain.
 */
function claim(txId, scope) {
  const existing = claims.get(txId);
  if (!existing) {
    claims.set(txId, { scope, claimedAt: Date.now() });
    return 'claimed';
  }
  return scope && existing.scope === scope ? 'owned' : 'taken';
}

function startCleanup() {
  const timer = setInterval(() => {
    const cutoff = Date.now() - config.claims.ttlMs;
    for (const [txId, entry] of claims) {
      if (entry.claimedAt < cutoff) claims.delete(txId);
    }
  }, config.claims.cleanupEveryMs);
  timer.unref();
}

module.exports = { claim, startCleanup };
