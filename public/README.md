# 💰 Keuangan Ku — Personal Finance Tracker

Aplikasi web pencatatan keuangan pribadi multi-user. Dibangun dengan React (tanpa build tool/bundler — langsung jalan di browser), **Supabase** untuk autentikasi dan database (PostgreSQL + Row Level Security), dan di-deploy sebagai static site ke **Vercel**.

## ✨ Fitur

- 🔐 **Multi-user** — Register & login lewat Supabase Auth, data setiap user terpisah dan aman (diproteksi oleh Row Level Security di level database, bukan cuma kode aplikasi)
- 📊 **Dashboard** — Ringkasan Pemasukan, Pengeluaran, dan Tabungan dalam satu halaman
- 📥 **Pemasukan** & 📤 **Pengeluaran** — kategori, Need/Want, metode bayar, catatan
- 🏦 **Tabungan** — setoran & penarikan, saldo terpisah dari keuangan utama
- 📈 **Analisis Bulanan & Tahunan** — tren dan breakdown kategori
- 🔄 **Carry-over Saldo** — saldo akhir bulan otomatis jadi saldo awal bulan berikutnya
- 📱 **PWA opsional** — bisa "Add to Home Screen" di HP/laptop, tapi tetap berfungsi penuh langsung dari browser
- 🌐 **Sinkron real-time antar device** — data tersimpan di Supabase, login dari HP/laptop manapun akan menampilkan data yang sama

---

## 🏗️ Arsitektur

Aplikasi ini **tidak punya backend server sendiri** — cukup file statis (HTML/CSS/JS) yang bicara langsung ke Supabase dari browser:

```
Browser (React app)  ──────►  Supabase
                                ├─ Auth (register/login/session)
                                └─ Postgres Database (dengan Row Level
                                   Security, jadi tiap user cuma bisa
                                   baca/tulis data miliknya sendiri)
```

Vercel hanya bertugas meng-host file statis tersebut — tidak ada serverless function, tidak ada backend Node.js yang perlu di-maintain.

---

## 🚀 Cara Deploy (GitHub → Supabase → Vercel)

### Langkah 1 — Buat Project Supabase

