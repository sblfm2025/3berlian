import { useMemo, useState } from 'react';
import { ArrowLeftRight, FileText, Package, ShoppingBag, UserCog, Users, X } from 'lucide-react';

import KpiCard from '../components/dashboard/KpiCard';
import MetricCard from '../components/dashboard/MetricCard';
import { useDashboardStats } from '../features/dashboard/hooks/useDashboardStats';
import { formatCurrency, formatDate } from '../utils/format';
import { useMobileSearchRegistration } from '../components/layout/useMobileSearch';

// ==========================================
// TAMPILAN BERANDA (DASHBOARD)
// ==========================================
const getStatusLabel = (status) => {
  if (status === 'selesai') return 'Selesai';
  if (status === 'disewa') return 'Disewa';
  return status || '-';
};

export default function DashboardPage({ transactions, products, onNavigate }) {
  const [dashboardSearch, setDashboardSearch] = useState('');
  const {
    activeItemsCount,
    activeRentals,
    averageTicket,
    bestPaymentMethod,
    completedToday,
    customerCount,
    lowStockCount,
    lowStockProducts,
    overdueRentals,
    paymentMix,
    paymentRevenueMix,
    pendingReturnCount,
    priorityReturns,
    recentTransactions,
    today,
    todayRevenueShare,
    todayTransactions,
    topProducts,
    totalIncomeToday,
    totalRevenue,
    trend,
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

  const menuGroups = [
    {
      title: 'Transaksi',
      items: [
        { label: 'Sewa Kostum', target: 'rent', icon: ShoppingBag, color: 'bg-blue-50 text-blue-700 group-hover:bg-blue-700 group-hover:text-white' },
        { label: 'Pengembalian', target: 'return', icon: ArrowLeftRight, color: 'bg-amber-50 text-amber-700 group-hover:bg-amber-500 group-hover:text-white' }
      ]
    },
    {
      title: 'Data Master',
      items: [
        { label: 'Produk', target: 'products', icon: Package, color: 'bg-sky-50 text-sky-700 group-hover:bg-sky-600 group-hover:text-white' },
        { label: 'Pelanggan', target: 'customers', icon: Users, color: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white' },
        { label: 'Pengguna', target: 'users', icon: UserCog, color: 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white' }
      ]
    },
    {
      title: 'Analitik',
      items: [
        { label: 'Laporan', target: 'reports', icon: FileText, color: 'bg-violet-50 text-violet-700 group-hover:bg-violet-600 group-hover:text-white' }
      ]
    }
  ];
  const operationalMenus = menuGroups.flatMap(group => group.items);
  const filteredMenus = useMemo(() => {
    const keyword = dashboardSearch.trim().toLowerCase();
    if (!keyword) return operationalMenus;

    return operationalMenus.filter(item => `${item.label} ${item.target}`.toLowerCase().includes(keyword));
  }, [dashboardSearch, operationalMenus]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="brand-gradient hidden rounded-[24px] p-6 text-white shadow-soft md:block md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-sm md:text-base font-semibold uppercase tracking-[0.2em] text-white/85">3 Berlian POS Penyewaan Kostum</p>
            <h2 className="mt-3 text-2xl md:text-3xl font-black leading-tight">Pusat kerja kasir untuk sewa kostum adat</h2>
            <p className="mt-3 text-sm md:text-base text-white/90 max-w-xl">
              Pantau omzet, stok menipis, transaksi aktif, dan pengembalian jatuh tempo dari satu panel kerja cepat dan profesional.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">Sewa cepat</span>
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">Pengembalian terstruktur</span>
              <span className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">Karyawan kasir siap</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-[280px]">
            <div className="rounded-[22px] bg-white/10 backdrop-blur-sm p-4 border border-white/20">
              <p className="text-xs uppercase tracking-[0.2em] text-white/85">Omzet total</p>
              <p className="mt-2 text-2xl font-black">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="rounded-[22px] bg-white/10 backdrop-blur-sm p-4 border border-white/20">
              <p className="text-xs uppercase tracking-[0.2em] text-white/85">Produk tersedia</p>
              <p className="mt-2 text-2xl font-black">{products.length}</p>
            </div>
            <div className="rounded-[22px] bg-white/10 backdrop-blur-sm p-4 border border-white/20 col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-white/85">Status hari ini</p>
              <p className="mt-2 text-lg font-bold">{completedToday.length} transaksi selesai - {pendingReturnCount} pengembalian perlu perhatian</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-3 gap-x-4 gap-y-5 px-5 py-5 sm:grid-cols-4 md:grid-cols-6 md:px-6">
          {filteredMenus.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.target}
                type="button"
                onClick={() => onNavigate(item.target)}
                className="group flex flex-col items-center rounded-[20px] px-2 py-2 text-center transition hover:bg-blue-50"
              >
                <span className={`flex h-16 w-16 items-center justify-center rounded-full shadow-sm transition ${item.color}`}>
                  <Icon size={27} strokeWidth={2.4} />
                </span>
                <span className="mt-2 min-h-[28px] text-xs font-bold leading-tight text-slate-700">{item.label}</span>
              </button>
            );
          })}
          {filteredMenus.length === 0 && (
            <div className="col-span-3 rounded-[22px] border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500 sm:col-span-4 md:col-span-6">
              Menu tidak ditemukan.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(card => (
          <KpiCard
            key={card.title}
            title={card.title}
            value={card.value}
            subtitle={card.subtitle}
            tone={card.tone}
            onClick={card.onClick}
          />
        ))}
      </div>

      <div className="hidden grid-cols-1 gap-4 sm:grid-cols-2 md:grid xl:grid-cols-4">
        <MetricCard
          title="Kontribusi omzet hari ini"
          value={`${todayRevenueShare}%`}
          description={`Dari total omzet saat ini, ${formatCurrency(totalIncomeToday)} berasal dari transaksi hari ini.`}
        />
        <MetricCard
          title="Pengembalian tertunda"
          value={pendingReturnCount}
          description="Gabungan transaksi terlambat dan yang akan jatuh dalam 7 hari."
        />
        <MetricCard
          title="Stok menipis"
          value={lowStockCount}
          description="Produk yang membutuhkan perhatian restock sebelum shift berikutnya."
        />
        <MetricCard
          title="Metode utama"
          value={bestPaymentMethod}
          valueClassName="text-lg"
          description={`Mendominasi omzet dengan ${formatCurrency(paymentRevenueMix[bestPaymentMethod] || 0)}.`}
        />
      </div>

      <div className="hidden grid-cols-1 gap-4 md:grid md:grid-cols-3">
        <MetricCard
          title="Pelanggan aktif"
          value={customerCount}
          description="Jumlah pelanggan dari riwayat transaksi terakhir."
        />
        <MetricCard
          title="Item sedang disewa"
          value={activeItemsCount}
          description="Total item aktif yang sedang berada di tangan pelanggan."
        />
        <MetricCard
          title="Metode paling dominan"
          value={bestPaymentMethod}
          valueClassName="text-lg"
          description={`${formatCurrency(paymentRevenueMix[bestPaymentMethod] || 0)} kontribusi omzet.`}
        />
      </div>

      <div className="hidden grid-cols-1 gap-4 md:grid xl:grid-cols-[1.2fr_0.8fr]">
        <div className="pos-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">Performa omzet 7 hari</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">Pergerakan harian</h3>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">Kasir</span>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-2 items-end min-h-[180px]">
            {trend.map(item => (
              <div key={item.label} className="flex flex-col items-center gap-2">
                <div className="flex h-36 w-full items-end justify-center">
                  <div className="w-full rounded-t-[18px] bg-gradient-to-t from-blue-700 to-amber-300" style={{ height: `${Math.max(18, (item.total / Math.max(...trend.map(t => t.total), 1)) * 100)}%` }} />
                </div>
                <div className="text-[11px] font-bold text-slate-500 text-center">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="pos-card p-5">
            <div>
              <p className="text-sm font-semibold text-slate-500">Peringatan operasional</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">Prioritas segera</h3>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[20px] bg-red-50 border border-red-100 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-red-700">Terlambat</p>
                <p className="mt-2 text-2xl font-black text-red-700">{overdueRentals.length}</p>
              </div>
              <div className="rounded-[20px] bg-amber-50 border border-amber-100 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-amber-700">Mendekati batas</p>
                <p className="mt-2 text-2xl font-black text-amber-700">{upcomingReturns.length}</p>
              </div>
              <div className="rounded-[20px] bg-emerald-50 border border-emerald-100 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-700">Transaksi hari ini</p>
                <p className="mt-2 text-2xl font-black text-emerald-700">{completedToday.length}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onNavigate('return')}
                className="rounded-[16px] bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 transition"
              >
                Lihat pengembalian
              </button>
              <button
                type="button"
                onClick={() => onNavigate('reports')}
                className="rounded-[16px] bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800 transition"
              >
                Lihat laporan
              </button>
            </div>

            <div className="mt-5 rounded-[22px] border border-slate-100 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Transaksi prioritas</p>
                  <p className="mt-1 text-sm text-slate-500">Daftar paling relevan untuk dikerjakan sebelum shift berikutnya.</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">{priorityReturns.length} item</span>
              </div>

              <div className="mt-4 space-y-3">
                {priorityReturns.length === 0 ? (
                  <div className="rounded-[18px] border border-dashed border-slate-200 px-4 py-5 text-sm text-slate-500">
                    Tidak ada pengembalian mendesak untuk ditindaklanjuti.
                  </div>
                ) : priorityReturns.map(tx => (
                  <div key={tx.id} className="rounded-[18px] bg-white px-4 py-3 shadow-sm border border-slate-100">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{tx.customerName || 'Pelanggan belum tercatat'}</p>
                        <p className="text-xs text-slate-500">{tx.id} - {formatDate(tx.expectedReturnDate || tx.rentDate)}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${tx.expectedReturnDate <= today ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                        {tx.expectedReturnDate <= today ? 'Terlambat' : 'Mendekati batas'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pos-card p-5">
            <div>
              <p className="text-sm font-semibold text-slate-500">Metode pembayaran</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">Komposisi transaksi & omzet</h3>
            </div>
            <div className="mt-5 space-y-4">
              {Object.entries(paymentMix).length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada transaksi untuk ditampilkan.</p>
              ) : Object.entries(paymentMix).map(([method, count]) => {
                const revenue = paymentRevenueMix[method] || 0;
                const share = Math.max(10, (count / Math.max(...Object.values(paymentMix), 1)) * 100);

                return (
                  <div key={method}>
                    <div className="flex justify-between text-sm font-semibold text-slate-700 gap-3">
                      <span>{method}</span>
                      <span>{count} transaksi - {formatCurrency(revenue)}</span>
                    </div>
                    <div className="metric-bar mt-2">
                      <span style={{ width: `${share}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_1fr]">
        <div className="pos-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">Transaksi terakhir</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">Aktivitas paling baru</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{recentTransactions.length} data</span>
          </div>

          <div className="mt-4 space-y-3">
            {recentTransactions.length === 0 ? (
              <div className="rounded-[22px] border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                Belum ada transaksi. Mulai penyewaan pertama untuk melihat ringkasan di sini.
              </div>
            ) : recentTransactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between gap-3 rounded-[20px] bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-bold text-slate-900">{tx.customerName || 'Pelanggan belum tercatat'}</p>
                  <p className="text-sm text-slate-500">{tx.id} - {formatDate(tx.rentDate || new Date().toISOString())}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">{formatCurrency((tx.totalAmount || 0) + (tx.lateFee || 0))}</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{getStatusLabel(tx.status)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden gap-4 md:grid">
          <div className="pos-card p-5">
            <p className="text-sm font-semibold text-slate-500">Produk terlaris</p>
            <h3 className="mt-1 text-lg font-black text-slate-900">Permintaan tertinggi</h3>
            <div className="mt-4 space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada data produk dari transaksi.</p>
              ) : topProducts.map(([name, count]) => (
                <div key={name} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-700">{name}</span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{count} item</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pos-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-500">Stok menipis</p>
                <h3 className="mt-1 text-lg font-black text-slate-900">Perhatian inventaris</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className="rounded-[16px] bg-amber-500 px-4 py-2 text-sm font-bold text-slate-900 hover:bg-amber-400 transition"
              >
                Atur stok
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-slate-500">Semua produk memiliki stok yang aman.</p>
              ) : lowStockProducts.map(product => (
                <div key={product.id} className="flex items-center justify-between gap-3 rounded-[18px] bg-amber-50 px-4 py-3">
                  <div>
                    <p className="font-bold text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-500">Kategori {product.category || 'Lainnya'}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Sisa {product.stock}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] shadow-2xl animate-in zoom-in-95">
            <div className="p-5 bg-blue-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">{modalConfig.title}</h3>
              <button onClick={handleCloseModal} className="p-1.5 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors"><X size={20}/></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 bg-gray-50/50">
              {modalConfig.data.length === 0 ? (
                <div className="text-center text-gray-400 py-12 flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"><FileText size={32} className="text-gray-300" /></div>
                  <p className="font-medium text-gray-500">Tidak ada data untuk kategori ini.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {modalConfig.data.slice().sort((a, b) => (b.rentDate || '').localeCompare(a.rentDate || '')).map(t => (
                    <li key={t.id} className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-3 gap-3">
                        <div>
                          <p className="font-bold text-gray-900">{t.id}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1"><Users size={14} className="text-gray-400"/> {t.customerName || 'Pelanggan belum tercatat'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${t.status === 'selesai' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {getStatusLabel(t.status)}
                        </span>
                      </div>
                      <div className="flex justify-between items-end pt-3 border-t border-gray-100">
                        <div className="text-[11px] text-gray-500 space-y-1">
                          <p>Sewa: <span className="font-semibold text-gray-700">{formatDate(t.rentDate || new Date().toISOString())}</span></p>
                          <p>Batas: <span className={`font-semibold ${t.expectedReturnDate <= today && t.status === 'disewa' ? 'text-red-500' : 'text-gray-700'}`}>{formatDate(t.expectedReturnDate || t.rentDate || new Date().toISOString())}</span></p>
                        </div>
                        <div className="font-black text-amber-600 text-lg">{formatCurrency((t.totalAmount || 0) + (t.lateFee || 0))}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
