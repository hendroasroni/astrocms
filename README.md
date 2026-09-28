# Astro CMS — Reusable Static Website Framework

A lightweight, reusable, and lightning-fast Static CMS Engine built with **Astro**, **Firebase Authentication**, **Google Apps Script**, and **Private Google Sheets**.

---

## 🌟 Fitur Utama

- 🚀 **Static-First SSG**: Performa 100/100 Lighthouse & 0ms database latency untuk pengunjung publik.
- 🔒 **Secure Auth**: Firebase Authentication dengan whitelist authorization & Anti-FOUC protected admin.
- 📊 **Private Google Sheets Database**: Tanpa biaya database bulanan, spreadsheet 100% private.
- ⚡ **Apps Script CacheService**: In-memory caching di layer API backend untuk performa optimal.
- 🌐 **Instant Indexing & SEO**:
  - Auto-generated XML Sitemap (`sitemap-index.xml`) dengan tag `<lastmod>`.
  - RSS Feed (`/rss.xml`).
  - Integrasi protokol **IndexNow** (Bing / Yandex auto-ping saat publish artikel).
  - Schema.org JSON-LD (Article, Breadcrumbs, Organization).
- 🔄 **Deploy Webhook**: Tombol Instant Rebuild otomatis ke Cloudflare Pages / Netlify.
- 🎨 **Theme & Core Separation**: Struktur modular dengan TypeScript Path Aliasing (`@core/*`, `@theme/*`, `@config/*`, `@components/*`, `@layouts/*`).

---

## 📁 Struktur Project

```text
astro-cms/
├── config/
│   ├── site.ts              # Konfigurasi identitas & kontak website (@config/*)
│   └── site.example.ts
├── apps-script/
│   └── Code.gs              # Middleware API Google Apps Script & CacheService
├── public/
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── core/                # Core CMS Engine (@core/* - JANGAN DIUBAH)
│   │   ├── auth/            # Firebase SDK & Auth Guards
│   │   ├── api/             # API Client & Type Definitions
│   │   ├── content/         # CRUD Posts, Pages, Products
│   │   ├── settings/        # Site Settings, Webhooks, IndexNow
│   │   └── utils/           # Slugify, Date Formatter
│   ├── components/          # Reusable UI & SEO Components (@components/*)
│   ├── layouts/             # BaseLayout, ArticleLayout, AdminLayout (@layouts/*)
│   ├── theme/               # Visual & Homepage Theme (@theme/* - BEBAS DIUBAH)
│   │   └── Home.astro
│   ├── pages/               # Routing Publik & Admin
│   │   ├── index.astro
│   │   ├── login.astro
│   │   ├── rss.xml.ts
│   │   ├── blog/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   └── admin/
│   │       ├── index.astro
│   │       ├── posts/index.astro
│   │       └── settings/index.astro
│   └── styles/
│       ├── global.css
│       └── admin.css
├── .env.example
├── astro.config.mjs
├── tsconfig.json
└── package.json
```

---

## 🚀 Panduan Setup Singkat

### 1. Install Dependensi
```bash
npm install
```

### 2. Konfigurasi Environment (`.env`)
Salin file `.env.example` menjadi `.env` lalu isi kredensial Firebase dan Apps Script Web App:
```env
PUBLIC_FIREBASE_API_KEY=AIzaSy...
PUBLIC_FIREBASE_AUTH_DOMAIN=project-id.firebaseapp.com
PUBLIC_FIREBASE_PROJECT_ID=project-id
PUBLIC_FIREBASE_STORAGE_BUCKET=project-id.appspot.com
PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
PUBLIC_FIREBASE_APP_ID=1:1234567890:web:abcdef

PUBLIC_API_URL=https://script.google.com/macros/s/AKfycb.../exec
```

### 3. Deploy Google Apps Script
1. Buat **Google Spreadsheet Baru** (Private).
2. Buka menu **Extensions > Apps Script**.
3. Salin seluruh isi dari [`apps-script/Code.gs`](apps-script/Code.gs).
4. Tambahkan email admin Anda pada variabel `AUTHORIZED_USERS`.
5. Klik **Deploy > New Deployment**:
   - Tipe: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Salin URL Web App dan tempelkan ke `PUBLIC_API_URL` di file `.env`.

### 4. Jalankan Local Development
```bash
npm run dev
```
- Akses website publik di: `http://localhost:4321/`
- Akses dashboard admin di: `http://localhost:4321/admin`

### 5. Build untuk Produksi (Static SSG)
```bash
npm run build
```
Hasil build berada di folder `dist/` dan siap di-deploy ke Cloudflare Pages atau Netlify.