1. Buka [supabase.com](https://supabase.com) → **Sign up / Sign in** (bisa pakai GitHub)
2. **New Project** → isi nama, password database (simpan baik-baik, tapi tidak akan dipakai langsung di app ini), pilih region terdekat (Singapore) → **Create new project**
3. Tunggu 1-2 menit sampai project selesai di-provision
4. Buka menu **SQL Editor** (ikon di sidebar kiri) → **New query**
5. Buka file `supabase/schema.sql` dari project ini, **copy semua isinya**, paste ke SQL Editor → klik **Run**
   - Ini akan membuat 4 tabel (`months`, `expenses`, `income`, `savings`) lengkap dengan Row Level Security policies
6. Buka **Project Settings** (ikon gerigi) → **API**:
   - Copy **Project URL** (formatnya `https://xxxxx.supabase.co`)
   - Copy **anon public** key (di bagian "Project API keys")
   - Simpan keduanya — akan dipakai di Langkah 3

**Opsional tapi disarankan:** Di **Authentication → Providers → Email**, matikan **"Confirm email"** kalau ingin user langsung bisa pakai app tanpa perlu klik link konfirmasi di email dulu.

### Langkah 2 — Upload ke GitHub

1. Buka [github.com/new](https://github.com/new) → nama repo: `keuanganku` → **Create repository**
2. Di halaman repo yang baru dibuat, klik **"uploading an existing file"**
3. Extract ZIP project ini di komputer kamu → drag & drop **semua file dan folder** di dalamnya ke GitHub
4. Klik **Commit changes**

### Langkah 3 — Deploy di Vercel

1. Buka [vercel.com](https://vercel.com) → **Sign up / Sign in** (bisa pakai GitHub)
2. **Add New...** → **Project** → pilih/import repo `keuanganku` dari GitHub
3. Di halaman konfigurasi:
   - **Framework Preset**: pilih **Other**
   - **Build Command**: sudah otomatis terisi dari `vercel.json` (`npm run build`) — biarkan saja
   - **Output Directory**: sudah otomatis terisi (`public`) — biarkan saja
4. Buka bagian **Environment Variables**, tambahkan 2 variabel:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | Project URL dari Langkah 1 |
   | `SUPABASE_ANON_KEY` | anon public key dari Langkah 1 |

5. Klik **Deploy** → tunggu 1-2 menit

6. Setelah selesai, Vercel akan kasih URL seperti:
   ```
   https://keuanganku.vercel.app
   ```

### Selesai! 🎉

Bagikan link itu ke siapa saja. Mereka buka di browser → **Daftar** → langsung bisa pakai. Data otomatis tersimpan di Supabase dan bisa diakses ulang dari device manapun dengan akun yang sama.

---

## 📱 Install ke Homescreen (Opsional — PWA)

**Android (Chrome):** Buka link → ⋮ → **"Add to Home Screen"**

**iPhone (Safari):** Buka link → tombol Share → **"Add to Home Screen"**

**Windows (Chrome):** Buka link → ⋮ → **More tools** → **"Create shortcut..."** → centang **"Open as window"**

---

## 🏗️ Struktur Project

```
keuanganku/
├── package.json              # Script build untuk Vercel
├── vercel.json                # Konfigurasi deploy Vercel
├── .env.example                # Template environment variables
├── .gitignore
├── README.md
├── scripts/
│   └── generate-config.js     # Suntik SUPABASE_URL/ANON_KEY saat build
├── supabase/
│   └── schema.sql             # Skema database + Row Level Security
└── public/                     # Semua yang di-deploy ke Vercel
    ├── index.html              # HTML shell
    ├── manifest.json           # PWA manifest
    ├── sw.js                    # Service worker (untuk install PWA opsional)
    ├── config.js                # DIBUAT OTOMATIS saat build (jangan commit)
    ├── css/
    │   └── style.css            # Styling global
    ├── js/
    │   ├── api.js                # Lapisan data — semua panggilan ke Supabase
    │   └── app.js                # Aplikasi React (komponen, logic, tampilan)
    ├── vendor/                   # Library pihak ketiga (di-vendor langsung,
    │   ├── react.production.min.js       # tidak bergantung ke CDN eksternal)
    │   ├── react-dom.production.min.js
    │   └── supabase.js
    └── assets/
        ├── icon-512.png
        ├── icon-192.png
        └── favicon-32.png
```

---

## 🔧 Jalankan Secara Lokal (Development)

```bash
# 1. Buat file .env dari template
cp .env.example .env
# Edit .env, isi SUPABASE_URL dan SUPABASE_ANON_KEY dari project Supabase kamu

# 2. Generate config.js dan jalankan server statis lokal
npm run dev

# 3. Buka di browser
# http://localhost:3000 (atau port yang ditampilkan npx serve)
```

Setiap kali environment variable berubah, jalankan ulang `npm run dev` (atau `node scripts/generate-config.js`) supaya `public/config.js` ter-update.

---

## 🔐 Bagaimana Data Diamankan (Row Level Security)

Setiap tabel di `supabase/schema.sql` punya kebijakan seperti ini:

```sql
create policy "expenses_select_own" on public.expenses
  for select using (auth.uid() = user_id);
```

Artinya: **Postgres sendiri** yang menolak query kalau `user_id` baris tidak cocok dengan user yang sedang login — bukan cuma dicek di kode frontend. Jadi walaupun `anon key` bersifat publik (memang didesain begitu oleh Supabase), tidak ada cara bagi satu user untuk membaca atau mengubah data user lain.

---

## ⚠️ Catatan Penting

- **Supabase Free Tier**: 500 MB database, cukup untuk puluhan ribu transaksi. Project akan di-pause otomatis setelah 7 hari tanpa aktivitas apapun (termasuk tidak ada yang buka app-nya) — tapi otomatis aktif lagi begitu ada request masuk, data tidak hilang.
- **Vercel Free Tier (Hobby)**: gratis untuk project personal, tidak perlu kartu kredit untuk static site seperti ini.
- **`public/config.js`** dibuat otomatis setiap kali Vercel build — jangan pernah commit file ini manual ke Git (sudah ada di `.gitignore`).

---

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.
