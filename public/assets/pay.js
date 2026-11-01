'use strict';

const AUTO_CHECK_MS = 8000;
const orderId = decodeURIComponent(location.pathname.split('/')[2] || '');

const $ = (id) => document.getElementById(id);
const els = {
  amount: $('amount'), qrBox: $('qr-box'), timer: $('timer'), state: $('state'), stateText: $('state-text'),
  check: $('check'), auto: $('auto'), receipt: $('receipt'),
};

const rupiah = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });

let expiresAt = 0;
let finished = false;
let checking = false;
let autoTimer = null;
let countdownTimer = null;
let started = false;

function setState(state, text) {
  els.state.dataset.state = state;
  els.stateText.textContent = text;
}

function finish(state, text) {
  finished = true;
  clearInterval(autoTimer);
  clearInterval(countdownTimer);
  els.check.hidden = true;
  els.auto.parentElement.hidden = true;
  setState(state, text);
}

function showQr() {
  const img = new Image();
  img.alt = 'Kode QRIS untuk dibayar';
  img.onerror = () => { els.qrBox.innerHTML = '<span class="placeholder">QR tidak tersedia</span>'; };
  img.src = `/qr/${encodeURIComponent(orderId)}/image.svg`;
  els.qrBox.replaceChildren(img);
}

function hideQr(message) {
  els.qrBox.innerHTML = '';
  const span = document.createElement('span');
  span.className = 'placeholder';
  span.textContent = message;
  els.qrBox.appendChild(span);
}

function tick() {
  const left = Math.max(0, expiresAt - Date.now());
  const min = String(Math.floor(left / 60000)).padStart(2, '0');
  const sec = String(Math.floor((left % 60000) / 1000)).padStart(2, '0');
  els.timer.textContent = `${min}:${sec}`;
  if (left === 0 && !finished) {
    hideQr('QRIS kedaluwarsa');
    finish('expired', 'QRIS kedaluwarsa. Minta penjual membuat QRIS baru.');
  }
}

function showReceipt(tx) {
  if (!tx) return;
  $('r-order').textContent = tx.order_id || tx.transaction_id || '-';
  $('r-issuer').textContent = tx.payer_issuer || 'GoPay / Bank';
  $('r-time').textContent = tx.transaction_time ? new Date(tx.transaction_time).toLocaleString('id-ID') : '-';
  els.receipt.hidden = false;
}

/** Tampilkan QR dan mulai hitung mundur, sekali saja setelah data order diterima. */
function start() {
  if (started || finished) return;
  started = true;
  showQr();
  countdownTimer = setInterval(tick, 1000);
  tick();
}

function apply(data) {
  if (data.order) {
    els.amount.textContent = rupiah.format(data.order.amount);
    expiresAt = new Date(data.order.expires_at).getTime();
  }

  switch (data.status) {
    case 'PAID':
      hideQr('Lunas');
      els.timer.parentElement.hidden = true;
      finish('paid', 'Pembayaran berhasil');
      showReceipt(data.transaction);
      break;
    case 'EXPIRED':
      hideQr('QRIS kedaluwarsa');
      finish('expired', 'QRIS kedaluwarsa. Minta penjual membuat QRIS baru.');
      break;
    case 'NOT_FOUND':
      hideQr('QRIS tidak ditemukan');
      finish('notfound', 'QRIS tidak ditemukan. Minta penjual membuat QRIS baru.');
      els.amount.textContent = 'Rp -';
      break;
    default:
      setState('pending', 'Menunggu pembayaran');
      start();
  }
}

async function load({ manual = false } = {}) {
  if (checking || finished) return;
  checking = true;
  els.check.disabled = true;
  if (manual) els.check.textContent = 'Memeriksa...';

  try {
    const res = await fetch(`/api/qr-status/${encodeURIComponent(orderId)}`);
    if (res.status === 429) {
      setState('pending', 'Terlalu sering memeriksa. Tunggu sebentar.');
    } else {
      const data = await res.json();
      apply(data);
      if (manual && data.status === 'PENDING') setState('pending', 'Belum ada pembayaran masuk');
    }
  } catch {
    setState('pending', 'Gagal terhubung ke server. Coba lagi.');
  } finally {
    checking = false;
    els.check.disabled = false;
    els.check.textContent = 'Cek pembayaran';
  }
}

els.check.addEventListener('click', () => load({ manual: true }));
els.auto.addEventListener('change', () => {
  clearInterval(autoTimer);
  if (els.auto.checked) autoTimer = setInterval(load, AUTO_CHECK_MS);
});

load();
