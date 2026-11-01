'use strict';

const axios = require('axios');
const config = require('../config');

const { authUrl, clientId, transactionsUrl, userAgent, timeoutMs } = config.gojek;

const jsonHeaders = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'User-Agent': userAgent,
};

function buildHeaders(accessToken) {
  return {
    ...jsonHeaders,
    Authorization: `Bearer ${accessToken}`,
    'x-user-locale': 'id',
  };
}

/** Minta kode OTP (SMS/WA) ke nomor merchant. Mengembalikan { otpToken }. */
async function requestOtp(localPhone) {
  const { data } = await axios.post(
    `${authUrl}/goid/login/request`,
    { client_id: clientId, country_code: '+62', phone_number: localPhone },
    { headers: jsonHeaders, timeout: timeoutMs }
  );
  const otpToken = data?.data?.otp_token || data?.otp_token;
  if (!otpToken) throw new Error('Respon permintaan OTP tidak berisi otp_token');
  return { otpToken };
}

/** Tukar kode OTP dengan access token + refresh token. */
async function exchangeOtp(otpToken, otp) {
  const { data } = await axios.post(
    `${authUrl}/goid/token`,
    { client_id: clientId, grant_type: 'otp', data: { otp, otp_token: otpToken } },
    { headers: jsonHeaders, timeout: timeoutMs }
  );
  return data;
}

async function refreshTokens(refreshToken) {
  const { data } = await axios.post(
    `${authUrl}/goid/token`,
    { client_id: clientId, grant_type: 'refresh_token', data: { refresh_token: refreshToken } },
    { headers: jsonHeaders, timeout: timeoutMs }
  );
  return data;
}

function fetchTransactions(headers, params) {
  return axios.get(transactionsUrl, { headers, params, timeout: timeoutMs });
}

module.exports = { buildHeaders, requestOtp, exchangeOtp, refreshTokens, fetchTransactions };
