'use strict';

const readline = require('readline/promises');
const gojek = require('../services/gojek.client');
const session = require('../services/session.service');
const transactions = require('../services/transaction.service');
const config = require('../config');
const { normalizePhone } = require('../utils/phone');

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    console.log(`\n${config.brand.name} | Login OTP GoBiz (cukup sekali)\n`);

    const phone = normalizePhone(await rl.question('Nomor HP GoBiz (contoh 0851xxxxxxx): '));
    if (!phone) throw new Error('Format nomor HP tidak valid');

    const { otpToken } = await gojek.requestOtp(phone);
    console.log('Kode OTP dikirim via SMS/WA.');

    const otp = (await rl.question('Masukkan kode OTP: ')).trim();
    if (!otp) throw new Error('Kode OTP kosong');

    session.create(await gojek.exchangeOtp(otpToken, otp));
    console.log('Login berhasil, sesi tersimpan.');

    try {
      await transactions.list({ from: new Date(Date.now() - 60 * 60 * 1000), size: 1, statuses: transactions.STATUS.PAID });
      console.log('Verifikasi sesi ke API GoPay: OK');
    } catch (err) {
      console.warn(`Sesi tersimpan, tetapi verifikasi gagal: ${err.message}`);
      console.warn('Periksa GOPAY_MERCHANT_ID di .env.');
    }
  } catch (err) {
    const detail = err.response ? ` (HTTP ${err.response.status})` : '';
    console.error(`\nLogin gagal: ${err.message}${detail}`);
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main();
