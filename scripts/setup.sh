#!/usr/bin/env bash
# GoPay API | Kazama Tech
# Persiapan cepat untuk VPS dan cPanel: cek Node.js, buat .env, install dependency.
set -euo pipefail

cd "$(dirname "$0")/.."

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info() { echo -e "[INFO] $*"; }
ok()   { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[PERINGATAN]${NC} $*"; }

if ! command -v node >/dev/null 2>&1; then
  echo -e "${RED}[ERROR]${NC} Node.js belum terpasang. Pasang Node.js 18 atau lebih baru."
  exit 1
fi

NODE_MAJOR=$(node -p "process.versions.node.split('.')[0]")
info "Node.js terdeteksi: $(node -v)"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo -e "${RED}[ERROR]${NC} Dibutuhkan Node.js 18 atau lebih baru."
  exit 1
fi
if [ "$NODE_MAJOR" -ge 20 ]; then
  warn "Di cPanel CloudLinux, Node.js 20 bisa memicu 'Out of Memory WebAssembly'. Gunakan 18.x di cPanel."
fi

if [ ! -f .env ]; then
  cp .env.example .env
  ok ".env dibuat dari .env.example. Isi API_KEY dan QRIS_STATIC sebelum menjalankan server."
else
  info ".env sudah ada."
fi

info "Memasang dependency..."
npm install --omit=dev
ok "Dependency terpasang."

echo
read -r -p "Login OTP GoBiz sekarang? (y/n): " RUN_LOGIN
if [[ "$RUN_LOGIN" =~ ^[Yy]$ ]]; then
  npm run login
else
  info "Login kapan saja dengan: npm run login"
fi

echo
ok "Selesai. Jalankan server dengan: npm start"
echo "Dokumentasi ada di /docs setelah server berjalan."
echo "Di cPanel: set startup file ke server.js, pilih Node.js 18.x, lalu klik Restart."
