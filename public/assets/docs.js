'use strict';

const PLACEHOLDER_ORIGIN = 'https://api.tokomu.id';
const origin = /^https?:$/.test(location.protocol) ? location.origin : PLACEHOLDER_ORIGIN;

const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const highlightJson = (text) =>
  escapeHtml(text).replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g,
    (match, str, colon) => {
      if (str) return colon ? `<span class="t-k">${str}</span>${colon}` : `<span class="t-s">${str}</span>`;
      return `<span class="t-n">${match}</span>`;
    }
  );

const highlightCode = (text) =>
  escapeHtml(text).replace(/^(\s*(?:#|\/\/).*)$|("(?:\\.|[^"\\\n])*")/gm, (match, comment, string) =>
    comment ? `<span class="t-c">${comment}</span>` : `<span class="t-s">${string}</span>`
  );

/** Pakai alamat server yang sedang dibuka sebagai contoh, lalu beri warna sintaks. */
document.querySelectorAll('.doc .code pre').forEach((pre) => {
  const text = pre.textContent.split(PLACEHOLDER_ORIGIN).join(origin);
  pre.innerHTML = text.trimStart().startsWith('{') ? highlightJson(text) : highlightCode(text);
});

const baseUrl = document.getElementById('base-url');
if (baseUrl) baseUrl.textContent = origin;

/** Tab: setiap grup [role=tablist] mengatur panel yang ditunjuk aria-controls. */
document.querySelectorAll('[role="tablist"]').forEach((list) => {
  const tabs = [...list.querySelectorAll('[role="tab"]')];

  const select = (selected) => {
    tabs.forEach((tab) => {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (event) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
      if (!step) return;
      const next = tabs[(index + step + tabs.length) % tabs.length];
      next.focus();
      select(next);
    });
  });
});

/** Tandai item daftar isi sesuai bagian yang sedang dibaca. */
const tocLinks = [...document.querySelectorAll('.toc a')];
const targets = tocLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tocLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    },
    { rootMargin: '-110px 0px -70% 0px' }
  );
  targets.forEach((el) => observer.observe(el));
}
