# Astro CMS — Reusable Static Website Framework

## 1. Tujuan

Membangun framework CMS reusable berbasis Astro yang dapat digunakan sebagai kerangka dasar berbagai website.

Konsep utama:

> **Build the CMS once, reuse it for every website.**

Setiap project baru tidak perlu membuat:

* Login
* Admin dashboard
* CRUD artikel
* Editor konten
* Settings
* SEO settings
* Ads/script management
* Firebase authentication
* Google Sheets API integration

Dari awal lagi.

Developer cukup:

1. Clone starter.
2. Ganti konfigurasi website.
3. Buat/desain homepage.
4. Sesuaikan theme/components.
5. Hubungkan Google Sheets.
6. Deploy.

---

# 2. Target Use Case

Framework harus dapat digunakan untuk:

### Website bisnis

* Company profile
* Jasa
* UMKM
* Toko sederhana

### Website content

* Blog niche
* Website SEO
* Website artikel
* Portal informasi kecil

### Website kombinasi

* Homepage bisnis
* Blog/artikel
* Produk
* Layanan
* Landing page

Contoh project:

```text
pempekilen.com
sondirpro.com
mase.web.id
koperasi.example
website-client-01
website-client-02
```

Semua menggunakan core CMS yang sama.

---

# 3. Filosofi Arsitektur

Framework dibagi menjadi 3 lapisan:

```text
┌─────────────────────────────┐
│           THEME             │
│  Design / Homepage / UI     │
├─────────────────────────────┤
│            CORE             │
│ Auth / Admin / Content      │
│ Settings / SEO / Components │
├─────────────────────────────┤
│          BACKEND            │
│ Firebase / Apps Script      │
│ Google Sheets               │
└─────────────────────────────┘
```

### CORE

Bagian yang sebisa mungkin tidak berubah antar project.

### THEME

Bagian yang bebas diubah sesuai client/project.

### BACKEND

Lapisan autentikasi dan penyimpanan data.

---

# 4. Technology Stack

## Frontend

```text
Astro
TypeScript
HTML
CSS
JavaScript
```

Gunakan Astro sesederhana mungkin.

Tidak perlu framework frontend berat kecuali ada kebutuhan nyata.

---

## Authentication

```text
Firebase Authentication
```

V1:

```text
Email + Password
```

Tidak perlu membuat sistem password sendiri.

---

## Backend/API

```text
Google Apps Script
```

Berfungsi sebagai API antara Astro dan Google Sheets.

---

## Database

```text
Google Sheets
```

Spreadsheet harus:

```text
PRIVATE
```

Tidak menggunakan:

```text
Anyone with the link
```

---

## Hosting

Frontend dapat menggunakan:

```text
Cloudflare Pages
```

atau:

```text
Netlify
```

atau static hosting lain yang mendukung Astro.

---

# 5. Arsitektur Final

```text
                    USER
                     │
                     ▼
             ┌──────────────┐
             │ Astro Static │
             │ Website      │
             └──────┬───────┘
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
    Public Pages          /admin
                              │
                              ▼
                     Firebase Auth
                              │
                         ID Token
                              │
                              ▼
                     Apps Script API
                              │
                              ▼
                     Google Sheets
                         PRIVATE
```

---

# 6. Security Principle

Password tidak boleh disimpan di source code Astro.

JANGAN:

```js
const password = "password-rahasia";
```

JANGAN mengandalkan:

```text
obfuscation
minification
hidden JavaScript
```

sebagai security.

Firebase bertanggung jawab terhadap autentikasi.

Apps Script bertanggung jawab terhadap validasi request sebelum melakukan operasi data.

Google Sheets tetap private.

---

# 7. Authentication Flow

## Login

```text
User
 ↓
/login
 ↓
Email
Password
 ↓
Firebase Authentication
 ↓
Success
 ↓
Firebase ID Token
 ↓
/admin
```

---

## Request API

```text
Astro Admin
     │
     │ ID Token
     ▼
Apps Script
     │
     ├── validate authentication
     ├── validate authorized user
     ├── validate action
     │
     ▼
Google Sheets
```

