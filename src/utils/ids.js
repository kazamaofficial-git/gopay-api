'use strict';

const crypto = require('crypto');

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

function randomString(length) {
  let out = '';
  for (const byte of crypto.randomBytes(length)) {
    out += ALPHABET[byte % ALPHABET.length];
  }
  return out;
}

const createQrisId = () => randomString(10);
const createTrxId = () => `TRX-${randomString(8).toUpperCase()}`;

module.exports = { createQrisId, createTrxId };
