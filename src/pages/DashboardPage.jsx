import { useMemo, useState } from 'react';
import { ArrowLeftRight, Package, ShoppingBag, X, ShieldAlert, Truck, Sparkles, Info, UserCog, Users, FileText } from 'lucide-react';

import KpiCard from '../components/dashboard/KpiCard';
import { useDashboardStats } from '../features/dashboard/hooks/useDashboardStats';
import { formatCurrency, formatDate } from '../utils/format';
import { getTransactionStatusLabel, isCompletedTransaction } from '../utils/transactionStatus';
import { useMobileSearchRegistration } from '../components/layout/useMobileSearch';

const getStatusLabel = (status) => {
  return getTransactionStatusLabel(status);
};

export default function DashboardPage({ transactions, products, user, onNavigate }) {
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [activeTab, setActiveTab] = useState('kasir'); // 'kasir', 'owner', 'gudang'

  const {
    activeRentals,
    averageTicket,
    customerCount,
    lowStockCount,
    lowStockProducts,
    overdueRentals,
    paymentRevenueMix,
    todayTransactions,
    topProducts,
    totalIncomeToday,
    totalRevenue,
    upcomingReturns
  } = useDashboardStats({ transactions, products });



  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', data: [] });
  const handleOpenModal = (title, data) => setModalConfig({ isOpen: true, title, data });
  const handleCloseModal = () => setModalConfig({ isOpen: false, title: '', data: [] });

  const mobileSearchConfig = useMemo(() => ({
    placeholder: 'Cari menu beranda',
    value: dashboardSearch,
    onChange: setDashboardSearch
  }), [dashboardSearch]);
  useMobileSearchRegistration(mobileSearchConfig);

  const menuItems = useMemo(() => {
    const allItems = [
      { id: 'rent', label: 'Sewa Kostum', icon: ShoppingBag, color: 'bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white', roles: ['admin', 'cashier'] },
      { id: 'return', label: 'Pengembalian', icon: ArrowLeftRight, color: 'bg-amber-50 text-amber-700 group-hover:bg-amber-500 group-hover:text-white', roles: ['admin', 'cashier'] },
      { id: 'products', label: 'Produk', icon: Package, color: 'bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white', roles: ['admin'] },
      { id: 'customers', label: 'Pelanggan', icon: Users, color: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white', roles: ['admin', 'cashier'] },
      { id: 'users', label: 'Pengguna', icon: UserCog, color: 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white', roles: ['admin'] },
      { id: 'reports', label: 'Laporan', icon: FileText, color: 'bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white', roles: ['admin'] }
    ];
    const userRole = user?.role || 'cashier';
    return allItems.filter(item => item.roles.includes(userRole));
  }, [user]);

  const filteredMenus = useMemo(() => {
    const keyword = dashboardSearch.trim().toLowerCase();
    if (!keyword) return menuItems;
    return menuItems.filter(item => item.label.toLowerCase().includes(keyword));
  }, [dashboardSearch, menuItems]);

  // Periksa stok laundry dan maintenance makro untuk Dashboard Gudang
  const warehouseStats = useMemo(() => {
    let laundryQty = 0;
    let maintenanceQty = 0;
    let retiredQty = 0;
    let lostQty = 0;

    products.forEach(p => {
      laundryQty += Number(p.laundryStock || p.stockLaundry || 0);
      maintenanceQty += Number(p.maintenanceStock || p.stockDamaged || 0);
      retiredQty += Number(p.retiredStock || 0);
      lostQty += Number(p.lostStock || 0);
    });

    return { laundryQty, maintenanceQty, retiredQty, lostQty };
  }, [products]);

  const statCards = [
    {
      title: 'Omzet Hari Ini',
      value: formatCurrency(totalIncomeToday),
      subtitle: `${todayTransactions.length} transaksi selesai`,
      tone: 'blue',
      onClick: () => handleOpenModal('Transaksi Hari Ini', todayTransactions)
    },
    {
      title: 'Barang Disewa',
      value: String(activeRentals.length),
      subtitle: 'Nota aktif saat ini',
      tone: 'amber',
      onClick: () => handleOpenModal('Barang Sedang Disewa', activeRentals)
    },
    {
      title: 'Perlu Dikembalikan',
      value: String(overdueRentals.length),
      subtitle: 'Jatuh tempo atau terlambat',
      tone: 'red',
      onClick: () => handleOpenModal('Perlu Dikembalikan', overdueRentals)
    },
    {
      title: 'Rata-rata Transaksi',
      value: formatCurrency(averageTicket),
      subtitle: 'Per hitungan keseluruhan data',
      tone: 'green',
      onClick: () => handleOpenModal('Ringkasan Omzet', transactions)
    }
  ];



  const isAdmin = user?.role === 'admin';

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      {/* TABS MULTI-ROLE (Hanya untuk Admin) */}
      {isAdmin && (
        <div className="flex border-b border-slate-200 bg-white p-1 rounded-2xl shadow-sm gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('kasir')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition ${activeTab === 'kasir' ? 'bg-emerald-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'} min-h-[44px]`}
          >
            Kasir POS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('owner')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition ${activeTab === 'owner' ? 'bg-emerald-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'} min-h-[44px]`}
          >
            Analitik Owner
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gudang')}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition ${activeTab === 'gudang' ? 'bg-emerald-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'} min-h-[44px]`}
          >
            Operasional Gudang
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. DASBOR KASIR                                          */}
      {/* ======================================================== */}
      {(activeTab === 'kasir' || !isAdmin) && (
        <div className="space-y-4">
          {/* GRID MENU OPERASIONAL (OPSI A) */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm sm:rounded-2xl">
            <div className="grid grid-cols-3 gap-x-2 gap-y-5 sm:grid-cols-3 md:grid-cols-6">
              {filteredMenus.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className="group flex flex-col items-center rounded-[20px] px-1 py-1 text-center transition hover:bg-slate-50 min-h-[44px]"
                  >
                    <span className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm transition ${item.color}`}>
                      <Icon size={24} strokeWidth={2.4} />
                    </span>
                    <span className="mt-2 text-xs font-bold leading-tight text-slate-700">{item.label}</span>
                  </button>
                );
              })}
              {filteredMenus.length === 0 && (
                <div className="col-span-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-xs font-semibold text-slate-500 sm:col-span-3 md:col-span-6">
                  Menu tidak ditemukan.
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map(card => (
              <KpiCard key={card.title} {...card} />
            ))}
          </div>

          {/* UPCOMING & OVERDUE */}
          <div className="rounded-[18px] border border-slate-200 bg-white p-3 shadow-sm md:p-4 space-y-3 sm:rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-sm sm:tracking-[0.18em]">Jadwal Pengembalian Terdekat</h3>
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {upcomingReturns.length === 0 ? (
                <div className="text-center text-xs font-bold text-slate-400 py-6">
                  Tidak ada pengembalian kostum terjadwal untuk hari ini.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {upcomingReturns.slice(0, 6).map(trx => (
                    <div key={trx.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs font-bold">
                      <div>
                        <p className="text-slate-900">{trx.customerName}</p>
                        <p className="text-slate-400 mt-0.5">Nota: {trx.id}</p>
                      </div>
                      <span className="text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        {trx.items?.length || 0} unit
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. DASBOR OWNER (ANALITIK KEUANGAN & TRANSAKSI)          */}
      {/* ======================================================== */}
      {activeTab === 'owner' && isAdmin && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Omzet Toko Keseluruhan</p>
              <p className="mt-2 text-base font-bold text-slate-900 sm:text-xl">{formatCurrency(totalRevenue)}</p>
              <p className="mt-1 text-xs text-slate-500">Void nota dikecualikan</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Jumlah Transaksi Terdaftar</p>
              <p className="mt-2 text-base font-bold text-slate-900 sm:text-xl">{transactions.length} Nota</p>
              <p className="mt-1 text-xs text-slate-500">Termasuk draft & return</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rata-rata Transaksi (AOV)</p>
              <p className="mt-2 text-base font-bold text-emerald-800 sm:text-xl">{formatCurrency(averageTicket)}</p>
              <p className="mt-1 text-xs text-slate-500">Per pemesanan selesai</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Jumlah Pelanggan Unik</p>
              <p className="mt-2 text-base font-bold text-emerald-600 sm:text-xl">{customerCount} Orang</p>
              <p className="mt-1 text-xs text-slate-500">Mempunyai no. telepon aktif</p>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            {/* METODE PEMBAYARAN & PRODUK TERLARIS */}
            <div className="rounded-[18px] border border-slate-200 bg-white p-3 shadow-sm space-y-3 sm:rounded-2xl sm:p-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-sm sm:tracking-[0.18em]">Grafik Metode Pembayaran</h3>
              <div className="space-y-3.5">
                {Object.entries(paymentRevenueMix).map(([method, revenue]) => {
                  const pct = totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0;
                  return (
                    <div key={method} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>{method}</span>
                        <span>{formatCurrency(revenue)} ({pct.toFixed(1)}%)</span>
                      </div>
                      <div className="metric-bar">
                        <span style={{ width: `${Math.max(8, pct)}%` }} className="bg-emerald-800" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[18px] border border-slate-200 bg-white p-3 shadow-sm space-y-3 sm:rounded-2xl sm:p-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-sm sm:tracking-[0.18em]">Analitik Produk Terlaris</h3>
              <div className="space-y-3">
                {topProducts.slice(0, 4).map(([name, qty]) => (
                  <div key={name} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs font-bold">
                    <div>
                      <p className="text-slate-900">{name}</p>
                      <p className="text-slate-400 mt-0.5">Kostum Adat Nusantara</p>
                    </div>
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px]">
                      {qty}x Sewa
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. DASBOR GUDANG (LOGISTIK & KONDISI BARANG)             */}
      {/* ======================================================== */}
      {activeTab === 'gudang' && isAdmin && (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                <Truck size={18} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Antrean Laundry</p>
                <p className="mt-1 text-sm font-bold text-slate-900 sm:text-lg">{warehouseStats.laundryQty} Unit</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                <ShieldAlert size={18} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sedang Perbaikan</p>
                <p className="mt-1 text-sm font-bold text-slate-900 sm:text-lg">{warehouseStats.maintenanceQty} Unit</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-700">
                <ShieldAlert size={18} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Kostum Hilang</p>
                <p className="mt-1 text-sm font-bold text-slate-900 sm:text-lg">{warehouseStats.lostQty} Unit</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Package size={18} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pensiun / Afkir</p>
                <p className="mt-1 text-sm font-bold text-slate-900 sm:text-lg">{warehouseStats.retiredQty} Unit</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_0.90fr]">
            {/* KOSTUM STOK KRITIS */}
            <div className="rounded-[18px] border border-slate-200 bg-white p-3 shadow-sm space-y-3 sm:rounded-2xl sm:p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-sm sm:tracking-[0.18em]">Peringatan Stok Kritis (&le; 2)</h3>
                <span className="bg-red-50 text-red-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">{lowStockCount} Produk</span>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {lowStockProducts.length === 0 ? (
                  <div className="text-center text-xs font-bold text-slate-400 py-8 bg-slate-50 rounded-xl">
                    Semua stok kostum aman terkendali.
                  </div>
                ) : lowStockProducts.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-red-50/30 p-2.5 rounded-xl border border-red-100 text-xs font-bold">
                    <div>
                      <p className="text-slate-900">{p.name} ({p.size})</p>
                      <p className="text-red-600 mt-0.5">Sisa stok fisik: {p.availableStock || p.stock || 0} unit</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onNavigate('products')}
                      className="rounded-lg bg-red-100 text-red-700 hover:bg-red-200 px-2 py-1 text-[10px] font-semibold"
                    >
                      Restock
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SUMMARY GUDANG */}
            <div className="rounded-[18px] border border-slate-200 bg-white p-3 shadow-sm space-y-3 sm:rounded-2xl sm:p-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-sm sm:tracking-[0.18em]">Petunjuk Logistik</h3>
              <div className="rounded-2xl border border-emerald-50 bg-emerald-50/30 p-4 space-y-3">
                <div className="flex gap-2">
                  <Sparkles size={16} className="text-emerald-800 mt-0.5 shrink-0" />
                  <p className="text-xs font-bold text-emerald-950 leading-relaxed">
                    Pastikan kostum dalam antrean **laundry ({warehouseStats.laundryQty} unit)** dicuci tepat waktu agar siap disewakan kembali pada pesanan booking berikutnya.
                  </p>
                </div>
                <div className="flex gap-2 pt-2 border-t border-emerald-100">
                  <Info size={16} className="text-slate-600 mt-0.5 shrink-0" />
                  <p className="text-xs font-bold text-slate-700 leading-relaxed">
                    Kostum berstatus **perbaikan ({warehouseStats.maintenanceQty} unit)** perlu dikoordinasikan dengan penjahit agar segera masuk kembali ke stok aktif gudang.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL OVERLAY */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-t-[22px] bg-white shadow-xl sm:rounded-[24px]">
            <div className="flex items-center justify-between bg-emerald-900 px-4 py-3 text-white sm:px-5 sm:py-4">
              <h3 className="text-sm font-bold uppercase tracking-[0.12em] sm:tracking-[0.18em]">{modalConfig.title}</h3>
              <button type="button" onClick={handleCloseModal} className="rounded-full bg-emerald-800 p-2 hover:bg-emerald-700 min-h-[32px]">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto bg-slate-50 p-3 space-y-3 sm:p-5">
              {modalConfig.data.length === 0 ? (
                <p className="text-center text-sm font-semibold text-slate-500 py-6">Tidak ada data untuk ditampilkan.</p>
              ) : modalConfig.data.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-1.5 animate-fade-in">
                  <div className="flex justify-between text-xs font-bold text-slate-700 gap-2">
                    <span className="truncate text-slate-900">{item.customerName || item.customer?.name || 'Pelanggan'}</span>
                    <span className="shrink-0">{formatDate(item.rentDate || item.rentedAt)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs gap-3">
                    <span className="font-bold text-slate-400">Nota: {item.id || item.invoiceNumber}</span>
                    <span className="font-bold text-amber-600">{formatCurrency((item.totalAmount || item.grandTotal || 0) + (item.lateFee || 0))}</span>
                  </div>
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${isCompletedTransaction(item) ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {getStatusLabel(item.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
