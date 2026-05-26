import { useMemo, useState } from 'react';
import { Search, Calendar, ChevronLeft, ChevronRight, Cloud, Edit, Trash2, X, Printer, FileSpreadsheet, FileDown } from 'lucide-react';
import { formatCurrency, formatDate, formatNumberDot } from '../utils/format';
import { useReportData } from '../features/reports/hooks/useReportData';
import { useReportExport } from '../features/reports/hooks/useReportExport';
import { useMobileSearchRegistration } from '../components/layout/useMobileSearch';

// ==========================================
const getStatusLabel = (status) => {
  if (status === 'selesai') return 'Selesai';
  if (status === 'disewa') return 'Disewa';
  return status || '-';
};

export default function ReportsPage({ transactions, onViewReceipt, onDelete, onEdit }) {
  const {
    REPORTS_PER_PAGE,
    activeCount,
    averageLateFee,
    completedCount,
    customerCount,
    getLateDays,
    hasTransactions,
    lateFeeRatio,
    overdueCount,
    overdueTransactions,
    paginatedTransactions,
    paymentMethodFilter,
    paymentMix,
    paymentMixList,
    reportEndNumber,
    reportPageCount,
    reportStartNumber,
    resetFilters,
    safeReportPage,
    searchTerm,
    selectedMonth,
    setReportPage,
    sortedTransactions,
    statusFilter,
    topCustomerList,
    topPaymentMethod,
    topProductList,
    totalDenda,
    totalRevenue,
    totalSewa,
    updatePaymentMethodFilter,
    updateSearchTerm,
    updateSelectedMonth,
    updateStatusFilter
  } = useReportData({ transactions });
  const mobileSearchConfig = useMemo(() => ({
    placeholder: 'Cari nota, pelanggan, telepon',
    value: searchTerm,
    onChange: updateSearchTerm
  }), [searchTerm, updateSearchTerm]);
  useMobileSearchRegistration(mobileSearchConfig);
  const summaryCards = [
    {
      title: 'Pendapatan Sewa',
      value: formatCurrency(totalSewa),
      description: `${sortedTransactions.length} transaksi terfilter`
    },
    {
      title: 'Pendapatan Denda',
      value: formatCurrency(totalDenda),
      description: `${lateFeeRatio.toFixed(1)}% dari omzet`
    },
    {
      title: 'Total Omzet',
      value: formatCurrency(totalRevenue),
      description: `Metode utama: ${topPaymentMethod}`
    },
    {
      title: 'Rata-rata Denda',
      value: formatCurrency(averageLateFee),
      description: `${completedCount} selesai - ${activeCount} aktif`
    },
    {
      title: 'Transaksi Terlambat',
      value: String(overdueCount),
      description: `${customerCount} pelanggan aktif pada periode ini`
    }
  ];

  const [editingTrx, setEditingTrx] = useState(null);
  const [formData, setFormData] = useState({});
  const { handleExportExcel, handleExportPDF, isExporting } = useReportExport({
    getStatusLabel,
    selectedMonth,
    sortedTransactions,
    totalDenda,
    totalRevenue,
    totalSewa
  });

  const openEditModal = (trx) => {
    setEditingTrx(trx);
    setFormData({
      customerName: trx.customerName || '',
      customerPhone: trx.customerPhone || '',
      customerAddress: trx.customerAddress || '',
      rentDate: trx.rentDate || '',
      expectedReturnDate: trx.expectedReturnDate || '',
      status: trx.status || 'disewa',
      lateFee: trx.lateFee || 0
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updatedTrx = { ...editingTrx, ...formData, lateFee: Number(formData.lateFee) };
    onEdit(updatedTrx);
    setEditingTrx(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="hidden md:block">
          <p className="text-sm font-semibold text-slate-500">Laporan</p>
          <h2 className="mt-1 text-2xl font-black text-slate-900">Rekap operasional bulan ini</h2>
          <p className="mt-2 hidden max-w-2xl text-sm text-slate-600 md:block">
            Pantau omzet, kontribusi denda, metode pembayaran, dan produk paling laris berdasarkan filter bulan dan status transaksi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600">
            <Calendar size={16} className="text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={e => {
                updateSelectedMonth(e.target.value);
              }}
              className="border-none bg-transparent text-sm font-bold text-slate-800 focus:outline-none"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              updateStatusFilter(e.target.value);
            }}
            className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
          >
            <option value="Semua">Semua status</option>
            <option value="disewa">Disewa</option>
            <option value="selesai">Selesai</option>
          </select>
          <select
            value={paymentMethodFilter}
            onChange={(e) => {
              updatePaymentMethodFilter(e.target.value);
            }}
            className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
          >
            <option value="Semua">Semua pembayaran</option>
            <option value="Tunai">Tunai</option>
            <option value="Transfer">Transfer</option>
            <option value="QRIS">QRIS</option>
          </select>
          <button
            type="button"
            onClick={() => {
              resetFilters();
            }}
            className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
          >
            Reset filter
          </button>
        </div>
      </div>

      <div className="hidden rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm md:block">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Pencarian cepat</p>
            <p className="mt-1 hidden text-sm text-slate-600 md:block">Cari berdasarkan no. nota, nama pelanggan, atau nomor telepon.</p>
          </div>
          <div className="flex flex-1 md:max-w-md gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  updateSearchTerm(e.target.value);
                }}
                placeholder="Cari transaksi"
                className="w-full rounded-[18px] border border-slate-200 bg-slate-50 pl-9 pr-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50"
              />
            </div>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  updateSearchTerm('');
                }}
                className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      <div className={`rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm flex flex-wrap items-center justify-between gap-3 ${searchTerm ? 'hidden md:flex' : ''}`}>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Ringkasan filter aktif</p>
          <p className="mt-2 text-sm font-black text-slate-900">{selectedMonth} - {statusFilter} - {paymentMethodFilter}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{sortedTransactions.length} transaksi tampil</div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{reportStartNumber}-{reportEndNumber}</div>
        </div>
      </div>

      <div className={`grid gap-3 md:grid-cols-2 xl:grid-cols-5 ${searchTerm ? 'hidden md:grid' : ''}`}>
        {summaryCards.map((card, index) => (
          <div key={card.title} className={`rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm ${index > 2 ? 'hidden md:block' : ''}`}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{card.title}</p>
            <p className="mt-3 text-2xl font-black text-slate-900">{card.value}</p>
            <p className="mt-2 text-sm text-slate-500">{card.description}</p>
          </div>
        ))}
      </div>

      {!hasTransactions && (
        <div className="rounded-[20px] border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          <p className="font-black text-slate-900">Belum ada transaksi pada periode ini.</p>
          <p className="mt-2 text-sm">Ubah filter bulan/status atau mulai transaksi sewa baru.</p>
        </div>
      )}

      {hasTransactions && (
      <div className={`grid gap-4 xl:grid-cols-[1.1fr_0.9fr] ${searchTerm ? 'hidden md:grid' : ''}`}>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-500">Komposisi pembayaran</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">Metode transaksi</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{Object.keys(paymentMix).length} metode</span>
          </div>

          <div className="mt-4 space-y-4">
            {paymentMixList.length === 0 ? (
              <p className="text-sm text-slate-500">Tidak ada transaksi sesuai filter.</p>
            ) : paymentMixList.map(([method, data]) => (
              <div key={method}>
                <div className="flex justify-between text-sm font-semibold text-slate-700 gap-3">
                  <span>{method}</span>
                  <span>{data.count} transaksi - {formatCurrency(data.revenue)}</span>
                </div>
                <div className="metric-bar mt-2">
                  <span style={{ width: `${Math.max(12, (data.count / Math.max(...paymentMixList.map(([, item]) => item.count), 1)) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-500">Pelanggan paling aktif</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">Pelanggan teratas periode ini</h3>
            </div>

            <div className="mt-4 space-y-3">
              {topCustomerList.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada kontribusi pelanggan dari transaksi yang difilter.</p>
              ) : topCustomerList.map(([name, revenue]) => (
                <div key={name} className="flex items-center justify-between gap-3 rounded-[18px] bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-bold text-slate-900">{name}</p>
                    <p className="text-sm text-slate-500">Kontribusi omzet</p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{formatCurrency(revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-slate-500">Transaksi terlambat</p>
              <h3 className="mt-1 text-lg font-black text-slate-900">Prioritas tindak lanjut</h3>
            </div>

            <div className="mt-4 space-y-3">
              {overdueTransactions.length === 0 ? (
                <p className="text-sm text-slate-500">Tidak ada transaksi terlambat pada filter ini.</p>
              ) : overdueTransactions.slice(0, 4).map(tx => (
                <div key={tx.id} className="rounded-[18px] bg-red-50 border border-red-100 px-4 py-3">
                  <p className="font-bold text-slate-900">{tx.id} - {tx.customerName}</p>
                  <p className="mt-1 text-sm text-slate-600">Terlambat {getLateDays(tx)} hari - {formatCurrency(tx.lateFee || 0)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      )}

      {hasTransactions && (
      <div className={`rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm ${searchTerm ? 'hidden md:block' : ''}`}>
        <div>
          <p className="text-sm font-semibold text-slate-500">Produk paling laris</p>
          <h3 className="mt-1 text-lg font-black text-slate-900">Kostum terlaris per periode</h3>
        </div>

        <div className="mt-4 space-y-3">
          {topProductList.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada data produk dari transaksi yang difilter.</p>
          ) : topProductList.map(([name, qty]) => (
            <div key={name} className="flex items-center justify-between gap-3 rounded-[18px] bg-slate-50 px-4 py-3">
              <div>
                <p className="font-bold text-slate-900">{name}</p>
                <p className="text-sm text-slate-500">Jumlah pemesanan</p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{qty} item</span>
            </div>
          ))}
        </div>
      </div>
      )}

      <div className={`flex flex-wrap gap-3 ${searchTerm ? 'hidden md:flex' : ''}`}>
        <button onClick={handleExportExcel} disabled={isExporting !== ''} className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-[18px] bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-sm">
          {isExporting === 'excel' ? <><Cloud size={18} className="animate-pulse" /> Proses...</> : <><FileSpreadsheet size={18} /> Unduh Excel</>}
        </button>
        <button onClick={handleExportPDF} disabled={isExporting !== ''} className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-[18px] bg-rose-600 px-5 py-3 text-sm font-black text-white shadow-sm">
          {isExporting === 'pdf' ? <><Cloud size={18} className="animate-pulse" /> Proses...</> : <><FileDown size={18} /> Unduh PDF</>}
        </button>
      </div>

      {sortedTransactions.length > REPORTS_PER_PAGE && (
        <div className="flex items-center justify-between gap-3 rounded-[20px] border border-slate-200 bg-white p-3 shadow-sm">
          <button
            type="button"
            onClick={() => setReportPage(page => Math.max(1, page - 1))}
            disabled={safeReportPage === 1}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
            aria-label="Halaman laporan sebelumnya"
          >
            <ChevronLeft size={18} strokeWidth={3} />
          </button>
          <div className="min-w-0 text-center">
            <p className="text-sm font-black text-slate-900">Halaman {safeReportPage} dari {reportPageCount}</p>
            <p className="mt-1 text-xs text-slate-500">{reportStartNumber}-{reportEndNumber} transaksi ditampilkan</p>
          </div>
          <button
            type="button"
            onClick={() => setReportPage(page => Math.min(reportPageCount, page + 1))}
            disabled={safeReportPage === reportPageCount}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
            aria-label="Halaman laporan berikutnya"
          >
            <ChevronRight size={18} strokeWidth={3} />
          </button>
        </div>
      )}

      <div className="hidden md:block rounded-[28px] border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Tanggal</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">No. Nota</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Pelanggan</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Status</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Pembayaran</th>
              <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Sewa</th>
              <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Denda</th>
              <th className="p-4 text-right font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Total</th>
              <th className="p-4 text-center font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedTransactions.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-slate-500">Tidak ada transaksi di bulan {selectedMonth}.</td>
              </tr>
            ) : paginatedTransactions.map(t => {
              const grandTotal = (t.totalAmount || 0) + (t.lateFee || 0);
              return (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="p-4 text-slate-700">{formatDate(t.rentDate)}</td>
                  <td className="p-4 break-words font-black text-slate-900">{t.id}</td>
                  <td className="p-4 break-words font-bold text-slate-900">{t.customerName}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${t.status === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{getStatusLabel(t.status)}</span>
                  </td>
                  <td className="p-4">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">{t.paymentMethod || 'Tunai'}</span>
                  </td>
                  <td className="p-4 text-right font-semibold text-slate-700">{formatCurrency(t.totalAmount || 0)}</td>
                  <td className="p-4 text-right font-semibold text-red-600">{formatCurrency(t.lateFee || 0)}</td>
                  <td className="p-4 text-right font-black text-slate-900">{formatCurrency(grandTotal)}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button type="button" onClick={() => onViewReceipt(t)} className="rounded-[14px] bg-amber-50 p-2.5 text-amber-700 hover:bg-amber-700 hover:text-white"><Printer size={16} /></button>
                      <button type="button" onClick={() => openEditModal(t)} className="rounded-[14px] bg-blue-50 p-2.5 text-blue-700 hover:bg-blue-700 hover:text-white"><Edit size={16} /></button>
                      <button type="button" onClick={() => onDelete(t)} className="rounded-[14px] bg-red-50 p-2.5 text-red-700 hover:bg-red-700 hover:text-white"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4 pb-20">
        {sortedTransactions.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
            Tidak ada transaksi di bulan {selectedMonth}.
          </div>
        ) : paginatedTransactions.map(t => {
          const grandTotal = (t.totalAmount || 0) + (t.lateFee || 0);
          return (
            <div key={t.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{formatDate(t.rentDate)}</p>
                  <p className="mt-1 break-words font-black text-slate-900">{t.id}</p>
                  <p className="mt-1 break-words text-sm text-slate-600">{t.customerName}</p>
                </div>
                <span className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${t.status === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{getStatusLabel(t.status)}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Sewa</p>
                  <p className="font-black text-slate-900">{formatCurrency(t.totalAmount || 0)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Denda</p>
                  <p className="font-black text-red-600">{formatCurrency(t.lateFee || 0)}</p>
                </div>
              </div>
              <div className="mt-3 rounded-[16px] bg-slate-50 px-3 py-2 text-sm">
                <p className="text-slate-500">Pembayaran</p>
                <p className="mt-1 font-black text-slate-900">{t.paymentMethod || 'Tunai'}</p>
              </div>
              <div className="mt-4 flex justify-between items-center border-t border-slate-100 pt-4">
                <div>
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="font-black text-slate-900">{formatCurrency(grandTotal)}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => onViewReceipt(t)} className="rounded-[14px] bg-amber-50 p-2.5 text-amber-700"><Printer size={16} /></button>
                  <button type="button" onClick={() => openEditModal(t)} className="rounded-[14px] bg-blue-50 p-2.5 text-blue-700"><Edit size={16} /></button>
                  <button type="button" onClick={() => onDelete(t)} className="rounded-[14px] bg-red-50 p-2.5 text-red-700"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-blue-900 px-5 py-4 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-blue-100">Laporan</p>
                <h3 className="mt-1 text-lg font-black">Edit Transaksi</h3>
              </div>
              <button type="button" onClick={() => setEditingTrx(null)} className="rounded-full bg-blue-800 p-2 hover:bg-blue-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="max-h-[80vh] overflow-y-auto bg-slate-50 px-5 py-5 space-y-4">
              <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Nama Pelanggan</label>
                <input required value={formData.customerName} onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))} className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">No. Telepon</label>
                  <input value={formData.customerPhone} onChange={e => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))} className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
                </div>

                <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Status</label>
                  <select value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))} className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                    <option value="disewa">Disewa</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Alamat</label>
                <textarea value={formData.customerAddress} onChange={e => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))} rows="3" className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 resize-none" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Tanggal Sewa</label>
                  <input type="date" value={formData.rentDate} onChange={e => setFormData(prev => ({ ...prev, rentDate: e.target.value }))} className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
                </div>
                <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Batas Kembali</label>
                  <input type="date" value={formData.expectedReturnDate} onChange={e => setFormData(prev => ({ ...prev, expectedReturnDate: e.target.value }))} className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800" />
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Denda</label>
                <input
                  type="text"
                  value={formatNumberDot(formData.lateFee)}
                  onChange={(e) => setFormData(prev => ({ ...prev, lateFee: e.target.value.replace(/[^0-9]/g, '') }))}
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingTrx(null)} className="flex-1 rounded-[18px] border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600">Batal</button>
                <button type="submit" className="flex-1 rounded-[18px] bg-amber-500 py-3.5 text-sm font-black text-white">Simpan Data</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
