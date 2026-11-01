<div align="center">

<!-- HEADER BANNER -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,35&height=220&section=header&text=GoPay%20API&fontSize=70&fontColor=ffffff&animation=twinkling&fontAlignY=38&desc=QRIS%20Dinamis%20%7C%20Verifikasi%20Pembayaran%20%7C%20Self-Hosted&descAlignY=58&descSize=19"/>

<!-- TYPING ANIMATION -->
<a href="https://github.com/kazamaofficial-git/gopay-api">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=61DAFB&center=true&vCenter=true&random=false&width=650&height=50&lines=GoPay+Merchant+API+Gateway+%F0%9F%92%B3;Cetak+QRIS+Dinamis+dalam+Hitungan+Milidetik+%E2%9A%A1;Cek+Pembayaran+Otomatis+%26+Anti+Klaim+Ganda+%F0%9F%9B%A1%EF%B8%8F;Dokumentasi+Publik+Langsung+di+Web+%F0%9F%93%96" alt="Typing SVG" />
</a>

<br/><br/>

<!-- PROJECT BADGES -->
<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/express-4.x-404d59?style=for-the-badge&logo=express&logoColor=61DAFB" alt="Express"/>
  <img src="https://img.shields.io/badge/QRIS-EMVCo-E4405F?style=for-the-badge" alt="QRIS"/>
  <img src="https://img.shields.io/badge/docker-ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge" alt="MIT"/>
</p>

<!-- SOCIAL BADGES -->
<p align="center">
  <a href="https://www.kazamasite.biz.id" target="_blank">
    <img src="https://img.shields.io/badge/🌐_Website-4285F4?style=for-the-badge&logoColor=white" alt="Website"/>
  </a>
  <a href="https://www.instagram.com/kazamaofficial.ig" target="_blank">
    <img src="https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram"/>
  </a>
  <a href="https://t.me/DhilzzKZ" target="_blank">
    <img src="https://img.shields.io/badge/Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram"/>
  </a>
  <a href="https://t.me/kazamachannel" target="_blank">
    <img src="https://img.shields.io/badge/Channel-Updates-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Channel"/>
  </a>
</p>

</div>

---

# 💫 Tentang Proyek