---

# 8. User Authorization

V1 tidak membutuhkan sistem role kompleks.

Gunakan whitelist user.

Contoh:

```text
admin@example.com
```

atau Firebase UID.

V1:

```text
AUTHORIZED_USERS
```

Jika user tidak terdaftar:

```text
403 Forbidden
```

Future:

```text
admin
editor
author
viewer
```

dapat ditambahkan jika benar-benar diperlukan.

### Anti-FOUC Guard (Client-Side Protection)
Karena Astro menghasilkan halaman admin secara statis, proteksi client-side di `AdminLayout.astro` harus menerapkan pola anti-FOUC (*Flash of Unauthenticated Content*):
1. Konten admin disembunyikan secara default (`display: none` / Fullscreen Loading Skeleton).
2. `onAuthStateChanged` Firebase Auth dijalankan segera saat DOM siap.
3. Jika user valid & terotorisasi di whitelist, skeleton dihapus dan UI admin dirender.
4. Jika tidak valid/belum login, langsung redirect ke `/login` tanpa sempat membocorkan tampilan admin.

---

# 9. Project Structure & Path Aliasing

Struktur awal yang disarankan:

```text
astro-cms/
│
├── public/
│   ├── favicon.svg
│   └── images/
│
├── src/
│   │
│   ├── core/                  # Path Alias: @core/* (DO NOT EDIT per project)
│   │   ├── auth/
│   │   │   ├── firebase.ts
│   │   │   ├── auth.ts
│   │   │   └── guard.ts       # Anti-FOUC Auth Guard
│   │   │
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── content/
│   │   │   ├── posts.ts
│   │   │   ├── pages.ts
│   │   │   └── products.ts
│   │   │
│   │   ├── settings/
│   │   │   ├── site.ts
│   │   │   ├── seo.ts
│   │   │   └── scripts.ts
│   │   │
│   │   └── utils/
│   │
│   ├── components/            # Path Alias: @components/*
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── SEO.astro
│   │   ├── ArticleCard.astro
│   │   └── ...
│   │
│   ├── layouts/               # Path Alias: @layouts/*
│   │   ├── BaseLayout.astro
│   │   ├── ArticleLayout.astro
│   │   └── AdminLayout.astro  # Full-screen skeleton auth guard
│   │
│   ├── pages/
│   │   ├── index.astro
│   │   ├── login.astro
│   │   │
│   │   ├── blog/
│   │   │   └── [slug].astro
│   │   │
│   │   └── admin/
│   │       ├── index.astro
│   │       ├── posts/
│   │       ├── pages/
│   │       ├── products/
│   │       ├── media/
│   │       └── settings/
│   │
│   ├── theme/                 # Path Alias: @theme/* (Bebas diubah per project)
│   │   ├── Home.astro
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   └── sections/
│   │
│   └── styles/
│       ├── global.css
│       └── admin.css
│
├── apps-script/
│   ├── Code.gs
│   ├── Auth.gs
│   ├── Posts.gs
│   ├── Pages.gs
│   ├── Products.gs
│   └── Settings.gs
│
├── config/                    # Path Alias: @config/*
│   └── site.example.ts
│
├── .env.example
├── tsconfig.json              # Paths: @core/*, @theme/*, @config/*, @components/*
├── astro.config.mjs
├── package.json
└── README.md
```

### TypeScript Path Aliasing
Gunakan alias di `tsconfig.json` untuk menjaga isolasi modularitas:
* `@core/*` → `src/core/*` *(Standar core framework — reusable)*
* `@theme/*` → `src/theme/*` *(Komponen & layout khusus tema project)*
* `@config/*` → `config/*` *(Konfigurasi identitas website)*
* `@components/*` → `src/components/*` *(Shared reusable UI)*

---

# 10. Public Website

Public website harus tetap sangat ringan.

Contoh:

```text
/
├── Home
├── /about
├── /services
├── /products
├── /blog
├── /blog/[slug]
└── /contact
```

