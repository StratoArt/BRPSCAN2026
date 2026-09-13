# Bayer Reward + — BRP Performance — Live Google Sheets

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

## Retailer Product Detail
Saat satu Retail / Kios dipilih di Dashboard, muncul tabel produk yang di-scan oleh kios tersebut:
- Produk
- Box
- Volume
- Value
- Total Value
Jika Produk juga dipilih, tabel detail ikut terfilter ke produk tersebut.

## Final Dashboard Filter Behavior
- Filter dashboard: Sales + Area + Retail/Kios.
- Tidak ada filter Produk terpisah di dashboard.
- Jika Retail/Kios tertentu dipilih, detail produk menampilkan semua produk yang di-scan kios tersebut.
- Jika Retail/Kios = Semua, detail produk mengagregasikan semua produk yang di-scan seluruh kios pada Sales + Area yang dipilih.
- Detail menampilkan Produk, Box, Volume, Value, dan Total Value.

## Filter Final
Dashboard menggunakan 4 filter: Sales, Area, Retail / Kios, dan Produk.
- Semua Kios + Semua Produk = agregasi semua transaksi pada Sales/Area.
- Kios tertentu + Semua Produk = seluruh produk kios tersebut.
- Kios tertentu + Produk tertentu = transaksi produk tersebut pada kios.
- Semua Kios + Produk tertentu = produk tersebut di seluruh kios pada Sales/Area.
Detail produk selalu menampilkan Box, Volume, Value, dan Total Value.

## Header
Branding header: Bayer Reward +.

## Q3 Sales Target
Target Sales disimpan di `app.js` dan tidak menambah kolom/sheet Excel:
- IVAN: Rp 890.000.000
- DESI: Rp 490.000.000
- Abdul Aziz: Rp 700.000.000
- Luqmanul Hakim: Rp 550.000.000

Dashboard menghitung Scan Value berdasarkan filter aktif, lalu menampilkan Target Q3 Sales, Scan Value, Gap to Target, dan Achievement.
