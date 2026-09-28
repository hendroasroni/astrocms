# Spesifikasi & Perencanaan Sistem Slot Iklan (Ad Slot Engine)

Dokumen ini menjelaskan rancangan arsitektur, struktur data, dan mekanisme injeksi iklan fleksibel untuk framework **Astro CMS**.

---

## 1. Tujuan

Membangun sistem monetisasi iklan yang cerdas, fleksibel, dan terisolasi dari core tema, dengan kemampuan:
1. **Page-Level Filtering:** Mengatur halaman mana saja yang menampilkan iklan (misal: aktif di artikel, mati di `/about`, `/contact`, `/login`, dan `/rss.xml`).
2. **Post-Level Exclude:** Menonaktifkan iklan pada artikel tertentu (misal: pengumuman resmi, artikel duka, atau *sponsored post*).
3. **In-Content Placement (Otomatis & Manual):**
   * **Otomatis:** Injeksi banner otomatis setelah paragraf ke-N atau di tengah artikel.
   * **Manual:** Penempatan presisi menggunakan shortcode `<!-- ad -->` di editor Markdown.

---

## 2. Hirarki Kontrol Iklan (3-Level Control)

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. GLOBAL SETTINGS (Settings > Ads)                        │
│    - Saklar global (Aktifkan iklan di blog / halaman)       │
│    - Script kode iklan per posisi                           │
│    - Interval paragraf auto-inject (default: 2 atau 3)      │
├─────────────────────────────────────────────────────────────┤
│ 2. PAGE LEVEL                                               │
│    - Halaman statis (/about, /contact) bebas iklan          │
│    - RSS Feed (/rss.xml) 100% murni tanpa iklan             │
├─────────────────────────────────────────────────────────────┤
│ 3. POST LEVEL (Editor Artikel)                             │
│    - Checkbox: [ ] Nonaktifkan Iklan (Exclude Post)         │
│    - Shortcode: <!-- ad --> untuk penempatan manual         │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Posisi Slot Iklan Standar

CMS mendukung 5 posisi strategis penempatan iklan:

| Posisi Slot | Lokasi Tampil | Penggunaan Ideal |
| :--- | :--- | :--- |
| `ads_header` | Bagian paling atas website / bawah header | Leaderboard banner (728x90) / Google AdSense |
| `ads_before_content` | Di atas konten artikel (sebelum paragraf 1) | Responsive Display Banner |
| `ads_in_content` | Di sela-sela paragraf artikel | In-article Ads / Native AdSense banner |
| `ads_after_content` | Tepat di bawah artikel (sebelum tags/komentar) | Matched Content / Banner Rekomendasi |
| `ads_footer` | Bagian bawah website (di atas footer) | Sticky Footer / Banner Penutup |

---

## 4. Mekanisme Injeksi Konten (In-Content Parser)

Algoritma pemrosesan konten artikel bekerja di `src/core/utils/ads.ts`:

### Skenario A: Mode Manual (Shortcode)
Jika penulis menyisipkan `<!-- ad -->` atau `[ad-slot]` di dalam teks Markdown:
* Parser mendeteksi string `<!-- ad -->`.
* Mengganti tanda tersebut secara langsung dengan komponen banner `<div class="ad-slot in-content">...</div>`.

### Skenario B: Mode Otomatis (Auto-Paragraph Injection)
Jika tidak ada shortcode manual:
1. Parser menghitung semua tag penutup paragraf (`</p>`).
2. Menyisipkan iklan setelah paragraf ke-N (sesuai konfigurasi `ads_paragraph_interval`, default: paragraf 2).
3. Jika artikel cukup panjang (>6 paragraf), parser dapat menyisipkan slot kedua di tengah artikel (`total_paragraf / 2`).

### Skenario C: Exclude Post
Jika field `disable_ads === true`:
* Seluruh fungsi parser dilewati dan konten artikel dirender murni tanpa iklan sama sekali.

---

## 5. Struktur Data & Konfigurasi

### A. Skema Database Settings (`SiteSettings`)
Ditambahkan ke Google Sheets tab `Settings` / Local DB:

```typescript
export interface SiteSettings {
  // ... field settings lainnya
  enable_ads_articles?: boolean;       // Toggle aktifkan iklan di artikel
  enable_ads_homepage?: boolean;       // Toggle aktifkan iklan di homepage
  ads_paragraph_interval?: number;     // Interval paragraf auto-inject (default: 2)
  
  ads_header?: string;                 // Kode HTML/Script Iklan Header
  ads_before_content?: string;         // Kode HTML/Script Iklan Sebelum Artikel
  ads_in_content?: string;             // Kode HTML/Script Iklan Tengah Artikel
  ads_after_content?: string;          // Kode HTML/Script Iklan Setelah Artikel
  ads_footer?: string;                 // Kode HTML/Script Iklan Footer
}
```