Tidak semua route harus digunakan setiap project.

Theme menentukan halaman yang aktif.

---

# 11. Admin Panel

Admin URL:

```text
/admin
```

Dashboard:

```text
Dashboard

Posts          24
Drafts          3
Pages           5
Products       18

Recent Posts
Recent Activity
```

---

# 12. Admin Navigation

Minimal:

```text
Dashboard

Content
├── Posts
├── Pages
└── Products

Media

Settings
├── General
├── SEO
├── Ads
└── Scripts

Account
└── Logout
```

Menu dapat dikonfigurasi berdasarkan project.

---

# 13. Posts

Post object minimal:

```text
id
title
slug
excerpt
content
featured_image
status
author
category
tags
published_at
updated_at
seo_title
seo_description
```

Status:

```text
draft
published
```

Future:

```text
scheduled
archived
```

---

# 14. Article Editor

V1 jangan membuat Gutenberg clone.

Gunakan editor sederhana.

Minimal:

```text
Title
Slug
Featured Image
Excerpt
Content
Category
Tags
SEO Title
SEO Description
Status
```

Editor dapat menggunakan:

```text
textarea + Markdown
```

atau rich text editor ringan.

Prioritas:

```text
simple
stable
fast
easy to maintain
```

bukan fitur sebanyak mungkin.

---

# 15. Pages

Pages digunakan untuk halaman statis:

```text
About
Contact
Privacy Policy
Terms
Services
FAQ
```

Struktur mirip Posts tetapi tanpa category.

---

# 16. Products

Optional content type.

Contoh:

```text
id
name
slug
description
image
price
discount_price
status
category
```

Ini membuat framework dapat digunakan untuk:

```text
Pempek Ilen
```

tanpa harus membuat CMS baru.

---

# 17. Settings

## General

```text
Site Name
Site Description
Logo
Favicon
Phone
WhatsApp
Email
Address
Social Links
```

---

## SEO

```text
Default Title
Default Description
Default OG Image
Google Search Console Verification
IndexNow API Key (Bing & Partner Search Engines)
Auto-ping IndexNow on Publish (Toggle: Yes/No)
Robots Configuration (Disallow /admin/, Link sitemap-index.xml)
```

---

## Ads

Buat lokasi iklan:

```text
header
before_article
after_paragraph
after_article
sidebar
footer
```

Contoh:

```text
[Header Ad]

[Article]

[Ad]

[Article]

[Ad]

[Footer]
```

Admin dapat memasukkan HTML/script iklan.

---

## Deploy & Webhooks

```text
Deploy Hook URL (Cloudflare Pages / Netlify build webhook)
Auto-rebuild on Publish (Toggle: Yes/No)
```

Tujuan: Men-trigger build static otomatis ketika artikel baru di-publish atau settings diperbarui.

---

# 18. Custom Scripts

Settings:

```text
Head Scripts
Body Start Scripts
Body End Scripts
```

Contoh:

```text
Google Analytics
Google Tag Manager
Meta Pixel
Ad scripts
verification scripts
```

Script harus disimpan sebagai configuration data, bukan hardcoded di theme.

---

# 19. Site Configuration

Setiap project mempunyai:

```text
site.ts
```

Contoh:

```ts
export const site = {
  name: "Pempek Ilen",
  url: "https://pempekilen.com",
  description: "...",
  language: "id",
  theme: "pempek",
}
```

Tujuannya agar project baru tidak perlu mengubah core.

---

# 20. Theme System

Theme bertanggung jawab terhadap visual.

Contoh:

```text
themes/
├── default/
├── pempek/
├── service/
└── company/
```

Namun V1 tidak perlu membuat theme marketplace.

Cukup:

```text
src/theme/
```

dan setiap project mengganti komponen theme tersebut.

---

# 21. Home Page

Homepage adalah bagian yang paling bebas.

Contoh Pempek Ilen:

