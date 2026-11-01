'use strict';

/** Tombol salin untuk setiap blok kode yang punya data-copy. */
document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const target = document.getElementById(button.dataset.copy);
    if (!target) return;
    try {
      await navigator.clipboard.writeText(target.innerText);
      const original = button.textContent;
      button.textContent = 'Tersalin';
      setTimeout(() => { button.textContent = original; }, 1500);
    } catch {
      button.textContent = 'Gagal menyalin';
    }
  });
});

/** Penanda status server di halaman depan. */
const statusPill = document.getElementById('server-status');
if (statusPill) {
  const dot = statusPill.querySelector('.dot');
  const label = statusPill.querySelector('.label');
  fetch('/health')
    .then((res) => (res.ok ? res.json() : Promise.reject()))
    .then(() => { dot.classList.add('ok'); label.textContent = 'Server online'; })
    .catch(() => { dot.classList.add('bad'); label.textContent = 'Server tidak terjangkau'; });
}
