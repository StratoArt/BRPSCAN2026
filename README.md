# R2 Scan Dashboard — Live Google Sheets

Versi ini menghubungkan dashboard GitHub Pages ke Google Sheets melalui Google Apps Script Web App.

## API URL
https://script.google.com/macros/s/AKfycbywwfIOAfMAsw35UmqcW7spSk5VleJgcOkRZJ3cmjKotxar-4ZSYVgBTHOYSuaDbRiaoA/exec

## Struktur Google Sheets
- RETAILER_MASTER
- PRODUCT_MASTER
- SCAN_DATA

`TARGET_MASTER` tidak diperlukan.

## Penting sebelum deploy
1. Buka Google Sheet → Extensions → Apps Script.
2. Buka `Code.gs`.
3. Hapus kode lama lalu paste isi `Code.gs` dari folder ini.
4. Save.
5. Deploy → New deployment → Web app.
6. Execute as: Me.
7. Who has access: Anyone.
8. Jika deployment sudah pernah dibuat, gunakan **Deploy → Manage deployments → Edit → New version → Deploy**.
9. Pastikan URL Web App berakhiran `/exec`.

## Header SCAN_DATA
Baris pertama harus berisi minimal:
Retailer_ID | Product_ID | Qty_Box | Point | Volume | Value

Website akan mengirim 6 field tersebut.

## Website
`app.js` sudah dikonfigurasi menggunakan API URL di atas. `data.js` tetap disimpan sebagai fallback snapshot.

## Catatan
Google Apps Script adalah backend/API; GitHub Pages hanya meng-host tampilan website. Data transaksi permanen masuk ke Google Sheet.

## Fix versi ini
`app.js` mempertahankan navigasi Dashboard/Input Q3/Retailer dan sudah menghubungkan tombol `Simpan Q3` ke API Google Apps Script.

## Fitur Input Q3 versi Multi-Product
- Filter Sales di halaman Input Q3.
- Setelah Sales dipilih, daftar Retailer otomatis hanya menampilkan toko milik Sales tersebut.
- Tombol `＋ Tambah Produk` menambahkan baris produk baru.
- Satu kali klik `Simpan Q3` dapat menyimpan beberapa produk sekaligus untuk retailer yang sama.
- Point, Volume, dan Value dihitung dari PRODUCT_MASTER.

## Filter Dashboard
Dashboard sekarang memiliki filter Sales, Retail / Kios, dan Produk. KPI Filtered Value menampilkan total nilai transaksi Q3 sesuai filter. Scorecard dan ranking mengikuti filter tersebut.