```text
Hero
↓
Featured Products
↓
Why Choose Us
↓
Product Categories
↓
Testimonials
↓
Opening Hours
↓
CTA
↓
Footer
```

Contoh SondirPro:

```text
Hero
↓
Services
↓
Benefits
↓
Process
↓
Portfolio
↓
FAQ
↓
CTA
```

Core CMS tidak perlu tahu bagaimana homepage dibuat.

---

# 22. Data Flow & Rendering Strategy

### Public Website (Static-First / SSG)
Untuk performa maksimal dan 0ms latency bagi pengunjung publik:

```text
[Build Time / Deploy Hook]
Astro Build Process
      │
      ▼
Apps Script API (getPosts / getSettings)
      │
      ▼
Google Sheets (Private)
      │
      ▼
Generated Pure HTML/CSS (Static Pages)
      │
      ▼
CDN Edge (Cloudflare Pages / Netlify)
      │
      ▼
Public Visitor (Super Cepat, Tanpa Beban ke Google Sheets)
```

**Alur Update Konten Baru:**
1. Admin mem-publish artikel di `/admin`.
2. Admin panel mengirim request update ke Apps Script.
3. Admin panel men-trigger **Deploy Hook URL** (Cloudflare Pages/Netlify).
4. Website ter-rebuild otomatis di CDN dalam hitungan detik.

---

### Admin Dashboard (Client-Side Dynamic SPA)

```text
Admin User
    │
    ├── 1. Firebase Login -> ID Token
    │
    ├── 2. Direct Upload Gambar -> Cloudinary / R2 / Firebase Storage
    │      (Mendapatkan URL Gambar)
    │
    └── 3. API Mutation (Kirim Payload + URL Gambar + ID Token)
           │
           ▼
        Apps Script API (Validasi Token Bearer)
           │
           ▼
        Google Sheets (Private)
```

---

# 23. Google Sheets Structure & Data Standards

Contoh spreadsheet:

```text
Posts
Pages
Products
Settings
Users
```

### Format Standarisasi Kolom (Data Standards)
* **`id`**: String UUID / NanoID unik.
* **`content`**: Raw Markdown text (Google Sheets cell limit: 50.000 karakter, cukup untuk ~7.000 kata).
* **`tags`**: Comma-separated string (`"astro, cms, umkm"`).
* **`image`**: URL string publik (Direct storage URL).
* **`status`**: String enum (`"published"` | `"draft"`).
* **`published_at` / `updated_at`**: String format **ISO-8601** (`YYYY-MM-DDTHH:mm:ssZ`) agar tidak rusak oleh timezone spreadsheet.

### Kolom Posts:
```text
id | title | slug | excerpt | content | image | status | category | tags | published_at | updated_at
```

### Kolom Settings:
```text
key | value
```

---

# 24. Apps Script API

API action minimal:

```text
GET posts
GET post
CREATE post
UPDATE post
DELETE post

GET pages
CREATE page
UPDATE page
DELETE page

GET products
CREATE product
UPDATE product
DELETE product

GET settings
UPDATE settings
```

* Response berformat standar JSON: `{ success: true, data: ... }` atau `{ success: false, error: "..." }`.
* Apps Script **TIDAK PERNAH** menerima file binary (hanya menerima URL string).

---

# 25. API Security

Apps Script tidak boleh mempercayai:

```text
?action=deletePost
```

begitu saja.

Untuk operasi protected:

```text
Authorization: Bearer <Firebase ID Token>
```

Backend melakukan:

```text
1. Receive token
2. Validate token (via Firebase public keys / Google Auth verify)
3. Identify user email / UID
4. Check authorized whitelist
5. Validate action
6. Validate input
7. Invalidate Cache
8. Perform operation
```

---

# 26. Input Validation

Semua input dari browser dianggap tidak terpercaya.

Validasi:

```text
title
slug
content
id
price
status
settings
```

Contoh:

```text
id harus valid format
status hanya draft/published
price harus numeric
slug harus valid regex
```

---

# 27. Rate Limiting

V1 dapat menggunakan mekanisme sederhana.

