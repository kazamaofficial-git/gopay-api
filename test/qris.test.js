'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { buildDynamicQris, calculateCrc16, parseTlv, parseAmount } = require('../src/services/qris.service');
const { normalizePhone } = require('../src/utils/phone');

// QRIS statis contoh (bukan merchant asli), CRC dihitung dari isi di atasnya.
const tlv = (tag, value) => `${tag}${String(value.length).padStart(2, '0')}${value}`;
const withCrc = (body) => body + '6304' + calculateCrc16(body + '6304');
const STATIC = withCrc(
  tlv('00', '01') + tlv('01', '11') + tlv('26', 'ID.CO.EXAMPLE.WWW0118ID1234567890123') +
  tlv('52', '5812') + tlv('53', '360') + tlv('58', 'ID') + tlv('59', 'TOKO CONTOH') + tlv('60', 'JAKARTA')
);

test('CRC16 sesuai vektor uji CCITT-FALSE', () => {
  assert.equal(calculateCrc16('123456789'), '29B1');
});

test('QRIS dinamis: initiation 12, nominal ada sebelum negara, CRC valid', () => {
  const dynamic = buildDynamicQris(STATIC, 25000);
  const tags = parseTlv(dynamic);
  const byTag = Object.fromEntries(tags.map((t) => [t.tag, t.value]));

  assert.equal(byTag['01'], '12');
  assert.equal(byTag['54'], '25000');
  assert.ok(tags.findIndex((t) => t.tag === '54') < tags.findIndex((t) => t.tag === '58'));
  assert.equal(tags.at(-1).tag, '63');

  const body = dynamic.slice(0, -4);
  assert.equal(dynamic.slice(-4), calculateCrc16(body));
});

test('QRIS dinamis mengganti nominal lama, tidak menduplikasi tag 54', () => {
  const again = buildDynamicQris(buildDynamicQris(STATIC, 1000), 2500);
  const amounts = parseTlv(again).filter((t) => t.tag === '54');
  assert.deepEqual(amounts.map((t) => t.value), ['2500']);
});

test('nominal tidak valid ditolak', () => {
  for (const bad of [0, -5, 'abc', 10.5, undefined, '']) {
    assert.throws(() => parseAmount(bad), /Nominal tidak valid/);
  }
});

test('QRIS statis rusak ditolak', () => {
  assert.throws(() => buildDynamicQris('000201010211990', 1000), /TLV rusak/);
});

test('normalisasi nomor HP', () => {
  assert.equal(normalizePhone('0851-1977-2671'), '85119772671');
  assert.equal(normalizePhone('+6285119772671'), '85119772671');
  assert.equal(normalizePhone('12345'), null);
});
