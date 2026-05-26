import { ArrowLeftRight, FileText, Home, Package, ShoppingBag, UserCog, Users } from 'lucide-react';

export const navItems = [
  { id: 'dashboard', label: 'Beranda', icon: Home, roles: ['admin', 'cashier'], group: 'Utama' },
  { id: 'rent', label: 'Sewa', icon: ShoppingBag, roles: ['admin', 'cashier'], group: 'Transaksi' },
  { id: 'return', label: 'Kembali', icon: ArrowLeftRight, roles: ['admin', 'cashier'], group: 'Transaksi' },
  { id: 'products', label: 'Produk', icon: Package, roles: ['admin'], group: 'Data Master' },
  { id: 'customers', label: 'Pelanggan', icon: Users, roles: ['admin', 'cashier'], group: 'Data Master' },
  { id: 'users', label: 'Pengguna', icon: UserCog, roles: ['admin'], group: 'Data Master' },
  { id: 'reports', label: 'Laporan', icon: FileText, roles: ['admin'], group: 'Analitik' },
];

export const pageMeta = {
  dashboard: {
    eyebrow: 'Beranda',
    title: 'Ringkasan toko',
    subtitle: 'Pantau omzet, sewa aktif, dan tugas penting hari ini.'
  },
  rent: {
    eyebrow: 'Sewa',
    title: 'Terminal penyewaan',
    subtitle: 'Pilih produk, lengkapi pelanggan, dan proses pembayaran dengan alur yang rapi.'
  },
  return: {
    eyebrow: 'Pengembalian',
    title: 'Pengembalian kostum',
    subtitle: 'Pilih nota, cek kondisi barang, lalu selesaikan pengembalian.'
  },
  products: {
    eyebrow: 'Produk',
    title: 'Inventaris kostum',
    subtitle: 'Pantau stok, kategori, harga, dan status operasional barang sewa.'
  },
  customers: {
    eyebrow: 'Pelanggan',
    title: 'Data pelanggan',
    subtitle: 'Lihat riwayat kunjungan, deposit, dan detail pelanggan aktif.'
  },
  users: {
    eyebrow: 'Pengguna',
    title: 'Manajemen akun',
    subtitle: 'Kelola akses kasir dan admin dengan cepat.'
  },
  reports: {
    eyebrow: 'Laporan',
    title: 'Rekap bisnis',
    subtitle: 'Filter transaksi, lihat omzet, dan unduh laporan operasional.'
  }
};

export const getRoleNavItems = (role) => {
  return navItems.filter(item => item.roles.includes(role));
};

export const getMobileNavItems = (role) => {
  const mobileIds = role === 'admin'
    ? ['dashboard', 'rent', 'return', 'products', 'reports']
    : ['dashboard', 'return', 'rent', 'customers'];

  return getRoleNavItems(role).filter(item => mobileIds.includes(item.id));
};