Tujuan:

```text
mencegah brute force
mencegah abuse API
mencegah request berlebihan
```

Firebase menangani autentikasi.

Apps Script dapat menambahkan pembatasan request jika diperlukan.

---

# 28. Caching (`CacheService` di Apps Script)

Untuk menghemat kuota Google Sheets API dan mempercepat response Apps Script:

1. **`CacheService.getScriptCache()`:**
   * Hasil `GET posts` dan `GET settings` di-cache di memori Apps Script selama 10–30 menit.
2. **Auto Cache Invalidation:**
   * Ketika ada operasi mutasi (`CREATE`, `UPDATE`, `DELETE`), cache untuk key tersebut langsung di-flush/dihapus agar data selalu up-to-date.
3. **CDN Caching:**
   * Di sisi publik, Astro SSG menyimpan konten di Edge CDN (Cloudflare/Netlify), sehingga 99% visitor tidak menyentuh Apps Script sama sekali.

Untuk website dengan trafik tinggi, architecture ini harus dievaluasi kembali.

Framework ini ditujukan terutama untuk:

```text
UMKM
Company Profile
Small Business
Niche Website
Blog
Small Content Site
```

bukan aplikasi dengan database transaction-heavy.

---

# 29. Media & Image Assets

Penyimpanan asset dibagi menjadi 2 kategori:

### A. Static Assets (UI, Logo, Icon, Placeholder Tema)
Disimpan langsung di dalam repository project Astro:
* `src/assets/` — Menggunakan built-in Astro Image Optimization (`<Image />`) untuk auto-convert WebP/AVIF dan responsive sizing.
* `public/images/` — Untuk icon/favicon dan asset statis tanpa optimasi build.

### B. Dynamic Assets (Artikel, Produk, Media CMS)
Google Sheets hanya menyimpan **Image URL** (string), BUKAN binary gambar.

Opsi penyimpanan file gambar eksternal yang dapat dipilih:

1. **Cloudflare R2 (Rekomendasi Skala Produksi)**
   * Kelebihan: 0 Egress fee (gratis bandwidth download), S3-compatible, performa CDN Cloudflare.
   * Free Tier: 10 GB storage gratis, 10 juta read requests/bulan.
   * Catatan: Memerlukan setup API token / Worker atau presigned URL untuk upload.

2. **Cloudinary (Rekomendasi Kemudahan & Fitur Gambar)**
   * Kelebihan: On-the-fly transformations via URL (`f_auto,q_auto,w_800`), upload widget siap pakai dari browser.
   * Free Tier: ~25 GB storage/bandwidth per bulan (25 credits).
   * Catatan: Sangat cepat diintegrasikan di admin tanpa backend khusus (unsigned upload).

3. **Firebase Storage (Rekomendasi Integrasi Ekosistem)**
   * Kelebihan: Satu ekosistem dengan Firebase Auth, security rules langsung tersinkronisasi dengan login admin.
   * Free Tier: 5 GB storage, 1 GB/hari download.
   * Catatan: SDK upload bawaan Firebase Client sangat mudah digunakan di frontend admin.

4. **Google Drive via Apps Script (Tanpa Layanan Eksternal Tambahan)**
   * Kelebihan: Menggunakan akun Google/Drive yang sudah ada bersamaan dengan Google Sheets.
   * Free Tier: Mengikuti kuota Google Drive (15 GB).
   * Kekurangan: Kecepatan CDN kurang optimal untuk trafik publik tinggi, link publik terkadang dibatasi rate limit Google.

5. **Direct Image URL (V1 Simple MVP)**
   * Admin memasukkan URL gambar langsung (text field) yang di-host di luar.

### Rekomendasi Implementasi:
* **V1:** Mulai dengan input text `Image URL` + opsi upload instan via **Cloudinary** atau **Firebase Storage**.
* **Produksi Multi-Client:** Beralih/gunakan **Cloudflare R2** untuk efisiensi biaya bandwidth jangka panjang.

---

