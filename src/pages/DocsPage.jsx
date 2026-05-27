import { BookOpen, Shield, HelpCircle, Code, Settings, Terminal } from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* HEADER DOKUMEN */}
      <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <BookOpen size={24} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-900 sm:text-xl">Dokumentasi Sistem 3 Berlian POS</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Panduan lengkap fitur, alur operasional, dan arsitektur aplikasi penyewaan kostum.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* SIDE NAV DOKUMEN (DAFTAR ISI KECIL ATAU INFO RINGKASAN) */}
        <div className="space-y-4 md:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Informasi Cepat</h3>
            <ul className="space-y-2 text-xs font-medium text-slate-600">
              <li className="flex items-center gap-2 text-slate-900">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                Nama Aplikasi: 3 Berlian POS
              </li>
              <li className="flex items-center gap-2 text-slate-900">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Status: Produksi / Live
              </li>
              <li className="flex items-center gap-2 text-slate-900">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                Teknologi: React, Vite, Firebase
              </li>
              <li className="flex items-center gap-2 text-slate-900">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Tipe Aplikasi: PWA (Mobile POS)
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-blue-50 bg-blue-50/20 p-4 space-y-2.5">
            <div className="flex gap-2">
              <HelpCircle size={16} className="text-blue-700 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-blue-950">Butuh Bantuan Teknis?</p>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Hubungi tim pengembang **MAROA Project** jika Anda menemukan masalah database, butuh kustomisasi struk thermal, atau optimasi sinkronisasi stok.
            </p>
          </div>
        </div>

        {/* AREA KONTEN UTAMA DOKUMEN */}
        <div className="md:col-span-2 space-y-6">
          {/* SEKSI 1: DESKRIPSI UMUM */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-blue-900 font-bold text-sm sm:text-base border-b border-slate-100 pb-2">
              <Shield size={18} />
              <h4>1. Deskripsi Umum</h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              **3 Berlian POS** adalah aplikasi kasir terintegrasi yang dirancang khusus untuk mempermudah operasional bisnis penyewaan kostum adat nusantara. Aplikasi ini mendukung penuh pencatatan transaksi sewa, pemesanan (*booking*) di awal, pengembalian barang secara terstruktur, manajemen inventaris stok, audit fisik (*stock opname*), hingga pelaporan omzet dan audit keuangan sanggar.
            </p>
          </div>

          {/* SEKSI 2: ALUR OPERASIONAL KASIR */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-blue-900 font-bold text-sm sm:text-base border-b border-slate-100 pb-2">
              <Terminal size={18} />
              <h4>2. Panduan Alur Transaksi Kasir</h4>
            </div>
            <div className="space-y-3.5 text-xs sm:text-sm text-slate-600">
              <div className="space-y-1">
                <p className="font-bold text-slate-900">A. Alur Sewa Kostum</p>
                <p className="leading-relaxed">
                  Pilih produk kostum dari katalog atau scan barcode fisik. Lengkapi data pelanggan, tentukan tanggal sewa dan batas pengembalian. Masukkan deposit jaminan (opsional) dan diskon, lalu pilih metode pembayaran. Tekan tombol **Proses Sewa** untuk menyimpan transaksi dan mencetak struk thermal.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900">B. Alur Pengembalian Kostum</p>
                <p className="leading-relaxed">
                  Gunakan menu **Pengembalian**, cari nota sewa aktif pelanggan, centang barang-barang yang dikembalikan, dan lakukan pengecekan kondisi fisik kostum. Jika terdapat keterlambatan atau kerusakan barang, sistem secara otomatis akan menghitung denda keterlambatan/denda barang rusak sebelum nota diselesaikan.
                </p>
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900">C. Alur Kalender Booking</p>
                <p className="leading-relaxed">
                  Menu **Booking** digunakan untuk menjadwalkan sewa kostum adat jauh-jauh hari. Sistem dilengkapi algoritma otomatis yang mendeteksi bentrok jadwal pemesanan kostum pada rentang tanggal sewa yang sama untuk mencegah masalah ketersediaan barang.
                </p>
              </div>
            </div>
          </div>

          {/* SEKSI 3: MANAJEMEN INVENTARIS & AUDIT */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-blue-900 font-bold text-sm sm:text-base border-b border-slate-100 pb-2">
              <Settings size={18} />
              <h4>3. Manajemen Stok & Audit</h4>
            </div>
            <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
              <p className="leading-relaxed">
                Stok produk dikelola secara dinamis melalui beberapa status logistik:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>**Tersedia**: Siap dipajang dan disewakan kepada pelanggan.</li>
                <li>**Disewa**: Sedang berada di tangan pelanggan aktif.</li>
                <li>**Laundry**: Sedang dalam proses cuci setelah dikembalikan.</li>
                <li>**Perbaikan**: Sedang dalam proses perbaikan fisik (jahitan/aksesoris).</li>
                <li>**Pensiun/Afkir**: Kostum ditarik secara permanen dari persediaan aktif.</li>
              </ul>
              <p className="leading-relaxed mt-2">
                Manajer atau Admin dapat melakukan audit stok rutin melalui fitur **Stock Opname** dengan mencocokkan data stok komputer dengan kondisi fisik di rak gudang.
              </p>
            </div>
          </div>

          {/* SEKSI 4: TEKNIS & DUKUNGAN SISTEM */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2.5 text-blue-900 font-bold text-sm sm:text-base border-b border-slate-100 pb-2">
              <Code size={18} />
              <h4>4. Arsitektur Teknis</h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Aplikasi ini mengadopsi pola **Progressive Web App (PWA)** sehingga dapat diinstal secara langsung di HP Android maupun iPhone tanpa membuka Play Store/App Store. Penyimpanan data dan sinkronisasi real-time didukung sepenuhnya oleh **Firebase Firestore Database** yang aman, berlatensi rendah, serta didukung *offline capability* dasar saat sinyal internet kurang stabil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