**GoPay API** adalah gateway self-hosted untuk akun **GoPay / GoBiz Merchant** buatan **[Kazama Tech](https://github.com/kazamaofficial-git)**. Satu server, satu API: toko online, bot, atau backend apa pun bisa menerima pembayaran QRIS tanpa membuka aplikasi merchant.

- 💳 **QRIS Dinamis**: ubah QRIS statis GoBiz jadi QRIS bernominal, lengkap dengan CRC16 EMVCo
- 🔍 **Verifikasi Otomatis**: cocokkan nominal dan waktu transaksi, satu transaksi hanya bisa diklaim satu `trx_id`
- 🧾 **Halaman Bayar**: link `/qr/:id` siap kirim ke pembeli, ada hitung mundur dan cek otomatis
- 📖 **Dokumentasi Publik**: panduan integrasi, contoh kode, dan deploy ada langsung di web (`/docs`)
- 🔐 **Aman**: API key timing-safe, rate limit endpoint publik, gambar QR dibuat lokal

> [!WARNING]
> Proyek tidak resmi dan tidak berafiliasi dengan PT GoTo Gojek Tokopedia Tbk / GoPay. Endpoint yang dipakai bisa berubah sewaktu-waktu, dan polling terlalu agresif bisa memicu pembatasan akun. Risiko ditanggung pengguna.

---

# ✨ Fitur

<div align="center">
  <table>
    <tr>
      <td width="50%" align="center">
        <h3>💳 QRIS Dinamis</h3>
        <p>Generate QRIS dengan nominal tepat langsung di server, tanpa API pihak ketiga.</p>
      </td>
      <td width="50%" align="center">
        <h3>🔍 Cek Pembayaran</h3>
        <p>Verifikasi transaksi lunas (SETTLEMENT/CAPTURE) dengan proteksi klaim ganda.</p>
      </td>
    </tr>
    <tr>
      <td width="50%" align="center">
        <h3>🧾 Halaman Bayar</h3>
        <p>UI neobrutalism responsif: QR, timer 5 menit, status real-time, dan struk singkat.</p>
      </td>
      <td width="50%" align="center">
        <h3>📊 Riwayat Mutasi</h3>
        <p>Ambil transaksi QRIS, GoPay, dan kartu dalam rentang waktu bebas.</p>
      </td>
    </tr>
  </table>
</div>

---

# 🚀 Mulai Cepat

```bash
git clone https://github.com/kazamaofficial-git/gopay-api.git
cd gopay-api
npm install
cp .env.example .env      # isi API_KEY dan QRIS_STATIC
npm run login             # login OTP GoBiz, cukup sekali
npm start
```

Setelah server berjalan, buka alamat berikut di browser:

| 🔗 Alamat | 📝 Isi |
|---|---|
| `/` | Halaman depan |
| `/docs` | Dokumentasi publik, contoh kode, dan panduan deploy |
| `/qr/:id` | Halaman bayar untuk pembeli |
| `/health` | Health check |

### ⚙️ Konfigurasi `.env`

| Variabel | Wajib | Keterangan |
|---|:---:|---|
| `API_KEY` | ✅ | Kunci rahasia endpoint backend, buat yang panjang dan acak |
| `QRIS_STATIC` | ✅ | Isi QRIS statis dari aplikasi GoBiz (diawali `000201`) |
| `GOPAY_MERCHANT_ID` | ➖ | ID merchant GoBiz (disarankan) |
| `PORT` | ➖ | Bawaan `3000` |
| `PUBLIC_BASE_URL` | ➖ | Alamat publik untuk membentuk `qris_url`, contoh `https://api.tokomu.id` |
| `TRUST_PROXY` | ➖ | Jumlah proxy di depan server, bawaan `1` (Nginx) |

---

# 🔌 API Endpoint

| Method | Path | Akses | Fungsi |
|---|---|:---:|---|
| `GET` `POST` | `/create-qris` | 🔑 | Buat QRIS dinamis |
| `GET` `POST` | `/check-payment` | 🔑 | Cek pembayaran masuk |
| `GET` | `/qr/:id` | 🌐 | Halaman bayar pembeli |
| `GET` | `/api/qr-status/:id` | 🌐 | Status satu QRIS |
| `GET` | `/transactions` | 🔑 | Riwayat mutasi |
| `GET` | `/transactions/all` | 🔑 | Semua transaksi bulan ini |
| `GET` | `/token-status` | 🔑 | Status sesi GoPay |
| `GET` | `/api/logs` | 🔑 | Log aktivitas |
| `GET` | `/health` | 🌐 | Health check |

🔑 butuh header `X-Api-Key` · 🌐 publik

### 📥 Contoh Request

```bash
# 1. Buat QRIS Rp 25.000
curl "https://api.tokomu.id/create-qris?amount=25000" -H "X-Api-Key: API_KEY_KAMU"

# 2. Cek pembayaran (selalu kirim trx_id)
curl "https://api.tokomu.id/check-payment?amount=25000&trx_id=TRX-XXXXXXXX" -H "X-Api-Key: API_KEY_KAMU"
```

```json
{
  "success": true,
  "paid": true,
  "transaction": {
    "transaction_id": "gopay-internal-tx-id",
    "amount": 25000,
    "payer_issuer": "GoPay / BCA",
    "transaction_time": "2026-11-01T10:02:12.000Z"
  }
}
```

Parameter lengkap, kode error, dan contoh Node.js / PHP / Python ada di **`/docs`**.

---

# ☁️ Deploy

<p align="left">
  <img src="https://img.shields.io/badge/PM2-2B037A?style=for-the-badge&logo=pm2&logoColor=white" alt="PM2"/>
  <img src="https://img.shields.io/badge/docker-%232496ED.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/Nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white" alt="Nginx"/>
  <img src="https://img.shields.io/badge/cPanel-FF6C2C?style=for-the-badge&logo=cpanel&logoColor=white" alt="cPanel"/>
</p>

```bash
# 🟢 VPS dengan PM2
pm2 start server.js --name gopay-api && pm2 save

# 🐳 Docker
docker compose build
docker compose run --rm gopay-api node login.js   # login OTP sekali
docker compose up -d
```

> 💡 **cPanel**: pilih Node.js **18.x**, startup file `server.js`, lalu jalankan `bash scripts/setup.sh`.
> 💡 **Pterodactyl**: login di lokal, upload semua file termasuk file sesi, startup command `node server.js`.
> ⚠️ Hosting serverless gratis (Vercel, Netlify, Render Free) tidak cocok karena file sesi login hilang saat container tidur.

---

# 🗂️ Struktur Proyek

```
gopay-api/
├── server.js                 # titik masuk (VPS, cPanel, Pterodactyl, Docker)
├── login.js                  # titik masuk login OTP: npm run login
├── src/
│   ├── app.js                # rakit Express, middleware, static
│   ├── server.js             # listen, timer background, shutdown
│   ├── config/               # baca .env, semua konstanta
│   ├── routes/               # system, qris, payment
│   ├── services/             # qris (EMVCo), session, transaction, payment, checkout, history, gojek.client
│   ├── stores/               # penyimpanan in-memory: QRIS dan klaim transaksi
│   ├── middleware/           # api-key, rate-limit, async-handler, error-handler
│   ├── cli/login.js          # alur login OTP interaktif
│   └── utils/                # logger, ids, errors, phone
├── public/                   # situs neobrutalism: index, docs, pay, 404, assets/
├── scripts/setup.sh          # persiapan VPS / cPanel
├── test/                     # unit test (npm test)
├── Dockerfile
└── docker-compose.yml
```

### 🧪 Pengembangan

```bash
npm run dev    # nodemon
npm test       # unit test QRIS, CRC16, normalisasi nomor
```

---

# 💻 Tech Stack

<p align="left">
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB" alt="Express.js"/>
  <img src="https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5"/>
  <img src="https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3"/>
  <img src="https://img.shields.io/badge/Nodemon-%23323330.svg?style=for-the-badge&logo=nodemon&logoColor=%BBDEAD" alt="Nodemon"/>
</p>

---

# 📬 Kontak & Dukungan

<p align="center">
  <a href="https://t.me/DhilzzKZ"><img src="https://img.shields.io/badge/Chat_Owner-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Chat Owner"/></a>
  <a href="https://t.me/kazamachannel"><img src="https://img.shields.io/badge/Update_Channel-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white" alt="Channel"/></a>
  <a href="https://github.com/kazamaofficial-git/gopay-api/issues"><img src="https://img.shields.io/badge/Laporkan_Bug-black?style=for-the-badge&logo=github&logoColor=white" alt="Issues"/></a>
</p>

<p align="center">⭐ Kalau proyek ini membantu, kasih bintang di repo ya!</p>

<div align="center">

<!-- FOOTER -->
<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,35&height=120&section=footer"/>

**Dibuat dengan ☕ oleh [Kazama Tech](https://github.com/kazamaofficial-git)** · [MIT License](LICENSE)

</div>