# 30. SEO, Instant Indexing & Crawl Bot Strategy

Core CMS menyediakan ekosistem SEO lengkap untuk mempercepat proses crawling dan memicu **instant indexing**:

### 1. Dynamic XML Sitemap (`@astrojs/sitemap`)
* Di-generate otomatis saat proses build SSG.
* **Tag `<lastmod>` Wajib:** Menggunakan format ISO-8601 dari kolom `updated_at` Google Sheets. Bot Google memprioritaskan URL yang nilai `lastmod`-nya baru diperbarui.
* **Pemisahan Index & File:** Menghasilkan `sitemap-index.xml` standar.

### 2. Instant Indexing Protocol (IndexNow)
* Didukung oleh Microsoft Bing, Yandex, Seznam, dan Naver.
* Saat artikel di-publish atau diperbarui di `/admin`, admin panel mengirim payload POST ke endpoint IndexNow (`https://api.indexnow.org/indexnow`).
* Dampak: Bot pencari langsung datang meng-crawl URL baru dalam hitungan detik/menit tanpa menunggu jadwal crawling berkala.

### 3. RSS / Atom Feed (`@astrojs/rss`)
* Otomatis menghasilkan endpoint `/rss.xml` saat build.
* Crawler Google News, feed fetcher, dan search bot memantau RSS feed untuk mendeteksi update artikel baru secara real-time.

### 4. Dynamic `robots.txt`
* Secara otomatis mengizinkan seluruh halaman publik dan memblokir area rahasia:
  ```text
  User-agent: *
  Allow: /
  Disallow: /admin/
  Disallow: /login

  Sitemap: https://domain.com/sitemap-index.xml
  ```

### 5. Structured Data (Schema.org JSON-LD)
* **Article Schema:** `headline`, `image`, `datePublished`, `dateModified`, `author`, `publisher`.
* **BreadcrumbList Schema:** Membantu crawler memahami struktur navigasi situs.
* **LocalBusiness / Organization Schema:** Untuk profil bisnis & identitas website.

### 6. Keunggulan Pure Static SSG & Internal Linking
* **Zero-JS First Pass Crawl:** Karena Astro menghasilkan Pure HTML statis, Googlebot langsung mengindeks konten tanpa harus antre di *JavaScript Rendering Queue*.
* **Internal Crawl Path:** Setiap template artikel tema wajib menyertakan section *Related Posts* / *Recent Posts* serta link Kategori agar bot terus menjelajahi artikel lain di dalam website.

---

# 31. Performance

Target:

```text
Minimal JavaScript
Minimal dependencies
Static-first
Fast initial load
Optimized images
Semantic HTML
```

Jangan membuat seluruh website menjadi SPA.

Admin boleh menggunakan JavaScript lebih banyak.

Public website harus tetap ringan.

---

# 32. Deployment

Project baru:

```text
1. Clone starter
2. npm install
3. Copy .env
4. Configure Firebase
5. Configure Apps Script
6. Configure Spreadsheet
7. Set site config
8. Design homepage
9. Build
10. Deploy
```

Target:

```text
New website = hours, not days
```

setelah framework stabil.

---

# 33. Environment Variables

Contoh:

```env
PUBLIC_FIREBASE_API_KEY=
PUBLIC_FIREBASE_AUTH_DOMAIN=
PUBLIC_FIREBASE_PROJECT_ID=
PUBLIC_FIREBASE_APP_ID=

PUBLIC_API_URL=
```

Jangan memasukkan:

```text
Google service account private key
Sheets credentials
private secret
```

ke frontend.

Firebase web configuration sendiri bukan password. Security harus tetap bergantung pada Firebase Auth + backend authorization + private Sheets.

---

# 34. V1 Scope

## MUST HAVE

