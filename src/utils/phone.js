'use strict';

/**
 * Ubah input nomor HP (0851..., +62851..., 62851...) menjadi format tanpa kode negara: 851...
 * Mengembalikan null bila format tidak masuk akal.
 */
function normalizePhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  const local = digits.replace(/^(62|0)/, '');
  return /^8\d{7,12}$/.test(local) ? local : null;
}

module.exports = { normalizePhone };
