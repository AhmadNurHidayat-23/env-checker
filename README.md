# ENV Checker

Pemeriksaan konfigurasi environment secara lokal di browser. Isi file tidak diunggah, disimpan, atau ditampilkan.

## Fitur

- Bandingkan .env.example dan .env untuk menemukan key hilang, duplikat, dan nilai kosong.
- Pemeriksaan format, kutip multiline, komentar, deklarasi export, dan referensi key.
- Validasi port, APP_URL, dan APP_DEBUG.
- Filter temuan, rekomendasi, serta export JSON berisi nama key dan temuan tanpa nilai.
- Input file langsung dikosongkan setelah pemeriksaan; tidak menguji koneksi layanan.

## Teknologi

Laravel 13, Blade, Tailwind CSS 4, TypeScript, Vite, Vitest, PHPUnit.

## Cara menjalankan

Memerlukan PHP 8.4+, Composer, dan Node.js 22.12+. Arahkan document root Laragon ke folder `public`.

```sh
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm ci
npm run build
php artisan serve
```

Buka http://127.0.0.1:8000. Jalankan `php artisan test` dan `npm test` untuk pengujian.
