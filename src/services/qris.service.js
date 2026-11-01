'use strict';

const { badRequest } = require('../utils/errors');

const TAG = Object.freeze({ INITIATION: '01', AMOUNT: '54', COUNTRY: '58', CRC: '63' });
const DYNAMIC_INITIATION = '12';

/** CRC16-CCITT (poly 0x1021, init 0xFFFF) sesuai standar EMVCo. */
function calculateCrc16(payload) {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function parseTlv(payload) {
  const tags = [];
  let cursor = 0;
  while (cursor < payload.length) {
    const tag = payload.slice(cursor, cursor + 2);
    const length = Number.parseInt(payload.slice(cursor + 2, cursor + 4), 10);
    const end = cursor + 4 + length;
    if (!Number.isInteger(length) || end > payload.length) {
      throw new Error('QRIS_STATIC tidak valid: struktur TLV rusak');
    }
    tags.push({ tag, value: payload.slice(cursor + 4, end) });
    cursor = end;
  }
  return tags;
}

const serializeTlv = (tags) =>
  tags.map(({ tag, value }) => `${tag}${String(value.length).padStart(2, '0')}${value}`).join('');

function parseAmount(amount) {
  const value = Number(amount);
  if (!Number.isInteger(value) || value <= 0) {
    throw badRequest('Nominal tidak valid. Gunakan bilangan bulat Rupiah lebih dari 0, contoh ?amount=25000');
  }
  return value;
}

/** Ubah QRIS statis menjadi QRIS dinamis dengan nominal tertentu. */
function buildDynamicQris(staticQris, amount) {
  const value = parseAmount(amount);
  const tags = parseTlv(String(staticQris).trim()).filter((t) => t.tag !== TAG.CRC);

  const output = [];
  let amountWritten = false;
  const writeAmount = () => {
    output.push({ tag: TAG.AMOUNT, value: String(value) });
    amountWritten = true;
  };

  for (const item of tags) {
    if (item.tag === TAG.INITIATION) {
      output.push({ tag: TAG.INITIATION, value: DYNAMIC_INITIATION });
    } else if (item.tag === TAG.AMOUNT) {
      if (!amountWritten) writeAmount();
    } else {
      if (item.tag === TAG.COUNTRY && !amountWritten) writeAmount();
      output.push(item);
    }
  }
  if (!amountWritten) writeAmount();

  const body = `${serializeTlv(output)}${TAG.CRC}04`;
  return body + calculateCrc16(body);
}

module.exports = { buildDynamicQris, calculateCrc16, parseAmount, parseTlv };