### B. Skema Database Posts (`Post`)
Ditambahkan ke Google Sheets tab `Posts` (kolom baru: `disable_ads`):

```typescript
export interface Post {
  // ... field post lainnya
  disable_ads?: boolean;               // true = jangan tampilkan iklan apapun di artikel ini
}
```

---

## 6. Rancangan UI di Admin Panel

### 1. Form Editor Artikel (`/admin/posts`)
Di bagian bawah form editor artikel, tambahkan toggle opsional:

```text
[ ] Nonaktifkan Semua Iklan (Exclude Ads)
    Centang jika artikel ini adalah pengumuman resmi, rilis pers khusus, 
    atau halaman yang tidak ingin dipasangi iklan.
```

### 2. Pengaturan Iklan (`/admin/settings > 4. Manajemen Iklan & Monetisasi`)

```text
┌─────────────────────────────────────────────────────────────┐
│ 4. Pengaturan Iklan & Slot Monetisasi                       │
│                                                             │
│ [x] Aktifkan Iklan pada Artikel Blog                        │
│                                                             │
│ Sisipkan Iklan Otomatis Setiap: [ 2 ] Paragraf              │
│ (Tips: Anda juga bisa mengetik <!-- ad --> di isi artikel)  │
│                                                             │
│ Kode Iklan Header (Atas):                                  │
│ [ <script async src="..."></script>                       ] │
│                                                             │
│ Kode Iklan Sebelum Konten:                                  │
│ [ <ins class="adsbygoogle" ...></ins>                     ] │
│                                                             │
│ Kode Iklan Sela Paragraf (In-Content):                     │
│ [ <ins class="adsbygoogle" ...></ins>                     ] │
│                                                             │
│ Kode Iklan Setelah Konten:                                  │
│ [ <ins class="adsbygoogle" ...></ins>                     ] │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Komponen & Implementasi Teknis

### A. Komponen Slot Iklan (`src/components/AdSlot.astro`)
```astro
---
import { getSettings } from "@core/settings/site";

export interface Props {
  position: "header" | "before_content" | "in_content" | "after_content" | "footer";
  disabled?: boolean;
}

const { position, disabled = false } = Astro.props;

if (disabled) return null;

const settings = await getSettings();
const adCode = settings[`ads_${position}`] || "";
---

{adCode && (
  <div class={`ad-container ad-${position}`}>
    <span class="ad-label">Iklan / Sponsor</span>
    <div class="ad-markup" set:html={adCode} />
  </div>
)}
```

### B. Helper Parser Konten (`src/core/utils/ads.ts`)
```typescript
export function injectAds(contentHtml: string, adCode: string, interval: number = 2): string {
  if (!adCode) return contentHtml;

  // 1. Cek jika penulis memakai manual shortcode
  if (contentHtml.includes("<!-- ad -->")) {
    const adMarkup = `<div class="ad-container ad-in-content"><div class="ad-markup">${adCode}</div></div>`;
    return contentHtml.replace(/<!--\s*ad\s*-->/g, adMarkup);
  }

  // 2. Auto-injection berbasis paragraf
  const parts = contentHtml.split("</p>");
  if (parts.length <= interval) return contentHtml;

  const adMarkup = `<div class="ad-container ad-in-content"><div class="ad-markup">${adCode}</div></div>`;
  parts.splice(interval, 0, adMarkup);
  return parts.join("</p>");
}
```

---

## 8. Keuntungan Pendekatan Ini

1. **Keamanan Konten:** Tidak merusak estetika halaman profil bisnis (`/about`, `/contact`) atau artikel pengumuman penting.
2. **Kinerja & Core Web Vitals:** Slot iklan diberi kontainer dengan min-height untuk mencegah *Cumulative Layout Shift (CLS)* saat banner dimuat.
3. **Mendukung Multi-Niche:** 
   * Website UMKM: Iklan bisa dinonaktifkan sepenuhnya.
   * Niche Blog/AdSense: Iklan aktif otomatis di sela-sela artikel tanpa repot pasang manual.
4. **Bebas Kompatibilitas:** Mendukung Google AdSense, banner gambar afiliasi (Shopee/Tokopedia), banner custom HTML, maupun kode iklan pop/native lainnya.

---
# END OF SPECIFICATION