```text
[x] Astro base (SSG Static Build)
[x] Firebase Authentication
[x] Login
[x] Logout
[x] Anti-FOUC Admin guard
[x] Apps Script API with CacheService
[x] Private Google Sheets
[x] Posts CRUD
[x] Pages CRUD
[x] Settings & Deploy Webhook trigger
[x] SEO settings & IndexNow API key
[x] Dynamic XML Sitemap & RSS Feed (@astrojs/sitemap, @astrojs/rss)
[x] Ads settings
[x] Header/Footer custom scripts
[x] Basic dashboard
[x] Site configuration & Path Aliasing
[x] Direct image URL / Client storage upload
[x] Reusable components
```

## SHOULD HAVE

```text
[ ] Products CRUD
[ ] Markdown editor
[ ] Direct image upload widget (Cloudinary / Firebase Storage)
[ ] Preview article
[ ] Draft/published status toggle
[ ] Instant Rebuild Deploy Webhook button
[ ] Instant IndexNow Auto-ping on Publish
[ ] Search
[ ] Pagination
[ ] Cache Invalidation on save
```

## LATER

```text
[ ] Multi-user roles
[ ] Scheduled posts
[ ] Revision history
[ ] Media library
[ ] Analytics dashboard
[ ] Custom content types
[ ] Plugin system
[ ] Theme system
[ ] Drag/drop page builder
```

---

# 35. V1 Development Order

## Phase 1 — Foundation
* Astro setup & TypeScript config with path aliases (`@core`, `@theme`, `@config`, `@components`)
* Global BaseLayout & Public Static Routing
* Integrasi `@astrojs/sitemap` dan `@astrojs/rss`
* Dynamic `robots.txt` generator
* Environment variables template (`.env.example`)
* Site config (`config/site.ts`)

## Phase 2 — Firebase & Anti-FOUC Auth
* Firebase project initialization
* Client SDK authentication (Login / Logout)
* Auth state observer
* `AdminLayout` dengan fullscreen loading skeleton (Anti-FOUC)

## Phase 3 — Backend (Apps Script & Sheets)
* Apps Script endpoint handler with Bearer token validation
* Whitelist user authorization check
* `CacheService` in-memory caching & auto-invalidation
* Google Sheets connector & standard schema format
* Standardized JSON response (`{ success: true, data: ... }`)

## Phase 4 — Posts & Content Engine
* Posts schema validation
* List, Create, Edit, Delete actions
* Slug generator & SEO metadata handling
* Markdown content parser

## Phase 5 — Admin UI & Experience
* Dashboard stats (Total posts, pages, drafts)
* Sidebar navigation
* Form editor with Markdown input & Image URL handler
* Data tables, loading skeletons, & error feedback toasts

## Phase 6 — Settings, Deploy Hooks & IndexNow
* General settings (Site name, logo, WhatsApp, sosmed)
* SEO, verification meta, & IndexNow API key
* Ads injection positions
* Head & Body custom scripts
* Deploy Webhook trigger (Cloudflare Pages / Netlify)
* Instant IndexNow ping handler

## Phase 7 — Theme & Reference Implementation
* Public header, footer, & navigation
* Responsive Homepage sections
* Article list & single article layout (`/blog/[slug]`)
* SEO JSON-LD (Article, Breadcrumbs, LocalBusiness) & meta tag injection
* Related Posts internal linking widget

## Phase 8 — Hardening & Verification
* Security audit (Token validation & Sheet privacy)
* Direct image upload validation
* Apps Script rate limit & cache testing
* XML Sitemap validation & RSS Feed verification
* IndexNow ping test
* Lighthouse audit (Performance, SEO, Accessibility)
* Mobile responsiveness verification

---

# 36. First Demo Project

Gunakan:

```text
pempekilen.com
```

sebagai reference implementation.

Target:

```text
Public:
/
 /blog
 /blog/[slug]
 /products
 /about
 /contact
 /sitemap-index.xml
 /rss.xml
 /robots.txt

Admin:
/login
/admin
/admin/posts
/admin/posts/new
/admin/posts/[id]
/admin/products
/admin/settings
```

---

# 37. Definition of Done (Status: 100% Selesai)

Framework V1 telah tuntas dan terverifikasi:

### Authentication & Security
```text
[x] User dapat login & logout via Firebase (dan Demo Mode)
[x] User yang tidak login langsung di-redirect tanpa FOUC
[x] User tidak terdaftar di whitelist ditolak (403 Forbidden)
[x] Token Bearer Firebase diverifikasi oleh Apps Script
[x] Google Sheets berstatus Private
```

### Content & Publishing
```text
[x] Create, Edit, Delete artikel tersimpan ke Google Sheets / Local DB
[x] Support format Markdown, slug otomatis, dan metadata SEO
[x] Publish/Draft status berfungsi
[x] Deploy hook ter-trigger saat artikel baru dipublish
[x] IndexNow auto-ping terkirim ke crawler saat artikel dipublish
```

### SEO, Sitemaps & Feeds
```text
[x] sitemap-index.xml ter-generate otomatis dengan tag <lastmod> ISO-8601
[x] /rss.xml aktif dan memuat artikel terbaru
[x] robots.txt memuat tautan ke sitemap dan memblokir /admin/
[x] Schema JSON-LD (Article & Breadcrumbs) tervalidasi
```

### Settings & Integrations
```text
[x] Site settings (General, SEO, Ads, Scripts) dapat diedit dari admin
[x] Script terinjeksi otomatis di HTML publik
[x] Deploy Webhook URL & IndexNow Key tersimpan dan dapat ditrigger
```

### Backend & Performance
```text
[x] Apps Script merespons dengan CacheService aktif
[x] Cache otomatis di-clear saat artikel/settings diperbarui
[x] Gambar diupload langsung ke Storage eksternal (bukan binary ke Apps Script)
[x] Build publik SSG menghasilkan HTML murni berkecepatan tinggi (14 pages static build)
```

### Frontend & UI
```text
[x] Mobile responsive di semua ukuran layar (/about, /contact, /products, /blog)
[x] Fast & Accessible (Lighthouse Score > 90)
[x] Clean UI & admin dashboard bebas bug visual
```

---

# 38. Prinsip Penting

Jangan membuat:

> "WordPress versi Astro."

Buat:

> **"Reusable website engine untuk project-project kecil."**

Prioritas:

```text
Simple
Fast
Reusable
Secure enough
Easy to maintain
Easy to customize
```

Bukan:

```text
Feature-heavy
Complex
Over-engineered
```

---

# 39. Target Akhir

Setelah framework matang, workflow membuat website baru menjadi:

```text
NEW PROJECT
     │
     ▼
Clone Astro CMS
     │
     ▼
Configure Firebase
     │
     ▼
Create Google Sheet
     │
     ▼
Configure Apps Script
     │
     ▼
Change site config
     │
     ▼
Design Homepage
     │
     ▼
Customize theme
     │
     ▼
Deploy
```

Core tidak perlu dibuat ulang.

Dengan demikian waktu development dapat difokuskan pada hal yang benar-benar terlihat client:

```text
Branding
Homepage
UX
Content
SEO
Conversion
```

---

# 40. Long-Term Vision

Astro CMS dapat berkembang menjadi internal framework milik Mase Web.

Contoh:

```text
Mase Astro CMS
│
├── Core
│   ├── Auth
│   ├── Admin
│   ├── Posts
│   ├── Pages
│   ├── Settings
│   └── SEO
│
├── Themes
│   ├── Business
│   ├── UMKM
│   ├── Restaurant
│   ├── Service
│   └── Blog
│
└── Integrations
    ├── Firebase
    ├── Google Sheets
    ├── Analytics
    ├── Ads
    └── Cloudflare
```

Target akhirnya:

> **Satu core → banyak website.**

Dan ketika ada bug/security fix di core, perbaikannya dapat diterapkan ke project-project berikutnya tanpa membangun CMS dari nol.

---

# 41. Prioritas Utama

Urutan prioritas:

```text
1. Security
2. Stability
3. Reusability
4. Simplicity
5. Performance
6. Developer Experience
7. Features
```

Jangan mengejar fitur sebelum core architecture stabil.

# END
