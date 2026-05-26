import { useMemo, useState } from 'react';
import {
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  X,
  Printer,
  FileSpreadsheet,
  FileDown,
  Coins,
  FileText,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  BarChart3,
  Package,
  Star
} from 'lucide-react';
import { formatCurrency, formatDate, formatNumberDot } from '../utils/format';
import { useReportData } from '../features/reports/hooks/useReportData';
import { useReportExport } from '../features/reports/hooks/useReportExport';
import { useMobileSearchRegistration } from '../components/layout/useMobileSearch';
import { getTransactionStatusLabel, isCompletedTransaction } from '../utils/transactionStatus';

const getStatusLabel = (status) => {
  return getTransactionStatusLabel(status);
};

export default function ReportsPage({
  transactions,
  products = [],
  financialRecords = [],
  onViewReceipt,
  onDelete,
  onEdit,
  onSaveCashClosing,
  onNotify,
  operatorId
}) {
  const [activeTab, setActiveTab] = useState('reports'); // reports, ledger, reconciliation, analytics

  // State Paging & Filter Khusus Buku Besar (Ledger)
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerType, setLedgerType] = useState('Semua');
  const [ledgerMethod, setLedgerMethod] = useState('Semua');
  const [ledgerDirection, setLedgerDirection] = useState('Semua');
  const [ledgerPage, setLedgerPage] = useState(1);
  const LEDGER_PER_PAGE = 25;

  const {
    activeCount,
    completedCount,
    customerCount,
    hasTransactions,
    lateFeeRatio,
    overdueCount,
    paginatedTransactions,
    paymentMethodFilter,
    paymentMixList,
    reportPageCount,
    resetFilters,
    safeReportPage,
    searchTerm,
    selectedMonth,
    setReportPage,
    sortedTransactions,
    statusFilter,
    topCustomerList,
    totalDenda,
    totalDepositDeducted,
    totalDepositHeld,
    totalDepositReturned,
    totalRevenue,
    totalSewa,
    voidCount,
    updatePaymentMethodFilter,
    updateSearchTerm,
    updateSelectedMonth,
    updateStatusFilter
  } = useReportData({ transactions });

  // ─────────────────────────────────────────────────────
  // 📦 KALKULASI ANALITIK PRODUK (TAB 4)
  // ─────────────────────────────────────────────────────
  const productAnalytics = useMemo(() => {
    // Hitung frekuensi sewa per produk dari seluruh transaksi (bukan hanya bulan ini)
    const productRentCount = {};
    const productRevenue = {};
    const productLateCount = {};

    transactions.filter(t => t.status !== 'void').forEach(t => {
      (t.items || []).forEach(item => {
        const key = item.product?.id || item.productId || item.product?.name || 'unknown';
        const name = item.product?.name || item.name || 'Tidak Dikenal';
        const qty = Number(item.qty || 1);
        const price = Number(item.product?.price || item.price || 0);

        if (!productRentCount[key]) productRentCount[key] = { name, count: 0, revenue: 0 };
        productRentCount[key].count += qty;
        productRentCount[key].revenue += price * qty;

        if ((t.lateFee || 0) > 0) {
          if (!productLateCount[key]) productLateCount[key] = { name, lateCount: 0 };
          productLateCount[key].lateCount += qty;
        }
      });
    });

    const topRented = Object.entries(productRentCount)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([id, data]) => ({ id, ...data }));

    const topRevenue = Object.entries(productRevenue)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([id, data]) => ({ id, ...data }));

    const mostLate = Object.entries(productLateCount)
      .sort((a, b) => b[1].lateCount - a[1].lateCount)
      .slice(0, 5)
      .map(([id, data]) => ({ id, ...data }));

    // Stok kritis dari data produk
    const lowStockProducts = products
      .filter(p => p.isActive !== false && p.status !== 'inactive')
      .map(p => ({
        id: p.id,
        name: p.name,
        size: p.size || '',
        category: p.category || '',
        stockAvailable: Number(p.stockAvailable ?? p.availableStock ?? p.stock ?? 0),
        stockRented: Number(p.stockRented ?? p.rentedStock ?? 0),
        stockLaundry: Number(p.stockLaundry ?? p.laundryStock ?? 0),
        stockDamaged: Number(p.stockDamaged ?? p.maintenanceStock ?? 0)
      }))
      .filter(p => p.stockAvailable <= 2)
      .sort((a, b) => a.stockAvailable - b.stockAvailable);

    // Total stok aktif keseluruhan
    const totalStockAvailable = products.reduce((sum, p) => sum + Number(p.stockAvailable ?? p.stock ?? 0), 0);
    const totalStockRented = products.reduce((sum, p) => sum + Number(p.stockRented ?? 0), 0);
    const totalStockLaundry = products.reduce((sum, p) => sum + Number(p.stockLaundry ?? p.laundryStock ?? 0), 0);
    const totalStockDamaged = products.reduce((sum, p) => sum + Number(p.stockDamaged ?? p.maintenanceStock ?? 0), 0);
    const totalProducts = products.filter(p => p.isActive !== false && p.status !== 'inactive').length;

    // Analitik kategori
    const categoryStats = {};
    transactions.filter(t => t.status !== 'void').forEach(t => {
      (t.items || []).forEach(item => {
        const cat = item.product?.category || item.category || 'Umum';
        if (!categoryStats[cat]) categoryStats[cat] = { count: 0 };
        categoryStats[cat].count += Number(item.qty || 1);
      });
    });
    const topCategories = Object.entries(categoryStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6);
    const maxCatCount = topCategories[0]?.[1]?.count || 1;

    return {
      topRented,
      topRevenue,
      mostLate,
      lowStockProducts,
      totalStockAvailable,
      totalStockRented,
      totalStockLaundry,
      totalStockDamaged,
      totalProducts,
      topCategories,
      maxCatCount
    };
  }, [transactions, products]);

  const mobileSearchConfig = useMemo(() => ({
    placeholder: activeTab === 'ledger' ? 'Cari ID nota atau keterangan...' : 'Cari nota, pelanggan, telepon',
    value: activeTab === 'ledger' ? ledgerSearch : searchTerm,
    onChange: (val) => {
      if (activeTab === 'ledger') {
        setLedgerSearch(val);
        setLedgerPage(1);
      } else {
        updateSearchTerm(val);
      }
    }
  }), [searchTerm, ledgerSearch, activeTab, updateSearchTerm]);

  useMobileSearchRegistration(mobileSearchConfig);

  // State untuk Tutup Kas Harian (Daily Cash Closing)
  const [isCashClosingOpen, setIsCashClosingOpen] = useState(false);
  const [actualCash, setActualCash] = useState('');
  const [closingNotes, setClosingNotes] = useState('');
  const [isSavingClosing, setIsSavingClosing] = useState(false);
  const [closedReceiptData, setClosedReceiptData] = useState(null);

  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // ----------------------------------------------------
  // 📊 KALKULASI REKAPITULASI TUTUP KAS HARIAN KASIR
  // ----------------------------------------------------
  const cashClosingCalculation = useMemo(() => {
    // Saring financialRecords yang dibuat hari ini
    const todayRecords = financialRecords.filter(r => {
      const recDateOnly = (r.createdAt || '').split('T')[0];
      return recDateOnly === todayStr;
    });

    const counts = {
      todayRentalsCount: transactions.filter(t => t.status !== 'void' && t.status !== 'CANCELLED' && (t.rentDate || '').split(' ')[0] === todayStr).length,
      todayReturnsCount: 0,
      rentTunai: 0, rentTransfer: 0, rentQris: 0,
      depositTunai: 0, depositTransfer: 0, depositQris: 0,
      feeTunai: 0, feeTransfer: 0, feeQris: 0,
      refundTunai: 0, refundTransfer: 0, refundQris: 0,
      totalTunaiSistem: 0, totalTransferSistem: 0, totalQrisSistem: 0,
      totalRevenueSistem: 0, totalDepositSistem: 0, totalFeeSistem: 0,
      totalRefundSistem: 0
    };

    // Hitung pengembalian unik hari ini
    const returnedTrxSet = new Set();

    todayRecords.forEach(r => {
      const method = String(r.method || 'Tunai').trim().toLowerCase();
      const isTunai = method === 'tunai' || method === 'cash';
      const isTransfer = method === 'transfer';
      const isQris = method === 'qris';
      const amount = Number(r.amount || 0);

      if (r.type === 'RENTAL_PAYMENT') {
        if (isTunai) counts.rentTunai += amount;
        else if (isTransfer) counts.rentTransfer += amount;
        else if (isQris) counts.rentQris += amount;
      } else if (r.type === 'DEPOSIT_IN') {
        if (isTunai) counts.depositTunai += amount;
        else if (isTransfer) counts.depositTransfer += amount;
        else if (isQris) counts.depositQris += amount;
      } else if (r.type === 'LATE_FEE' || r.type === 'DAMAGE_FEE' || r.type === 'LOST_FEE') {
        if (isTunai) counts.feeTunai += amount;
        else if (isTransfer) counts.feeTransfer += amount;
        else if (isQris) counts.feeQris += amount;
        if (r.transactionId) returnedTrxSet.add(r.transactionId);
      } else if (r.type === 'DEPOSIT_REFUND') {
        if (isTunai) counts.refundTunai += amount;
        else if (isTransfer) counts.refundTransfer += amount;
        else if (isQris) counts.refundQris += amount;
        if (r.transactionId) returnedTrxSet.add(r.transactionId);
      }
    });

    counts.todayReturnsCount = returnedTrxSet.size;

    counts.totalTunaiSistem = (counts.rentTunai + counts.depositTunai + counts.feeTunai) - counts.refundTunai;
    counts.totalTransferSistem = (counts.rentTransfer + counts.depositTransfer + counts.feeTransfer) - counts.refundTransfer;
    counts.totalQrisSistem = (counts.rentQris + counts.depositQris + counts.feeQris) - counts.refundQris;

    counts.totalRevenueSistem = counts.rentTunai + counts.rentTransfer + counts.rentQris;
    counts.totalDepositSistem = counts.depositTunai + counts.depositTransfer + counts.depositQris;
    counts.totalFeeSistem = counts.feeTunai + counts.feeTransfer + counts.feeQris;
    counts.totalRefundSistem = counts.refundTunai + counts.refundTransfer + counts.refundQris;

    return counts;
  }, [financialRecords, transactions, todayStr]);

  const handleCloseCashClosing = () => {
    setIsCashClosingOpen(false);
    setActualCash('');
    setClosingNotes('');
  };

  const handleSaveCashClosing = async () => {
    setIsSavingClosing(true);
    const calculatedDiscrepancy = Number(actualCash) - cashClosingCalculation.totalTunaiSistem;

    const closingPayload = {
      actualCash: Number(actualCash),
      discrepancy: calculatedDiscrepancy,
      notes: closingNotes,
      closedBy: operatorId || 'system',
      rentTunai: cashClosingCalculation.rentTunai,
      rentTransfer: cashClosingCalculation.rentTransfer,
      rentQris: cashClosingCalculation.rentQris,
      depositTunai: cashClosingCalculation.depositTunai,
      depositTransfer: cashClosingCalculation.depositTransfer,
      depositQris: cashClosingCalculation.depositQris,
      feeTunai: cashClosingCalculation.feeTunai,
      feeTransfer: cashClosingCalculation.feeTransfer,
      feeQris: cashClosingCalculation.feeQris,
      refundTunai: cashClosingCalculation.refundTunai,
      refundTransfer: cashClosingCalculation.refundTransfer,
      refundQris: cashClosingCalculation.refundQris,
      totalTunaiSistem: cashClosingCalculation.totalTunaiSistem,
      totalTransferSistem: cashClosingCalculation.totalTransferSistem,
      totalQrisSistem: cashClosingCalculation.totalQrisSistem,
      todayRentalsCount: cashClosingCalculation.todayRentalsCount,
      todayReturnsCount: cashClosingCalculation.todayReturnsCount
    };

    try {
      if (onSaveCashClosing) {
        const saved = await onSaveCashClosing(closingPayload);
        setClosedReceiptData(saved);
        handleCloseCashClosing();
      }
    } catch (err) {
      onNotify?.({
        title: 'Tutup Kas Gagal',
        message: err.message || 'Gagal menyimpan data penutupan kas harian.',
        type: 'error'
      });
    } finally {
      setIsSavingClosing(false);
    }
  };

  // ----------------------------------------------------
  // 📚 PENYARINGAN & STRUKTUR DATA BUKU BESAR (LEDGER)
  // ----------------------------------------------------
  const filteredLedgerRecords = useMemo(() => {
    return financialRecords.filter(r => {
      // 1. Filter Pencarian Teks
      const needle = ledgerSearch.toLowerCase().trim();
      const matchesSearch = !needle ||
        (r.transactionId || '').toLowerCase().includes(needle) ||
        (r.notes || '').toLowerCase().includes(needle);

      if (!matchesSearch) return false;

      // 2. Filter Tipe Jurnal
      if (ledgerType !== 'Semua' && r.type !== ledgerType) return false;

      // 3. Filter Metode Pembayaran
      if (ledgerMethod !== 'Semua') {
        const method = String(r.method || 'Tunai').trim().toLowerCase();
        const searchMethod = ledgerMethod.toLowerCase();
        if (method !== searchMethod && !(searchMethod === 'tunai' && method === 'cash')) {
          return false;
        }
      }

      // 4. Filter Arah Mutasi
      if (ledgerDirection !== 'Semua' && r.direction !== ledgerDirection) return false;

      return true;
    });
  }, [financialRecords, ledgerSearch, ledgerType, ledgerMethod, ledgerDirection]);

  const ledgerPageCount = Math.max(1, Math.ceil(filteredLedgerRecords.length / LEDGER_PER_PAGE));
  const safeLedgerPage = Math.min(ledgerPage, ledgerPageCount);
  const paginatedLedgerRecords = filteredLedgerRecords.slice(
    (safeLedgerPage - 1) * LEDGER_PER_PAGE,
    safeLedgerPage * LEDGER_PER_PAGE
  );

  const ledgerStartNumber = filteredLedgerRecords.length === 0 ? 0 : ((safeLedgerPage - 1) * LEDGER_PER_PAGE) + 1;
  const ledgerEndNumber = Math.min(safeLedgerPage * LEDGER_PER_PAGE, filteredLedgerRecords.length);

  // ----------------------------------------------------
  // 📈 METRIK DASBOR REKONSILIASI KEUANGAN OWNER
  // ----------------------------------------------------
  const financeDashboardMetrics = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    let totalRentRevenue = 0;
    let totalFeesCollected = 0;
    let totalRefundsPaid = 0;
    let totalDiscountsGiven = 0;

    financialRecords.forEach(r => {
      const amount = Number(r.amount || 0);
      const isIN = r.direction === 'IN';

      if (isIN) {
        totalIn += amount;
        if (r.type === 'RENTAL_PAYMENT') totalRentRevenue += amount;
        else if (r.type === 'LATE_FEE' || r.type === 'DAMAGE_FEE' || r.type === 'LOST_FEE') {
          totalFeesCollected += amount;
        }
      } else {
        totalOut += amount;
        if (r.type === 'DEPOSIT_REFUND') totalRefundsPaid += amount;
        else if (r.type === 'DISCOUNT') totalDiscountsGiven += amount;
      }
    });

    // Hitung jaminan deposit yang saat ini masih aktif (HELD) di tangan kasir
    const activeDeposits = transactions
      .filter(t => t.status !== 'void' && t.status !== 'CANCELLED' && t.status !== 'completed' && t.status !== 'returned')
      .reduce((sum, t) => sum + Number(t.depositAmount ?? t.deposit ?? 0), 0);

    // Hitung total piutang / sewa belum lunas (outstanding balance)
    const outstandingBalance = transactions
      .filter(t => t.status !== 'void' && t.status !== 'CANCELLED' && t.paymentStatus === 'UNPAID')
      .reduce((sum, t) => sum + Number(t.totalAmount || 0), 0);

    // Hitung Omzet Bersih Keuangan (Sewa + Denda - Diskon)
    const netRevenue = totalRentRevenue + totalFeesCollected - totalDiscountsGiven;

    return {
      netRevenue,
      activeDeposits,
      totalRefundsPaid,
      outstandingBalance,
      totalRentRevenue,
      totalFeesCollected,
      totalDiscountsGiven,
      totalIn,
      totalOut
    };
  }, [financialRecords, transactions]);

  // Card Ringkasan Laporan Sewa
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
      description: `Void dikecualikan - ${voidCount} nota void`
    },
    {
      title: 'Deposit Jaminan',
      value: formatCurrency(totalDepositHeld),
      description: `${formatCurrency(totalDepositReturned)} kembali - ${formatCurrency(totalDepositDeducted)} dipotong`
    },
    {
      title: 'Transaksi Terlambat',
      value: String(overdueCount),
      description: `${customerCount} pelanggan - ${completedCount} selesai - ${activeCount} aktif`
    }
  ];

  const [editingTrx, setEditingTrx] = useState(null);
  const [formData, setFormData] = useState({});

  const { handleExportExcel, handleExportPDF, handleExportLedgerExcel, handleExportLedgerPDF, isExporting } = useReportExport({
    filteredLedgerRecords,
    getStatusLabel,
    onNotify,
    selectedMonth,
    sortedTransactions,
    totalDenda,
    totalDepositDeducted,
    totalDepositHeld,
    totalDepositReturned,
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
    <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">

      {/* Toolbar laporan; judul utama sudah ada di AppShell */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Periode &amp; aksi</p>
          <p className="mt-1 hidden max-w-2xl text-sm font-semibold text-slate-600 md:block">
            {formatCurrency(totalRevenue)} omzet terfilter dari {sortedTransactions.length} transaksi.
          </p>
        </div>

        {/* Tombol Aksi Cepat */}
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
          <label className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-650 sm:rounded-[18px]">
            <Calendar size={14} className="text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={e => {
                updateSelectedMonth(e.target.value);
              }}
              className="border-none bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
            />
          </label>

          <button
            type="button"
            onClick={() => setIsCashClosingOpen(true)}
            className="shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-850 hover:bg-emerald-900 hover:text-white px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm min-h-[44px]"
          >
            <Coins size={14} />
            Tutup Kas Harian
          </button>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 🗂️ TAB NAVIGASI PREMIUM (EMERALD & GOLD)             */}
      {/* ---------------------------------------------------- */}
      <div className="flex border-b border-slate-200 gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${activeTab === 'reports' ? 'bg-emerald-800 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
        >
          <FileText size={14} /> Laporan Sewa Adat
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${activeTab === 'ledger' ? 'bg-emerald-800 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
        >
          <BookOpen size={14} /> Buku Besar Keuangan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reconciliation')}
          className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${activeTab === 'reconciliation' ? 'bg-emerald-800 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
        >
          <TrendingUp size={14} /> Dasbor Rekonsiliasi
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${activeTab === 'analytics' ? 'bg-amber-700 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
        >
          <BarChart3 size={14} /> Analitik Produk
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 📑 KONTEN TAB 1: LAPORAN SEWA ADAT                   */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'reports' && (
        <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-200">

          {/* Bar Pencarian & Filter */}
          <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:tracking-[0.18em]">Pencarian &amp; Filter</p>
                <p className="mt-0.5 text-xs text-slate-500 font-semibold">Gunakan filter status dan pencarian untuk merekap nota sewa kostum.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => updateStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-500"
                >
                  <option value="Semua">Semua Status</option>
                  <option value="rented">Disewa</option>
                  <option value="partially_returned">Sebagian Kembali</option>
                  <option value="returned">Selesai</option>
                  <option value="void">Void (Batal)</option>
                </select>

                <select
                  value={paymentMethodFilter}
                  onChange={(e) => updatePaymentMethodFilter(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-500"
                >
                  <option value="Semua">Semua Pembayaran</option>
                  <option value="Tunai">Tunai (Cash)</option>
                  <option value="Transfer">Transfer Bank</option>
                  <option value="QRIS">QRIS</option>
                </select>

                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Input Pencarian */}
            <div className="mt-3 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => updateSearchTerm(e.target.value)}
                placeholder="Cari ID nota, nama pelanggan, telepon..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-700 focus:border-emerald-450 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Kartu Ringkasan Metrik */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-5">
            {summaryCards.map((card, index) => (
              <div key={card.title} className={`rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm ${index === 4 ? 'col-span-2 md:col-span-1' : ''}`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{card.title}</p>
                <p className="mt-2 break-words text-sm font-bold text-slate-900 sm:text-base">{card.value}</p>
                <p className="mt-1 text-[10px] text-slate-500 font-semibold leading-normal">{card.description}</p>
              </div>
            ))}
          </div>

          {!hasTransactions ? (
            <div className="rounded-[20px] border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm text-xs font-semibold">
              Belum ada transaksi sewa kostum pada periode bulan ini.
            </div>
          ) : (
            <>
              {/* Komposisi Metode & Pelanggan Terlaris */}
              <div className="grid gap-3 sm:gap-4 xl:grid-cols-[1.1fr_0.9fr]">
                {/* Metode Pembayaran */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div>
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Komposisi Pembayaran</p>
                    <h3 className="mt-0.5 text-sm font-bold text-slate-800">Metode Transaksi Sewa</h3>
                  </div>

                  <div className="mt-3 space-y-3.5">
                    {paymentMixList.map(([method, data]) => (
                      <div key={method} className="text-xs font-semibold">
                        <div className="flex justify-between text-slate-700">
                          <span>{method}</span>
                          <span>{data.count} Transaksi - {formatCurrency(data.revenue)}</span>
                        </div>
                        <div className="metric-bar mt-2">
                          <span style={{ width: `${Math.max(12, (data.count / Math.max(...paymentMixList.map(([, item]) => item.count), 1)) * 100)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pelanggan & Keterlambatan */}
                <div className="grid gap-3 sm:gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Pelanggan Teraktif</p>
                    <h3 className="mt-0.5 text-sm font-bold text-slate-800">Pelanggan Teratas Periode Bulan Ini</h3>

                    <div className="mt-3 space-y-2.5">
                      {topCustomerList.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">Tidak ada kontribusi belanja.</p>
                      ) : topCustomerList.map(([name, revenue]) => (
                        <div key={name} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                          <div>
                            <p className="font-bold text-slate-900">{name}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">Total Kontribusi Belanja</p>
                          </div>
                          <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700">{formatCurrency(revenue)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ekspor Laporan */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  disabled={isExporting !== ''}
                  className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 flex items-center gap-1.5 transition"
                >
                  <FileSpreadsheet size={14} /> Unduh Excel
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  disabled={isExporting !== ''}
                  className="rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 flex items-center gap-1.5 transition"
                >
                  <FileDown size={14} /> Unduh PDF
                </button>
              </div>

              {/* Tabel Transaksi Desktop */}
              <div className="hidden md:block rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs font-semibold text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-slate-500 uppercase tracking-widest text-[9px]">
                      <th className="p-3.5">Tanggal Sewa</th>
                      <th className="p-3.5">No. Nota</th>
                      <th className="p-3.5">Pelanggan</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Pembayaran</th>
                      <th className="p-3.5 text-right">Sewa Bersih</th>
                      <th className="p-3.5 text-right">Denda</th>
                      <th className="p-3.5 text-right">Total Transaksi</th>
                      <th className="p-3.5 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {paginatedTransactions.map(t => {
                      const isVoid = t.status === 'void';
                      const rentRevenue = isVoid ? 0 : (t.totalAmount || 0) - Number(t.depositAmount ?? t.deposit ?? 0);
                      const fineRevenue = isVoid ? 0 : t.lateFee || 0;
                      const grandTotalVal = isVoid ? 0 : t.totalAmount || 0;
                      return (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="p-3.5 text-slate-500">{formatDate(t.rentDate)}</td>
                          <td className="p-3.5 font-bold text-slate-900">{t.id}</td>
                          <td className="p-3.5 font-bold text-slate-900">{t.customerName}</td>
                          <td className="p-3.5">
                            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${isCompletedTransaction(t) ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : t.status === 'void' ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>{getStatusLabel(t.status)}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="rounded-full bg-slate-50 border border-slate-100 px-2 py-0.5 text-[9px] text-slate-650">{t.paymentMethod || 'Tunai'}</span>
                          </td>
                          <td className="p-3.5 text-right text-slate-800">{formatCurrency(rentRevenue)}</td>
                          <td className="p-3.5 text-right text-red-650 font-bold">{formatCurrency(fineRevenue)}</td>
                          <td className="p-3.5 text-right font-bold text-slate-900">{formatCurrency(grandTotalVal)}</td>
                          <td className="p-3.5">
                            <div className="flex justify-center gap-1.5">
                              <button type="button" onClick={() => onViewReceipt(t)} className="rounded-lg bg-amber-50 p-2 text-amber-700 hover:bg-amber-700 hover:text-white" aria-label="Cetak struk sewa"><Printer size={12} /></button>
                              <button type="button" onClick={() => openEditModal(t)} className="rounded-lg bg-blue-50 p-2 text-blue-700 hover:bg-blue-700 hover:text-white" aria-label="Edit sewa"><Edit size={12} /></button>
                              <button type="button" onClick={() => onDelete(t)} className="rounded-lg bg-red-50 p-2 text-red-700 hover:bg-red-700 hover:text-white" aria-label="Void transaksi sewa"><Trash2 size={12} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Transaksi Mobile View */}
              <div className="md:hidden space-y-2.5 pb-20">
                {paginatedTransactions.map(t => {
                  const isVoid = t.status === 'void';
                  const rentRevenue = isVoid ? 0 : (t.totalAmount || 0) - Number(t.depositAmount ?? t.deposit ?? 0);
                  const fineRevenue = isVoid ? 0 : t.lateFee || 0;
                  const grandTotalVal = isVoid ? 0 : t.totalAmount || 0;
                  return (
                    <div key={t.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400">{formatDate(t.rentDate)}</p>
                          <p className="mt-0.5 font-bold text-slate-900">{t.id}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">{t.customerName}</p>
                        </div>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${isCompletedTransaction(t) ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>{getStatusLabel(t.status)}</span>
                      </div>
                      <div className="mt-2.5 grid grid-cols-2 gap-1.5 font-semibold text-slate-700 border-t pt-2 border-slate-100">
                        <div>Sewa Bersih: <span className="font-bold text-slate-900">{formatCurrency(rentRevenue)}</span></div>
                        <div>Denda: <span className="font-bold text-red-600">{formatCurrency(fineRevenue)}</span></div>
                        <div>Metode: <span className="font-bold text-slate-900">{t.paymentMethod || 'Tunai'}</span></div>
                        <div>Total: <span className="font-bold text-slate-900">{formatCurrency(grandTotalVal)}</span></div>
                      </div>
                      <div className="mt-3 flex justify-end gap-1.5">
                        <button type="button" onClick={() => onViewReceipt(t)} className="rounded-lg bg-amber-50 p-2 text-amber-700" aria-label="Cetak struk sewa mobile"><Printer size={12} /></button>
                        <button type="button" onClick={() => openEditModal(t)} className="rounded-lg bg-blue-50 p-2 text-blue-700" aria-label="Edit sewa mobile"><Edit size={12} /></button>
                        <button type="button" onClick={() => onDelete(t)} className="rounded-lg bg-red-50 p-2 text-red-700" aria-label="Void transaksi sewa mobile"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paging Laporan */}
              {reportPageCount > 1 && (
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setReportPage(page => Math.max(1, page - 1))}
                    disabled={safeReportPage === 1}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white disabled:opacity-40"
                    aria-label="Halaman sewa sebelumnya"
                  >
                    <ChevronLeft size={14} strokeWidth={3} />
                  </button>
                  <p className="text-slate-800">Halaman {safeReportPage} dari {reportPageCount}</p>
                  <button
                    type="button"
                    onClick={() => setReportPage(page => Math.min(reportPageCount, page + 1))}
                    disabled={safeReportPage === reportPageCount}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white disabled:opacity-40"
                    aria-label="Halaman sewa berikutnya"
                  >
                    <ChevronRight size={14} strokeWidth={3} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 📑 KONTEN TAB 2: BUKU BESAR KEUANGAN (LEDGER)        */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'ledger' && (
        <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-200">

          {/* Panel Pencarian & Filter Jurnal */}
          <div className="rounded-[20px] border border-slate-200 bg-white px-4 py-3 shadow-sm text-xs">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:tracking-[0.18em]">Filter Jurnal Kas</p>
                <h3 className="mt-0.5 text-xs font-bold text-slate-500">Menganalisis pergerakan kas masuk dan keluar di buku besar</h3>
              </div>

              <div className="flex flex-wrap gap-2 font-bold">
                <select
                  value={ledgerType}
                  onChange={(e) => { setLedgerType(e.target.value); setLedgerPage(1); }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 focus:border-emerald-500"
                >
                  <option value="Semua">Semua Jenis Jurnal</option>
                  <option value="RENTAL_PAYMENT">Uang Sewa (Rental Payment)</option>
                  <option value="DEPOSIT_IN">Jaminan Deposit Masuk (Deposit In)</option>
                  <option value="DEPOSIT_REFUND">Deposit Refund Keluar (Refund)</option>
                  <option value="DEPOSIT_DEDUCTION">Potongan Deposit Denda (Deduction)</option>
                  <option value="LATE_FEE">Denda Terlambat (Late Fee)</option>
                  <option value="DAMAGE_FEE">Biaya Kerusakan (Damage Fee)</option>
                  <option value="LOST_FEE">Biaya Kehilangan (Lost Fee)</option>
                  <option value="DISCOUNT">Potongan Diskon (Discount)</option>
                  <option value="MANUAL_ADJUSTMENT">Pemberes/Void (Adjustment)</option>
                </select>

                <select
                  value={ledgerMethod}
                  onChange={(e) => { setLedgerMethod(e.target.value); setLedgerPage(1); }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 focus:border-emerald-500"
                >
                  <option value="Semua">Semua Metode Bayar</option>
                  <option value="Tunai">Tunai (Cash)</option>
                  <option value="Transfer">Transfer Bank</option>
                  <option value="QRIS">QRIS Digital</option>
                </select>

                <select
                  value={ledgerDirection}
                  onChange={(e) => { setLedgerDirection(e.target.value); setLedgerPage(1); }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-700 focus:border-emerald-500"
                >
                  <option value="Semua">Semua Arah Kas</option>
                  <option value="IN">Kas Masuk (IN)</option>
                  <option value="OUT">Kas Keluar (OUT)</option>
                </select>
              </div>
            </div>

            {/* Input Pencarian Ledger */}
            <div className="mt-3 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={ledgerSearch}
                onChange={(e) => { setLedgerSearch(e.target.value); setLedgerPage(1); }}
                placeholder="Cari ID nota transaksi sewa atau catatan keuangan..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-700 focus:border-emerald-450 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>

          {/* Buku Besar View Status + Tombol Export */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm text-xs font-bold flex flex-wrap justify-between items-center gap-3">
            <span className="rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1 text-emerald-800">
              Menampilkan {ledgerStartNumber}-{ledgerEndNumber} dari {filteredLedgerRecords.length} entri kas ter-filter
            </span>
            <div className="flex flex-wrap gap-2 items-center">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">IN: {formatCurrency(financeDashboardMetrics.totalIn)}</span>
              <span className="rounded-full bg-red-50 text-red-700 border border-red-100 px-3 py-1">OUT: {formatCurrency(financeDashboardMetrics.totalOut)}</span>
              <button
                type="button"
                onClick={handleExportLedgerExcel}
                disabled={isExporting !== '' || filteredLedgerRecords.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Unduh Buku Besar ke Excel"
              >
                <FileSpreadsheet size={13} />
                {isExporting === 'ledger-excel' ? 'Mengunduh...' : 'Excel'}
              </button>
              <button
                type="button"
                onClick={handleExportLedgerPDF}
                disabled={isExporting !== '' || filteredLedgerRecords.length === 0}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                title="Unduh Buku Besar ke PDF"
              >
                <FileDown size={13} />
                {isExporting === 'ledger-pdf' ? 'Mengunduh...' : 'PDF'}
              </button>
            </div>
          </div>

          {/* Tabel Buku Besar */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs font-semibold text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-slate-500 uppercase tracking-widest text-[9px]">
                  <th className="p-3.5">Tanggal Mutasi</th>
                  <th className="p-3.5">ID Jurnal Keuangan</th>
                  <th className="p-3.5">Nota Sewa</th>
                  <th className="p-3.5">Tipe Records</th>
                  <th className="p-3.5">Metode</th>
                  <th className="p-3.5">Arah</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Keterangan</th>
                  <th className="p-3.5 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedLedgerRecords.map(r => {
                  const isIN = r.direction === 'IN';
                  return (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-3.5 text-slate-500">{r.createdAt ? formatDate(r.createdAt) : '-'}</td>
                      <td className="p-3.5 text-slate-500 font-mono text-[10px] font-bold">{r.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{r.transactionId || '-'}</td>
                      <td className="p-3.5">
                        <span className="rounded-lg bg-slate-50 border border-slate-150 px-2 py-0.5 text-[9px] font-bold text-slate-650">{r.type}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[9px] font-bold capitalize text-slate-700">{r.method || 'Tunai'}</span>
                      </td>
                      <td className="p-3.5">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold ${isIN ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                          {isIN ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {r.direction}
                        </span>
                      </td>
                      <td className="p-3.5 capitalize text-slate-500">{r.category || 'rental'}</td>
                      <td className="p-3.5 break-words max-w-[200px] text-slate-600 text-[11px] leading-relaxed">{r.notes || '-'}</td>
                      <td className={`p-3.5 text-right font-bold text-xs ${isIN ? 'text-slate-800' : 'text-red-600'}`}>
                        {isIN ? '' : '-'}{formatCurrency(r.amount)}
                      </td>
                    </tr>
                  );
                })}
                {filteredLedgerRecords.length === 0 && (
                  <tr>
                    <td colSpan="9" className="p-8 text-center text-slate-500">Tidak ada jurnal keuangan yang ter-filter.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paging Buku Besar */}
          {ledgerPageCount > 1 && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm text-xs font-bold">
              <button
                type="button"
                onClick={() => setLedgerPage(page => Math.max(1, page - 1))}
                disabled={safeLedgerPage === 1}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white disabled:opacity-40"
                aria-label="Halaman buku besar sebelumnya"
              >
                <ChevronLeft size={14} strokeWidth={3} />
              </button>
              <p className="text-slate-800">Halaman {safeLedgerPage} dari {ledgerPageCount}</p>
              <button
                type="button"
                onClick={() => setLedgerPage(page => Math.min(ledgerPageCount, page + 1))}
                disabled={safeLedgerPage === ledgerPageCount}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white disabled:opacity-40"
                aria-label="Halaman buku besar berikutnya"
              >
                <ChevronRight size={14} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 📑 KONTEN TAB 3: DASBOR REKONSILIASI OWNER           */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-4 animate-in fade-in duration-200">

          {/* Visual KPI Rekon Pemilik */}
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-slate-50 group-hover:text-emerald-50/50 transition"><TrendingUp size={45} /></div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Omzet Bersih</p>
              <p className="mt-2 text-base font-bold text-emerald-800">{formatCurrency(financeDashboardMetrics.netRevenue)}</p>
              <span className="text-[9px] font-semibold text-slate-500 block mt-1">Total sewa + denda - diskon</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-slate-50 group-hover:text-amber-50/50 transition"><Coins size={45} /></div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Deposit Aktif (HELD)</p>
              <p className="mt-2 text-base font-bold text-amber-800">{formatCurrency(financeDashboardMetrics.activeDeposits)}</p>
              <span className="text-[9px] font-semibold text-slate-500 block mt-1">Uang deposit di tangan laci kasir</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-slate-50 group-hover:text-red-50/50 transition"><ArrowDownRight size={45} /></div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Deposit Refund Terbayar</p>
              <p className="mt-2 text-base font-bold text-red-750">{formatCurrency(financeDashboardMetrics.totalRefundsPaid)}</p>
              <span className="text-[9px] font-semibold text-slate-500 block mt-1">Jaminan deposit sudah dikembalikan</span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 text-slate-50 group-hover:text-blue-50/50 transition"><FileText size={45} /></div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Outstanding Piutang</p>
              <p className="mt-2 text-base font-bold text-blue-800">{formatCurrency(financeDashboardMetrics.outstandingBalance)}</p>
              <span className="text-[9px] font-semibold text-slate-500 block mt-1">Sewa aktif belum dilunasi</span>
            </div>
          </div>

          {/* Rincian Komposisi Buku Besar */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Analisis Arus Kas Masuk (IN)</p>
                <h4 className="mt-0.5 text-xs text-slate-500 font-bold">Rincian seluruh uang masuk ke sanggar</h4>
              </div>
              <div className="space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex justify-between border-b pb-1"><span>Uang Sewa Kostum (Gross):</span><span className="font-bold text-slate-900">{formatCurrency(financeDashboardMetrics.totalRentRevenue)}</span></div>
                <div className="flex justify-between border-b pb-1"><span>Koleksi Denda &amp; Biaya:</span><span className="font-bold text-slate-900">{formatCurrency(financeDashboardMetrics.totalFeesCollected)}</span></div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 text-sm"><span>Total Arus Masuk (Gross):</span><span>{formatCurrency(financeDashboardMetrics.totalIn)}</span></div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
              <div>
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Analisis Arus Kas Keluar (OUT)</p>
                <h4 className="mt-0.5 text-xs text-slate-500 font-bold">Rincian seluruh pengeluaran/potongan kas</h4>
              </div>
              <div className="space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex justify-between border-b pb-1"><span>Jaminan Deposit Dikembalikan:</span><span className="font-bold text-slate-900">{formatCurrency(financeDashboardMetrics.totalRefundsPaid)}</span></div>
                <div className="flex justify-between border-b pb-1"><span>Dukungan Diskon Pelanggan:</span><span className="font-bold text-red-650">{formatCurrency(financeDashboardMetrics.totalDiscountsGiven)}</span></div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 text-sm"><span>Total Arus Keluar:</span><span>{formatCurrency(financeDashboardMetrics.totalOut)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 📦 KONTEN TAB 4: ANALITIK PRODUK                     */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'analytics' && (
        <div className="space-y-4 animate-in fade-in duration-200">

          {/* KPI Stok Ringkasan */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total Produk Aktif</p>
              <p className="mt-2 text-base font-bold text-slate-900 sm:text-lg">{productAnalytics.totalProducts} Jenis</p>
              <span className="text-[9px] font-semibold text-slate-500 block mt-1">Kostum tersedia di katalog</span>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">Stok Tersedia</p>
              <p className="mt-2 text-base font-bold text-emerald-800 sm:text-lg">{productAnalytics.totalStockAvailable} Unit</p>
              <span className="text-[9px] font-semibold text-emerald-600 block mt-1">Siap disewakan hari ini</span>
            </div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700">Sedang Disewa</p>
              <p className="mt-2 text-base font-bold text-amber-800 sm:text-lg">{productAnalytics.totalStockRented} Unit</p>
              <span className="text-[9px] font-semibold text-amber-600 block mt-1">Di tangan penyewa aktif</span>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Laundry + Perbaikan</p>
              <p className="mt-2 text-base font-bold text-slate-700 sm:text-lg">
                {productAnalytics.totalStockLaundry + productAnalytics.totalStockDamaged} Unit
              </p>
              <span className="text-[9px] font-semibold text-slate-500 block mt-1">
                {productAnalytics.totalStockLaundry} cuci · {productAnalytics.totalStockDamaged} perbaikan
              </span>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            {/* Produk Terlaris */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">Produk Terlaris</p>
                  <h3 className="mt-0.5 text-sm font-bold text-slate-800">Frekuensi Sewa (Semua Waktu)</h3>
                </div>
                <span className="bg-amber-50 border border-amber-100 text-amber-700 text-[9px] font-semibold px-2 py-0.5 rounded-full">
                  Top {productAnalytics.topRented.length}
                </span>
              </div>
              <div className="space-y-2.5">
                {productAnalytics.topRented.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 font-semibold italic">Belum ada data transaksi sewa tercatat.</p>
                ) : productAnalytics.topRented.map((item, idx) => {
                  const maxCount = productAnalytics.topRented[0]?.count || 1;
                  const pct = Math.max(8, (item.count / maxCount) * 100);
                  return (
                    <div key={item.id} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span className="truncate flex items-center gap-1.5">
                          {idx === 0 && <Star size={12} className="text-amber-500 shrink-0" fill="currentColor" />}
                          <span className="text-[10px] font-bold text-slate-400 w-4 shrink-0">#{idx + 1}</span>
                          {item.name}
                        </span>
                        <span className="shrink-0 text-amber-700 bg-amber-50 rounded-full px-2 py-0.5 text-[10px]">{item.count}× sewa</span>
                      </div>
                      <div className="metric-bar">
                        <span style={{ width: `${pct}%` }} className="bg-amber-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Panel kanan: Kategori + Stok Kritis */}
            <div className="space-y-4">
              {/* Analitik Kategori */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                <div>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Analitik Kategori</p>
                  <h4 className="mt-0.5 text-xs font-bold text-slate-500">Kategori kostum paling banyak disewa</h4>
                </div>
                <div className="space-y-2">
                  {productAnalytics.topCategories.length === 0 ? (
                    <p className="text-xs text-slate-400 font-semibold italic">Belum ada data kategori.</p>
                  ) : productAnalytics.topCategories.map(([cat, data]) => {
                    const pct = Math.max(8, (data.count / productAnalytics.maxCatCount) * 100);
                    return (
                      <div key={cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-700">
                          <span className="capitalize">{cat}</span>
                          <span className="text-emerald-700">{data.count}× unit</span>
                        </div>
                        <div className="metric-bar">
                          <span style={{ width: `${pct}%` }} className="bg-emerald-600" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Produk Sering Terlambat */}
              {productAnalytics.mostLate.length > 0 && (
                <div className="rounded-2xl border border-red-100 bg-red-50/30 p-4 shadow-sm space-y-3">
                  <div>
                    <p className="text-xs font-bold text-red-700 uppercase tracking-widest">⚠ Sering Terlambat</p>
                    <h4 className="mt-0.5 text-xs font-bold text-slate-500">Kostum terkait transaksi terlambat</h4>
                  </div>
                  <div className="space-y-1.5">
                    {productAnalytics.mostLate.map(item => (
                      <div key={item.id} className="flex justify-between items-center bg-white rounded-xl border border-red-100 px-3 py-2 text-xs font-bold">
                        <span className="text-slate-800 truncate">{item.name}</span>
                        <span className="shrink-0 text-red-700 bg-red-50 rounded-full px-2 py-0.5 text-[10px] ml-2">{item.lateCount}× terlambat</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Peringatan Stok Kritis */}
          {productAnalytics.lowStockProducts.length > 0 && (
            <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-red-700 uppercase tracking-widest">Peringatan Stok Kritis</p>
                  <h3 className="mt-0.5 text-sm font-bold text-slate-800">Kostum dengan stok tersedia ≤ 2 unit</h3>
                </div>
                <span className="bg-red-100 text-red-700 border border-red-200 text-[9px] font-semibold px-2.5 py-1 rounded-full">
                  {productAnalytics.lowStockProducts.length} Produk
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {productAnalytics.lowStockProducts.map(p => (
                  <div key={p.id} className="rounded-xl border border-red-100 bg-red-50/40 p-3 text-xs font-bold flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
                      <Package size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-slate-900 truncate">{p.name}{p.size ? ` (${p.size})` : ''}</p>
                      <p className="text-red-600 mt-0.5">Tersedia: {p.stockAvailable} · Disewa: {p.stockRented}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 🛠️ MODAL DIALOG TUTUP KAS HARIAN KASIR                */}
      {/* ---------------------------------------------------- */}
      {isCashClosingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl overflow-hidden rounded-[28px] bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between bg-emerald-900 px-6 py-4.5 text-white shrink-0 relative">
              <div className="absolute inset-0 bg-tenun opacity-[0.045] pointer-events-none" />
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-400">Keuangan &amp; Rekonsiliasi</p>
                <h3 className="mt-1 text-sm font-black text-gold-100 flex items-center gap-2"><Coins size={16} /> Tutup Kas Harian Laci</h3>
              </div>
              <button type="button" onClick={handleCloseCashClosing} className="rounded-full bg-emerald-800 p-2 hover:bg-emerald-700 transition text-white min-h-[32px] relative" aria-label="Tutup popup kas">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto bg-slate-50 px-6 py-5 space-y-5 flex-1 text-xs">

              <div className="flex justify-between bg-white border border-slate-100 p-3 rounded-xl shadow-sm font-bold">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400">Tanggal Rekap</span>
                  <p className="text-slate-800 mt-0.5">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400">Kasir Aktif</span>
                  <p className="text-emerald-850 mt-0.5 capitalize">{operatorId}</p>
                </div>
              </div>

              {/* Rincian Kas Sistem */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Arus Kas Masuk Hari Ini (Sistem)</h4>
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 font-bold">
                  <div className="rounded-xl border border-slate-150 bg-white p-3 shadow-sm">
                    <p className="text-slate-400 text-[8px] uppercase tracking-wider">Tunai di Laci</p>
                    <p className="text-sm font-black text-slate-900 mt-1">{formatCurrency(cashClosingCalculation.totalTunaiSistem)}</p>
                    <div className="text-[9px] text-slate-500 font-semibold mt-1 space-y-0.5 border-t pt-1 border-slate-100">
                      <p>Sewa: {formatCurrency(cashClosingCalculation.rentTunai)}</p>
                      <p>Dep In: {formatCurrency(cashClosingCalculation.depositTunai)}</p>
                      <p>Denda: {formatCurrency(cashClosingCalculation.feeTunai)}</p>
                      <p className="text-red-500">Refund: -{formatCurrency(cashClosingCalculation.refundTunai)}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-150 bg-white p-3 shadow-sm">
                    <p className="text-slate-400 text-[8px] uppercase tracking-wider">Transfer Bank</p>
                    <p className="text-sm font-black text-slate-900 mt-1">{formatCurrency(cashClosingCalculation.totalTransferSistem)}</p>
                    <div className="text-[9px] text-slate-500 font-semibold mt-1 space-y-0.5 border-t pt-1 border-slate-100">
                      <p>Sewa: {formatCurrency(cashClosingCalculation.rentTransfer)}</p>
                      <p>Dep In: {formatCurrency(cashClosingCalculation.depositTransfer)}</p>
                      <p>Denda: {formatCurrency(cashClosingCalculation.feeTransfer)}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-150 bg-white p-3 shadow-sm">
                    <p className="text-slate-400 text-[8px] uppercase tracking-wider">QRIS Digital</p>
                    <p className="text-sm font-black text-slate-900 mt-1">{formatCurrency(cashClosingCalculation.totalQrisSistem)}</p>
                    <div className="text-[9px] text-slate-500 font-semibold mt-1 space-y-0.5 border-t pt-1 border-slate-100">
                      <p>Sewa: {formatCurrency(cashClosingCalculation.rentQris)}</p>
                      <p>Dep In: {formatCurrency(cashClosingCalculation.depositQris)}</p>
                      <p>Denda: {formatCurrency(cashClosingCalculation.feeQris)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rincian Operasional */}
              <div className="bg-white border border-slate-100 p-3.5 rounded-xl shadow-sm grid grid-cols-2 gap-3 font-semibold">
                <div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Volume Transaksi</p>
                  <p className="text-slate-800 mt-1 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600 inline-block" />
                    {cashClosingCalculation.todayRentalsCount} Sewa Baru
                  </p>
                  <p className="text-slate-800 mt-0.5 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                    {cashClosingCalculation.todayReturnsCount} Pengembalian
                  </p>
                </div>
                <div className="border-l border-slate-100 pl-3">
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Mutasi Deposit Hari Ini</p>
                  <p className="text-slate-800 mt-1">Deposit Masuk: <span className="font-bold text-slate-950">{formatCurrency(cashClosingCalculation.totalDepositSistem)}</span></p>
                  <p className="text-slate-800 mt-0.5">Deposit Refund: <span className="font-bold text-red-650">-{formatCurrency(cashClosingCalculation.totalRefundSistem)}</span></p>
                </div>
              </div>

              {/* Rekonsiliasi Kas */}
              <div className="rounded-[20px] bg-white p-4.5 border border-slate-150 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-800">Formulir Rekonsiliasi Kas Laci</h4>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Uang Kas Fisik Aktual (Tunai di Laci)</label>
                  <div className="relative font-bold">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">Rp</span>
                    <input
                      type="text"
                      required
                      value={formatNumberDot(actualCash)}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setActualCash(val);
                      }}
                      placeholder="Masukkan total uang kertas & koin..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 font-black text-slate-800 focus:border-emerald-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                    Hitung seluruh uang kertas dan koin fisik yang ada di dalam laci kasir saat ini secara teliti.
                  </p>
                </div>

                {/* Selisih */}
                {actualCash !== '' && (
                  <div className={`p-3 rounded-xl border flex items-center justify-between font-bold ${Number(actualCash) - cashClosingCalculation.totalTunaiSistem === 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-wider opacity-85">Selisih Kas Aktual vs Sistem</p>
                      <p className="text-sm font-black mt-0.5">
                        {formatCurrency(Number(actualCash) - cashClosingCalculation.totalTunaiSistem)}
                      </p>
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-black">
                      {Number(actualCash) - cashClosingCalculation.totalTunaiSistem === 0 ? 'Cocok (Balanced)' : 'Ada Selisih Kas'}
                    </span>
                  </div>
                )}

                {/* Catatan Kasir */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1">Catatan Penutupan Kas</label>
                  <textarea
                    value={closingNotes}
                    onChange={(e) => setClosingNotes(e.target.value)}
                    required={actualCash !== '' && Number(actualCash) - cashClosingCalculation.totalTunaiSistem !== 0}
                    placeholder="Tuliskan alasan selisih kas fisik jika ada, atau info penting operasional kasir hari ini..."
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-800 resize-none focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 px-6 py-3 bg-slate-100 border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={handleCloseCashClosing}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 font-bold text-slate-650 hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveCashClosing}
                disabled={isSavingClosing || actualCash === '' || (Number(actualCash) - cashClosingCalculation.totalTunaiSistem !== 0 && !closingNotes.trim())}
                className="flex-1 rounded-xl bg-emerald-800 hover:bg-emerald-950 disabled:bg-slate-200 disabled:text-slate-450 py-2.5 font-bold text-white shadow-md flex items-center justify-center gap-1.5 transition"
              >
                {isSavingClosing ? 'Menyimpan...' : 'Simpan & Tutup Kas'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 🧾 STRUK THERMAL PREVIEW (DAILY RECIEPT PREVIEW)     */}
      {/* ---------------------------------------------------- */}
      {closedReceiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-md my-8 overflow-hidden rounded-[28px] bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
            <div className="flex items-center justify-between bg-emerald-950 px-6 py-4 text-white shrink-0 relative">
              <div className="absolute inset-0 bg-tenun opacity-[0.045] pointer-events-none" />
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold-400">Tutup Kas Berhasil</p>
                <h3 className="mt-0.5 text-sm font-black text-gold-100 flex items-center gap-1.5"><Printer size={16} /> Struk Rekap Harian</h3>
              </div>
              <button type="button" onClick={() => setClosedReceiptData(null)} className="rounded-full bg-emerald-800 p-1.5 hover:bg-emerald-700 transition text-white">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 bg-slate-100 flex-1 flex justify-center overflow-y-auto">
              <div id="thermal-receipt" className="w-[280px] bg-white p-4 border border-slate-200 shadow-sm font-mono text-[10px] leading-relaxed text-black select-none relative">
                <div className="w-full text-center text-slate-400 mb-3 select-none tracking-widest text-[8px]">- - - - - - - - - - - - - - - - -</div>

                <div className="text-center font-black text-[11px] uppercase tracking-wider text-slate-900">SANGGAR SENI 3 BERLIAN</div>
                <div className="text-center font-semibold text-[8px] uppercase tracking-widest text-slate-500 mt-0.5">S O D A R A  P O S</div>

                <div className="border-b border-dashed border-slate-350 my-2" />

                <div className="space-y-0.5 text-slate-700">
                  <div className="flex justify-between"><span>No. Tutup:</span><span className="font-bold">{closedReceiptData.id}</span></div>
                  <div className="flex justify-between"><span>Tanggal:</span><span>{new Date(closedReceiptData.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
                  <div className="flex justify-between"><span>Kasir:</span><span className="capitalize font-bold">{closedReceiptData.closedBy}</span></div>
                </div>

                <div className="border-b border-dashed border-slate-350 my-2" />

                <div className="space-y-1 text-slate-800">
                  <div className="font-bold text-slate-950">1. SEWA &amp; DEPOSIT</div>
                  <div className="flex justify-between pl-2"><span>Sewa Tunai:</span><span>{formatCurrency(closedReceiptData.rentTunai || 0)}</span></div>
                  <div className="flex justify-between pl-2"><span>Sewa Transfer:</span><span>{formatCurrency(closedReceiptData.rentTransfer || 0)}</span></div>
                  <div className="flex justify-between pl-2"><span>Sewa QRIS:</span><span>{formatCurrency(closedReceiptData.rentQris || 0)}</span></div>
                  <div className="flex justify-between pl-2"><span>Deposit Tunai:</span><span>{formatCurrency(closedReceiptData.depositTunai || 0)}</span></div>

                  <div className="font-bold text-slate-950 mt-1.5">2. DENDA &amp; BIAYA KONDISI</div>
                  <div className="flex justify-between pl-2"><span>Denda Tunai:</span><span>{formatCurrency(closedReceiptData.feeTunai || 0)}</span></div>
                  <div className="flex justify-between pl-2"><span>Denda Non-Tunai:</span><span>{formatCurrency((closedReceiptData.feeTransfer || 0) + (closedReceiptData.feeQris || 0))}</span></div>

                  <div className="font-bold text-slate-950 mt-1.5">3. REFUND DEPOSIT KELUAR</div>
                  <div className="flex justify-between pl-2 text-red-600"><span>Refund Tunai:</span><span>-{formatCurrency(closedReceiptData.refundTunai || 0)}</span></div>
                  <div className="flex justify-between pl-2 text-red-600"><span>Refund Non-Tunai:</span><span>-{formatCurrency((closedReceiptData.refundTransfer || 0) + (closedReceiptData.refundQris || 0))}</span></div>
                </div>

                <div className="border-b border-dashed border-slate-350 my-2" />

                <div className="space-y-0.5 text-slate-900 font-bold">
                  <div className="flex justify-between text-[11px]"><span>TOTAL TUNAI SISTEM:</span><span>{formatCurrency(closedReceiptData.totalTunaiSistem || 0)}</span></div>
                  <div className="flex justify-between text-slate-500"><span>Total Transfer:</span><span>{formatCurrency(closedReceiptData.totalTransferSistem || 0)}</span></div>
                  <div className="flex justify-between text-slate-500"><span>Total QRIS:</span><span>{formatCurrency(closedReceiptData.totalQrisSistem || 0)}</span></div>
                </div>

                <div className="border-b border-solid border-slate-900 my-2" />

                <div className="space-y-0.5 text-slate-950 font-black">
                  <div className="flex justify-between"><span>KAS FISIK AKTUAL:</span><span>{formatCurrency(closedReceiptData.actualCash || 0)}</span></div>
                  <div className="flex justify-between">
                    <span>SELISIH KAS:</span>
                    <span className={closedReceiptData.discrepancy === 0 ? 'text-emerald-700' : 'text-red-700'}>
                      {formatCurrency(closedReceiptData.discrepancy || 0)}
                    </span>
                  </div>
                </div>

                {closedReceiptData.notes && (
                  <>
                    <div className="border-b border-dashed border-slate-355 my-2" />
                    <div className="text-slate-800">
                      <div className="font-bold">CATATAN KASIR:</div>
                      <div className="mt-0.5 leading-normal italic text-[9px] break-words whitespace-pre-wrap">{closedReceiptData.notes}</div>
                    </div>
                  </>
                )}

                <div className="border-b border-dashed border-slate-350 my-2" />

                <div className="text-center font-bold text-[8px] text-slate-700 uppercase tracking-widest mt-1">OPERASIONAL KAS SELESAI</div>
                <div className="w-full text-center text-slate-400 mt-3 select-none tracking-widest text-[8px]">- - - - - - - - - - - - - - - - -</div>
              </div>
            </div>

            <div className="flex gap-2 px-6 py-3 bg-slate-100 border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setClosedReceiptData(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-655 hover:bg-slate-50 transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const printContents = document.getElementById('thermal-receipt').innerHTML;
                  const printWindow = window.open('', '', 'width=380,height=550');
                  printWindow.document.write('<html><head><title>Print Tutup Kas</title><style>');
                  printWindow.document.write('body { font-family: monospace; padding: 15px; background: white; color: black; }');
                  printWindow.document.write('.text-center { text-align: center; } .font-bold { font-weight: bold; } .font-black { font-weight: 900; }');
                  printWindow.document.write('.flex { display: flex; justify-content: space-between; } .border-b { border-bottom: 1px dashed #ccc; margin: 8px 0; }');
                  printWindow.document.write('.mt-1 { margin-top: 4px; } .pl-2 { padding-left: 8px; } .text-red-600 { color: #dc2626; }');
                  printWindow.document.write('</style></head><body>');
                  printWindow.document.write(printContents);
                  printWindow.document.write('</body></html>');
                  printWindow.document.close();
                  printWindow.focus();
                  printWindow.print();
                  printWindow.close();
                }}
                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-750 py-2 text-xs font-bold text-white shadow-md flex items-center justify-center gap-1 transition"
              >
                <Printer size={12} /> Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DIALOG EDIT TRANSAKSI (SAMA DENGAN BAWAAN) */}
      {editingTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-emerald-905 px-5 py-4 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-100">Laporan</p>
                <h3 className="mt-1 text-base font-black">Edit Transaksi Sewa</h3>
              </div>
              <button type="button" onClick={() => setEditingTrx(null)} className="rounded-full bg-emerald-800 p-2 hover:bg-emerald-700 text-white min-h-[32px]">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="max-h-[80vh] overflow-y-auto bg-slate-50 px-5 py-5 space-y-4 text-xs font-semibold">
              <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1.5">Nama Pelanggan</label>
                <input required value={formData.customerName} onChange={e => setFormData(prev => ({ ...prev, customerName: e.target.value }))} className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-2.5 font-bold text-slate-800 focus:bg-white focus:outline-none" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1.5">No. Telepon</label>
                  <input value={formData.customerPhone} onChange={e => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))} className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-2.5 font-bold text-slate-800 focus:bg-white focus:outline-none" />
                </div>

                <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1.5">Status Sewa</label>
                  <select value={formData.status} onChange={e => setFormData(prev => ({ ...prev, status: e.target.value }))} className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-2.5 font-bold text-slate-800 focus:outline-none">
                    <option value="rented">Disewa</option>
                    <option value="partially_returned">Sebagian kembali</option>
                    <option value="returned">Selesai</option>
                    <option value="void">Void</option>
                  </select>
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1.5">Alamat Lengkap</label>
                <textarea value={formData.customerAddress} onChange={e => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))} rows="2" className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-2.5 font-bold text-slate-800 resize-none focus:bg-white focus:outline-none" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1.5">Tanggal Sewa</label>
                  <input type="date" value={formData.rentDate} onChange={e => setFormData(prev => ({ ...prev, rentDate: e.target.value }))} className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-2.5 font-bold text-slate-800 focus:outline-none" />
                </div>
                <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1.5">Batas Kembali</label>
                  <input type="date" value={formData.expectedReturnDate} onChange={e => setFormData(prev => ({ ...prev, expectedReturnDate: e.target.value }))} className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-2.5 font-bold text-slate-800 focus:outline-none" />
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1.5">Akumulasi Denda (Rp)</label>
                <input
                  type="text"
                  value={formatNumberDot(formData.lateFee)}
                  onChange={(e) => setFormData(prev => ({ ...prev, lateFee: e.target.value.replace(/[^0-9]/g, '') }))}
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-2.5 font-bold text-slate-800 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t">
                <button type="button" onClick={() => setEditingTrx(null)} className="flex-1 rounded-[16px] border border-slate-200 bg-white py-3 font-bold text-slate-600">Batal</button>
                <button type="submit" className="flex-1 rounded-[16px] bg-emerald-800 text-white py-3 font-black">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
