import { ArrowLeftRight, FileText, Home, Menu, Package, ShoppingBag, UserCog, Users, Calendar, Barcode, BookOpen } from 'lucide-react';

export const navItems = [
  { id: 'dashboard', label: 'Beranda', icon: Home, roles: ['admin', 'cashier'], group: 'Utama' },
  { id: 'rent', label: 'Sewa', icon: ShoppingBag, roles: ['admin', 'cashier'], group: 'Transaksi' },
  { id: 'booking', label: 'Booking', icon: Calendar, roles: ['admin', 'cashier'], group: 'Transaksi' },
  { id: 'return', label: 'Kembali', icon: ArrowLeftRight, roles: ['admin', 'cashier'], group: 'Transaksi' },
  { id: 'products', label: 'Produk', icon: Package, roles: ['admin'], group: 'Data Master' },
  { id: 'opname', label: 'Stock Opname', icon: Barcode, roles: ['admin'], group: 'Data Master' },
  { id: 'customers', label: 'Pelanggan', icon: Users, roles: ['admin', 'cashier'], group: 'Data Master' },
  { id: 'users', label: 'Pengguna', icon: UserCog, roles: ['admin'], group: 'Data Master' },
  { id: 'documentation', label: 'Dokumen', icon: BookOpen, roles: ['admin', 'cashier'], group: 'Sistem' },
  { id: 'reports', label: 'Laporan', icon: FileText, roles: ['admin'], group: 'Analitik' },
  { id: 'menu', label: 'Menu', icon: Menu, roles: ['admin', 'cashier'], group: 'Sistem' },
];

export const pageMeta = {
  dashboard: {
    eyebrow: 'Beranda',
    title: 'Ringkasan toko',
    subtitle: 'Pantau omzet, sewa aktif, dan tugas penting hari ini.',
    searchPlaceholder: 'Cari menu atau ringkasan'
  },
  rent: {
    eyebrow: 'Sewa',
    title: 'Terminal penyewaan',
    subtitle: 'Pilih produk, lengkapi pelanggan, dan proses pembayaran dengan alur yang rapi.',
    searchPlaceholder: 'Cari kostum, kategori, ukuran'
  },
  booking: {
    eyebrow: 'Booking',
    title: 'Kalender Booking & Ketersediaan',
    subtitle: 'Kelola pemesanan kostum di awal untuk mencegah bentrok jadwal sewa.',
    searchPlaceholder: 'Cari pemesanan atau nama pelanggan'
  },
  return: {
    eyebrow: 'Pengembalian',
    title: 'Pengembalian kostum',
    subtitle: 'Pilih nota, cek kondisi barang, lalu selesaikan pengembalian.',
    searchPlaceholder: 'Cari nota atau pelanggan'
  },
  products: {
    eyebrow: 'Produk',
    title: 'Inventaris kostum',
    subtitle: 'Pantau stok, kategori, harga, dan status operasional barang sewa.',
    searchPlaceholder: 'Cari produk, kategori, ukuran'
  },
  opname: {
    eyebrow: 'Audit',
    title: 'Stock Opname',
    subtitle: 'Audit fisik kostum di rak, deteksi discrepancy, dan rekonsiliasi data stok.',
    searchPlaceholder: 'Cari item'
  },
  customers: {
    eyebrow: 'Pelanggan',
    title: 'Data pelanggan',
    subtitle: 'Lihat riwayat kunjungan, deposit, dan detail pelanggan aktif.',
    searchPlaceholder: 'Cari pelanggan atau nomor HP'
  },
  users: {
    eyebrow: 'Pengguna',
    title: 'Manajemen akun',
    subtitle: 'Kelola akses kasir dan admin dengan cepat.',
    searchPlaceholder: 'Cari pengguna'
  },
  documentation: {
    eyebrow: 'Bantuan',
    title: 'Dokumentasi Sistem',
    subtitle: 'Panduan operasional, fitur, dan dukungan sistem 3 Berlian POS.',
    searchPlaceholder: 'Cari panduan'
  },
  reports: {
    eyebrow: 'Laporan',
    title: 'Rekap bisnis',
    subtitle: 'Filter transaksi, lihat omzet, dan unduh laporan operasional.',
    searchPlaceholder: 'Cari nota, pelanggan, telepon'
  },
  menu: {
    eyebrow: 'Menu',
    title: 'Pusat modul',
    subtitle: 'Akses modul operasional dan ruang pengembangan layanan sanggar berikutnya.',
    searchPlaceholder: 'Cari modul'
  }
};

export const getRoleNavItems = (role) => {
  return navItems.filter(item => item.roles.includes(role));
};

export const getMobileNavItems = (role) => {
  const mobileIds = ['dashboard', 'rent', 'booking', 'return', 'menu'];

  return getRoleNavItems(role).filter(item => mobileIds.includes(item.id));
};
