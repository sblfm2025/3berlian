import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  AlertTriangle,
  Clock,
  User,
  Scissors,
  Lock,
  Unlock,
  ShieldAlert,
  Trash2,
  Sparkles,
  Info
} from 'lucide-react';
import { formatCurrency, formatDate, formatNumberDot } from '../utils/format';
import { isActiveTransaction } from '../utils/transactionStatus';
import { useMobileSearchRegistration } from '../components/layout/useMobileSearch';

const CUSTOMERS_PER_PAGE = 20;

const isRevenueTransaction = (transaction) => transaction.status !== 'void';
const getDepositAmount = (transaction) => Number(transaction.depositAmount ?? transaction.deposit ?? 0);
const getDepositDeducted = (transaction) => Number(transaction.depositDeducted || transaction.returnInfo?.depositDeducted || 0);

const getLateDays = (transaction) => {
  if (!transaction.expectedReturnDate) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expected = new Date(transaction.expectedReturnDate);
  expected.setHours(0, 0, 0, 0);
  return today > expected ? Math.ceil((today - expected) / (1000 * 60 * 60 * 24)) : 0;
};

// Fungsi pembantu untuk masking nomor identitas (UU PDP)
const maskIdentityNumber = (number) => {
  if (!number) return '-';
  const clean = String(number).trim();
  if (clean.length <= 6) return '******';
  return `${clean.substring(0, 4)}**********${clean.substring(clean.length - 2)}`;
};

export default function CustomersPage({ customers, transactions, onUpdateCustomer, onNotify }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('terbaru');
  const [customerPage, setCustomerPage] = useState(1);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [activeDetailTab, setActiveDetailTab] = useState('profile'); // profile, fitting, risk
  const [deleteConfirmCustomer, setDeleteConfirmCustomer] = useState(null); // untuk modal konfirmasi soft delete
  const [draftRiskNote, setDraftRiskNote] = useState('');

  const [draftCustomer, setDraftCustomer] = useState({
    address: '',
    note: '',
    riskNote: '',
    identityType: 'KTP',
    identityNumber: '',
    depositAmount: '',
    isBlocked: false,
    measurement: {
      heightCm: '',
      weightKg: '',
      chestCm: '',
      waistCm: '',
      hipCm: '',
      shoulderCm: '',
      headCm: '',
      shoeSize: '',
      preferredSize: '',
      notes: ''
    }
  });

  const mobileSearchConfig = useMemo(() => ({
    placeholder: 'Cari pelanggan atau nomor HP',
    value: searchTerm,
    onChange: (value) => {
      setSearchTerm(value);
      setCustomerPage(1);
    }
  }), [searchTerm]);

  useMobileSearchRegistration(mobileSearchConfig);

  // Menghitung statistik dan status risiko secara dinamis
  const enrichedCustomers = useMemo(() => {
    // Saring pelanggan yang dihapus secara lembut (soft delete)
    const activeCustomers = [...customers.filter(c => c.deleted !== true)];

    // Ekstrak nama pelanggan unik dari transaksi yang belum ada di activeCustomers
    transactions.forEach(tx => {
      if (!tx.customerName) return;
      const normalizedTxName = tx.customerName.trim().toLowerCase();

      const exists = activeCustomers.some(c => c.name.trim().toLowerCase() === normalizedTxName);
      if (!exists) {
        // Buat ID yang seragam sesuai getCustomerId transaksi
        const fallbackId = `CUST-${String(tx.customerPhone || tx.customerName)
          .trim()
          .replace(/[/.#[\]]/g, '-')
          .replace(/\s+/g, '-')
          .toLowerCase()}`;

        activeCustomers.push({
          id: fallbackId,
          name: tx.customerName.trim(),
          phone: tx.customerPhone || tx.customer?.phone || '',
          address: tx.customerAddress || tx.customer?.address || '',
          depositAmount: 0,
          isBlocked: false,
          isFallback: true,
          measurement: {
            heightCm: 0,
            weightKg: 0,
            chestCm: 0,
            waistCm: 0,
            hipCm: 0,
            shoulderCm: 0,
            headCm: 0,
            shoeSize: '',
            preferredSize: '',
            notes: ''
          }
        });
      }
    });

    return activeCustomers.map(customer => {
      const customerTransactions = transactions.filter(tx => tx.customerName === customer.name);
      const revenueTransactions = customerTransactions.filter(isRevenueTransaction);
      const recentTransactions = [...customerTransactions].sort((a, b) => new Date(b.rentDate || 0) - new Date(a.rentDate || 0));
      const totalSpend = revenueTransactions.reduce((sum, tx) => sum + (tx.totalAmount || 0) + (tx.lateFee || 0), 0);
      const visitCount = revenueTransactions.length;
      const lastRentDate = customer.lastRentDate || recentTransactions[0]?.rentDate || '';
      const activeTransactions = customerTransactions.filter(isActiveTransaction);
      const pendingReturns = activeTransactions.length;

      // Hitung akumulasi statistik historis pengembalian terlambat dan denda
      const overdueReturns = activeTransactions.filter(tx => getLateDays(tx) > 0).length;
      const totalLateReturns = revenueTransactions.filter(tx => (tx.lateFee || 0) > 0).length;
      const activeDeposit = activeTransactions.reduce((sum, tx) => sum + getDepositAmount(tx), 0);
      const depositDeducted = revenueTransactions.reduce((sum, tx) => sum + getDepositDeducted(tx), 0);

      // Hitung risk level secara dinamis sesuai aturan bisnis Phase 8
      let riskLevel = 'NORMAL';
      let riskReason = '';

      if (customer.isBlocked) {
        riskLevel = 'BLOCKED';
        riskReason = 'Diblokir manual oleh Owner/Staf Sanggar.';
      } else if (overdueReturns > 3 || depositDeducted > 150000) {
        riskLevel = 'HIGH_RISK';
        riskReason = 'Sering terlambat parah atau deposit sering terpotong denda besar.';
      } else if (overdueReturns > 0 || totalLateReturns > 2 || depositDeducted > 0) {
        riskLevel = 'ATTENTION';
        riskReason = 'Pernah terlambat sewa atau deposit terpotong denda.';
      } else if (visitCount > 3 && overdueReturns === 0 && depositDeducted === 0) {
        riskLevel = 'LOW';
        riskReason = 'Pelanggan loyal dan selalu tepat waktu.';
      }

      return {
        ...customer,
        activeDeposit,
        depositDeducted,
        overdueReturns,
        totalLateReturns,
        recentTransactions,
        totalSpend,
        visitCount,
        lastRentDate,
        pendingReturns,
        riskLevel,
        riskReason,
        depositAmount: Number(customer.depositAmount || 0) + activeDeposit
      };
    });
  }, [customers, transactions]);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return enrichedCustomers.find(c => c.id === selectedCustomerId) || null;
  }, [selectedCustomerId, enrichedCustomers]);

  const filteredCustomers = useMemo(() => {
    const haystack = searchTerm.toLowerCase();
    const filtered = enrichedCustomers.filter(customer => {
      if (!haystack) return true;
      return `${customer.name || ''} ${customer.phone || ''} ${customer.address || ''} ${customer.note || ''}`.toLowerCase().includes(haystack);
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'terbaru') return (b.lastRentDate || '').localeCompare(a.lastRentDate || '');
      if (sortBy === 'terbanyak') return b.visitCount - a.visitCount;
      if (sortBy === 'nilai') return b.totalSpend - a.totalSpend;
      return a.name.localeCompare(b.name);
    });

    return sorted;
  }, [enrichedCustomers, searchTerm, sortBy]);

  const customerPageCount = Math.max(1, Math.ceil(filteredCustomers.length / CUSTOMERS_PER_PAGE));
  const safeCustomerPage = Math.min(customerPage, customerPageCount);
  const paginatedCustomers = filteredCustomers.slice(
    (safeCustomerPage - 1) * CUSTOMERS_PER_PAGE,
    safeCustomerPage * CUSTOMERS_PER_PAGE
  );

  const customerStartNumber = filteredCustomers.length === 0 ? 0 : ((safeCustomerPage - 1) * CUSTOMERS_PER_PAGE) + 1;
  const customerEndNumber = Math.min(safeCustomerPage * CUSTOMERS_PER_PAGE, filteredCustomers.length);

  // Statistik dasbor pelanggan
  const totalCustomerCount = enrichedCustomers.length;
  const loyalCustomers = enrichedCustomers.filter(c => c.riskLevel === 'LOW').length;
  const attentionCustomers = enrichedCustomers.filter(c => c.riskLevel === 'ATTENTION' || c.riskLevel === 'HIGH_RISK').length;
  const blockedCustomers = enrichedCustomers.filter(c => c.riskLevel === 'BLOCKED').length;

  const openEditCustomer = (customer) => {
    const m = customer.measurement || {};
    setEditingCustomer(customer);
    setDraftCustomer({
      address: customer.address || '',
      note: customer.note || '',
      riskNote: customer.riskNote || '',
      identityType: customer.identityType || 'KTP',
      identityNumber: customer.identityNumber || '',
      depositAmount: customer.depositAmount ? String(customer.depositAmount) : '',
      isBlocked: Boolean(customer.isBlocked),
      measurement: {
        heightCm: m.heightCm ? String(m.heightCm) : '',
        weightKg: m.weightKg ? String(m.weightKg) : '',
        chestCm: m.chestCm ? String(m.chestCm) : '',
        waistCm: m.waistCm ? String(m.waistCm) : '',
        hipCm: m.hipCm ? String(m.hipCm) : '',
        shoulderCm: m.shoulderCm ? String(m.shoulderCm) : '',
        headCm: m.headCm ? String(m.headCm) : '',
        shoeSize: m.shoeSize || '',
        preferredSize: m.preferredSize || '',
        notes: m.notes || ''
      }
    });
  };

  const closeEditCustomer = () => {
    setEditingCustomer(null);
    setDraftCustomer({
      address: '',
      note: '',
      riskNote: '',
      identityType: 'KTP',
      identityNumber: '',
      depositAmount: '',
      isBlocked: false,
      measurement: {
        heightCm: '',
        weightKg: '',
        chestCm: '',
        waistCm: '',
        hipCm: '',
        shoulderCm: '',
        headCm: '',
        shoeSize: '',
        preferredSize: '',
        notes: ''
      }
    });
  };

  const handleSaveCustomer = async (event) => {
    event.preventDefault();
    if (!editingCustomer) return;

    const m = draftCustomer.measurement;

    // Validasi data angka negatif secara lokal sebelum kirim
    const hasNegative = [
      m.heightCm, m.weightKg, m.chestCm, m.waistCm, m.hipCm, m.shoulderCm, m.headCm
    ].some(val => val !== '' && Number(val) < 0);

    if (hasNegative) {
      onNotify?.({
        title: 'Input tidak valid',
        message: 'Ukuran jahit tubuh tidak boleh bernilai negatif.',
        type: 'error'
      });
      return;
    }

    try {
      await onUpdateCustomer({
        ...editingCustomer,
        address: draftCustomer.address,
        note: draftCustomer.note,
        riskNote: draftCustomer.riskNote,
        identityType: draftCustomer.identityType,
        identityNumber: draftCustomer.identityNumber,
        depositAmount: draftCustomer.depositAmount ? Number(draftCustomer.depositAmount) : 0,
        isBlocked: Boolean(draftCustomer.isBlocked),
        measurement: {
          heightCm: m.heightCm ? Number(m.heightCm) : 0,
          weightKg: m.weightKg ? Number(m.weightKg) : 0,
          chestCm: m.chestCm ? Number(m.chestCm) : 0,
          waistCm: m.waistCm ? Number(m.waistCm) : 0,
          hipCm: m.hipCm ? Number(m.hipCm) : 0,
          shoulderCm: m.shoulderCm ? Number(m.shoulderCm) : 0,
          headCm: m.headCm ? Number(m.headCm) : 0,
          shoeSize: String(m.shoeSize || '').trim(),
          preferredSize: String(m.preferredSize || '').trim(),
          notes: String(m.notes || '').trim()
        }
      });

      onNotify?.({
        title: 'Profil Diperbarui',
        message: `Data pelanggan ${editingCustomer.name} berhasil disimpan.`,
        type: 'success'
      });

      closeEditCustomer();
    } catch (err) {
      console.error(err);
      onNotify?.({
        title: 'Gagal Menyimpan',
        message: 'Terdapat kesalahan koneksi atau otorisasi Firebase.',
        type: 'error'
      });
    }
  };

  const handleSoftDeleteCustomer = async () => {
    if (!deleteConfirmCustomer) return;
    try {
      await onUpdateCustomer({
        ...deleteConfirmCustomer,
        deleted: true,
        deletedAt: new Date().toISOString()
      });

      onNotify?.({
        title: 'Pelanggan Dihapus',
        message: `Pelanggan ${deleteConfirmCustomer.name} telah dinonaktifkan secara aman.`,
        type: 'success'
      });

      setDeleteConfirmCustomer(null);
      closeEditCustomer();
    } catch (err) {
      console.error(err);
      onNotify?.({
        title: 'Gagal Menghapus',
        message: 'Gagal menonaktifkan pelanggan.',
        type: 'error'
      });
    }
  };

  // Renderer badge tingkat risiko premium
  const renderRiskBadge = (level) => {
    const config = {
      LOW: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', text: 'Sangat Baik (LOW)', icon: Sparkles },
      NORMAL: { bg: 'bg-blue-50 text-blue-700 border-blue-200', text: 'Normal', icon: Info },
      ATTENTION: { bg: 'bg-amber-50 text-amber-700 border-amber-200', text: 'Perhatian', icon: AlertTriangle },
      HIGH_RISK: { bg: 'bg-red-50 text-red-700 border-red-200 animate-pulse', text: 'RISIKO TINGGI', icon: ShieldAlert },
      BLOCKED: { bg: 'bg-slate-900 text-white border-slate-950', text: 'DIBLOKIR', icon: Lock }
    };

    const item = config[level] || config.NORMAL;
    const IconComponent = item.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.bg}`}>
        <IconComponent size={10} />
        {item.text}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
      {/* Ringkasan pelanggan; judul utama sudah ada di AppShell */}
      <div className="brand-gradient rounded-[24px] p-4 text-white shadow-soft md:p-5 relative overflow-hidden">
        {/* Tenun Watermark */}
        <div className="absolute inset-0 bg-tenun opacity-[0.035] pointer-events-none" />

        <div className="relative max-w-2xl">
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.18em] text-gold-400">Ringkasan pelanggan</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-white/90 sm:text-base">
            {totalCustomerCount} profil aktif dengan {attentionCustomers} perlu perhatian dan {blockedCustomers} diblokir.
          </p>
        </div>

        <div className="mt-4 relative grid gap-2 grid-cols-2 sm:grid-cols-4">
          <div className="rounded-[20px] bg-white/10 border border-white/20 p-3 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold-300 font-bold">Total Pelanggan</p>
            <p className="mt-1 text-lg font-black sm:text-2xl text-white">{totalCustomerCount}</p>
          </div>
          <div className="rounded-[20px] bg-white/10 border border-white/20 p-3 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold-300 font-bold">Loyal (Low Risk)</p>
            <p className="mt-1 text-lg font-black sm:text-2xl text-white">{loyalCustomers}</p>
          </div>
          <div className="rounded-[20px] bg-white/10 border border-white/20 p-3 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold-300 font-bold">Perlu Perhatian</p>
            <p className="mt-1 text-lg font-black sm:text-2xl text-white">{attentionCustomers}</p>
          </div>
          <div className="rounded-[20px] bg-white/10 border border-white/20 p-3 backdrop-blur-sm">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold-300 font-bold">Diblokir (Blocked)</p>
            <p className="mt-1 text-lg font-black sm:text-2xl text-white">{blockedCustomers}</p>
          </div>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr] xl:gap-4">
        {/* Panel Kiri: Tabel Pelanggan */}
        <div className="pos-card p-3 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Database Pelanggan</p>
              <h3 className="mt-1 text-sm font-bold text-slate-800 sm:text-base">Kelola ukuran jahit dan riwayat sewa</h3>
            </div>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCustomerPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="terbaru">Terakhir Aktif</option>
                <option value="terbanyak">Sewa Terbanyak</option>
                <option value="nilai">Total Belanja</option>
                <option value="alphabet">Nama A-Z</option>
              </select>
            </div>
          </div>

          {/* Form Pencarian */}
          <div className="mt-3 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, telepon, atau alamat..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCustomerPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-700 focus:border-emerald-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {/* Navigasi Halaman */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold">
            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-800 border border-emerald-100">
              Menampilkan {customerStartNumber}-{customerEndNumber} dari {filteredCustomers.length} pelanggan
            </span>
            {customerPageCount > 1 && (
              <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setCustomerPage(page => Math.max(1, page - 1))}
                  disabled={safeCustomerPage === 1}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-white text-slate-700 disabled:opacity-40 border border-slate-200 shadow-sm"
                >
                  <ChevronLeft size={14} strokeWidth={3} />
                </button>
                <span className="px-2 font-black text-slate-800">{safeCustomerPage} / {customerPageCount}</span>
                <button
                  type="button"
                  onClick={() => setCustomerPage(page => Math.min(customerPageCount, page + 1))}
                  disabled={safeCustomerPage === customerPageCount}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-white text-slate-700 disabled:opacity-40 border border-slate-200 shadow-sm"
                >
                  <ChevronRight size={14} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>

          {/* Daftar Pelanggan */}
          <div className="mt-4 space-y-3">
            {filteredCustomers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center text-xs text-slate-500 font-semibold">
                Tidak ada pelanggan yang sesuai dengan pencarian Anda.
              </div>
            ) : (
              paginatedCustomers.map(customer => {
                const hasFittingData = customer.measurement && Object.values(customer.measurement).some(v => v !== 0 && v !== '');

                return (
                  <div key={customer.id} className={`rounded-2xl border bg-white p-3 shadow-sm transition-all hover:shadow-md ${customer.riskLevel === 'BLOCKED' ? 'border-slate-300 opacity-80' : 'border-slate-200'}`}>
                    <div className="flex justify-between items-start gap-2 flex-wrap sm:flex-nowrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-slate-900 break-words">{customer.name}</p>
                          {renderRiskBadge(customer.riskLevel)}
                          {hasFittingData && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <Scissors size={8} /> Ada Ukuran
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-[11px] font-semibold text-slate-500">{customer.phone || 'Nomor HP -'}</p>
                        <p className="mt-0.5 text-[10px] text-slate-400 break-words">{customer.address || 'Alamat belum diisi.'}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">{customer.visitCount}x Sewa</span>
                        <p className="mt-1 text-xs font-black text-slate-800">{formatCurrency(customer.totalSpend)}</p>
                      </div>
                    </div>

                    {/* Informasi Cepat Deposit & Keterlambatan */}
                    <div className="mt-3 grid gap-2 grid-cols-3 text-[10px] font-bold">
                      <div className="rounded-lg bg-slate-50 border border-slate-100 p-1.5 text-center">
                        <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Deposit Jaminan</span>
                        <span className="text-slate-800">{formatCurrency(customer.depositAmount)}</span>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100 p-1.5 text-center">
                        <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Deposit Dipotong</span>
                        <span className={`block ${customer.depositDeducted > 0 ? 'text-red-600' : 'text-slate-800'}`}>
                          {customer.depositDeducted > 0 ? formatCurrency(customer.depositDeducted) : 'Rp 0'}
                        </span>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-100 p-1.5 text-center">
                        <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Status Sewa</span>
                        <span className={`block ${customer.overdueReturns > 0 ? 'text-red-700' : customer.pendingReturns > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                          {customer.overdueReturns > 0 ? `${customer.overdueReturns} Terlambat` : customer.pendingReturns > 0 ? 'Ada Sewa Aktif' : 'Selesai'}
                        </span>
                      </div>
                    </div>

                    {/* Tombol Aksi */}
                    <div className="mt-3 flex gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => openEditCustomer(customer)}
                        className="flex-1 py-2 text-center rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-100 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
                      >
                        Ubah Profil &amp; Fitting
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCustomerId(customer.id);
                          setDraftRiskNote(customer.riskNote || '');
                          setActiveDetailTab('profile');
                        }}
                        className="py-2 px-4 rounded-xl bg-slate-800 text-white text-[11px] font-bold hover:bg-slate-900 transition-colors"
                      >
                        Detail &amp; Riwayat
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panel Kanan: Ringkasan & Pelanggan Utama */}
        <div className="hidden gap-4 xl:grid xl:content-start">
          {/* Pelanggan Top Spender */}
          <div className="pos-card p-4">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Pelanggan Loyal</p>
            <h3 className="mt-1 text-sm font-bold text-slate-800">Top 5 Pelanggan Tertinggi</h3>

            <div className="mt-3 space-y-2.5">
              {[...enrichedCustomers]
                .sort((a, b) => b.totalSpend - a.totalSpend)
                .slice(0, 5)
                .map((customer, index) => (
                  <div key={customer.id} className="flex justify-between items-center rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {index + 1}. {customer.name}
                      </p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{customer.visitCount} kunjungan</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-black text-emerald-800 block">{formatCurrency(customer.totalSpend)}</span>
                    </div>
                  </div>
                ))}
              {enrichedCustomers.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-4">Belum ada data pelanggan.</p>
              )}
            </div>
          </div>

          {/* Riwayat KTP Ter-masking */}
          <div className="pos-card p-4">
            <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Keamanan Data (PDP)</p>
            <h3 className="mt-1 text-sm font-bold text-slate-800">Nomor Identitas Masking</h3>

            <div className="mt-3 space-y-2.5">
              {enrichedCustomers.slice(0, 5).map(customer => (
                <div key={customer.id} className="flex justify-between items-center rounded-xl border border-slate-100 p-2 text-xs">
                  <span className="font-bold text-slate-700">{customer.name}</span>
                  <span className="font-mono text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded border">
                    {customer.identityType || 'KTP'}: {maskIdentityNumber(customer.identityNumber)}
                  </span>
                </div>
              ))}
              {enrichedCustomers.length === 0 && (
                <p className="text-xs text-slate-500 italic text-center py-4">Belum ada data pelanggan.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 🛠️ MODAL EDIT PELANGGAN & INPUT FITTING */}
      {/* ---------------------------------------------------- */}
      {editingCustomer && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[28px] w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[92vh]">
            {/* Header Modal */}
            <div className="p-4 bg-emerald-900 text-white flex justify-between items-center border-b border-emerald-800 relative">
              <div className="absolute inset-0 bg-tenun opacity-[0.045] pointer-events-none" />
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400">Formulir Profil &amp; Fitting</p>
                <h3 className="mt-1 text-sm font-black text-gold-100">Ubah Data: {editingCustomer.name}</h3>
              </div>
              <button type="button" onClick={closeEditCustomer} className="p-1.5 bg-emerald-800 rounded-full hover:bg-emerald-700 transition-colors text-white relative">
                <X size={18} />
              </button>
            </div>

            {/* Form Konten */}
            <form onSubmit={handleSaveCustomer} className="p-4 md:p-6 bg-slate-50 overflow-y-auto flex-1 space-y-4 text-xs">

              {/* Seksi 1: Data Identitas Dasar */}
              <div className="rounded-[20px] bg-white border border-slate-100 p-4 space-y-3 shadow-sm">
                <h4 className="font-bold text-slate-800 flex items-center gap-1">
                  <User size={14} className="text-emerald-700" /> Informasi Identitas &amp; Kontak
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Jenis Identitas</label>
                    <select
                      value={draftCustomer.identityType}
                      onChange={(event) => setDraftCustomer(prev => ({ ...prev, identityType: event.target.value }))}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-800"
                    >
                      <option value="KTP">KTP</option>
                      <option value="SIM">SIM</option>
                      <option value="Kartu Pelajar">Kartu Pelajar</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Nomor Identitas (Asli)</label>
                    <input
                      type="text"
                      value={draftCustomer.identityNumber}
                      onChange={(event) => setDraftCustomer(prev => ({ ...prev, identityNumber: event.target.value }))}
                      placeholder="Masukkan nomor identitas..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-800 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Alamat Pelanggan</label>
                  <textarea
                    rows="2"
                    value={draftCustomer.address}
                    onChange={(event) => setDraftCustomer(prev => ({ ...prev, address: event.target.value }))}
                    placeholder="Masukkan alamat domisili pelanggan..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-800 focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* Seksi 2: Ukuran Fitting Tubuh (Measurement Profile) */}
              <div className="rounded-[20px] bg-white border border-slate-100 p-4 space-y-3 shadow-sm">
                <h4 className="font-bold text-slate-800 flex items-center gap-1">
                  <Scissors size={14} className="text-emerald-700" /> Ukuran Fitting Tubuh Pelanggan (Meteran)
                </h4>

                <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tinggi Badan (cm)</label>
                    <input
                      type="number"
                      min="0"
                      value={draftCustomer.measurement.heightCm}
                      onChange={(e) => setDraftCustomer(prev => ({
                        ...prev,
                        measurement: { ...prev.measurement, heightCm: e.target.value }
                      }))}
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-bold text-slate-800 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Berat Badan (kg)</label>
                    <input
                      type="number"
                      min="0"
                      value={draftCustomer.measurement.weightKg}
                      onChange={(e) => setDraftCustomer(prev => ({
                        ...prev,
                        measurement: { ...prev.measurement, weightKg: e.target.value }
                      }))}
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-bold text-slate-800 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lingkar Dada (cm)</label>
                    <input
                      type="number"
                      min="0"
                      value={draftCustomer.measurement.chestCm}
                      onChange={(e) => setDraftCustomer(prev => ({
                        ...prev,
                        measurement: { ...prev.measurement, chestCm: e.target.value }
                      }))}
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-bold text-slate-800 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lingkar Pinggang (cm)</label>
                    <input
                      type="number"
                      min="0"
                      value={draftCustomer.measurement.waistCm}
                      onChange={(e) => setDraftCustomer(prev => ({
                        ...prev,
                        measurement: { ...prev.measurement, waistCm: e.target.value }
                      }))}
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-bold text-slate-800 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lingkar Pinggul (cm)</label>
                    <input
                      type="number"
                      min="0"
                      value={draftCustomer.measurement.hipCm}
                      onChange={(e) => setDraftCustomer(prev => ({
                        ...prev,
                        measurement: { ...prev.measurement, hipCm: e.target.value }
                      }))}
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-bold text-slate-800 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lebar Bahu (cm)</label>
                    <input
                      type="number"
                      min="0"
                      value={draftCustomer.measurement.shoulderCm}
                      onChange={(e) => setDraftCustomer(prev => ({
                        ...prev,
                        measurement: { ...prev.measurement, shoulderCm: e.target.value }
                      }))}
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-bold text-slate-800 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Lingkar Kepala (cm)</label>
                    <input
                      type="number"
                      min="0"
                      value={draftCustomer.measurement.headCm}
                      onChange={(e) => setDraftCustomer(prev => ({
                        ...prev,
                        measurement: { ...prev.measurement, headCm: e.target.value }
                      }))}
                      placeholder="0"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-bold text-slate-800 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Ukuran Sepatu</label>
                    <input
                      type="text"
                      value={draftCustomer.measurement.shoeSize}
                      onChange={(e) => setDraftCustomer(prev => ({
                        ...prev,
                        measurement: { ...prev.measurement, shoeSize: e.target.value }
                      }))}
                      placeholder="misal: 40"
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-bold text-slate-800 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Preferensi Ukuran Kostum</label>
                    <select
                      value={draftCustomer.measurement.preferredSize}
                      onChange={(e) => setDraftCustomer(prev => ({
                        ...prev,
                        measurement: { ...prev.measurement, preferredSize: e.target.value }
                      }))}
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-bold text-slate-800"
                    >
                      <option value="">Belum Memilih</option>
                      <option value="S">S (Small)</option>
                      <option value="M">M (Medium)</option>
                      <option value="L">L (Large)</option>
                      <option value="XL">XL (Extra Large)</option>
                      <option value="XXL">XXL (Double Extra Large)</option>
                      <option value="Custom">Custom (Lihat catatan)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1">Catatan Tambahan Fitting</label>
                    <input
                      type="text"
                      value={draftCustomer.measurement.notes}
                      onChange={(e) => setDraftCustomer(prev => ({
                        ...prev,
                        measurement: { ...prev.measurement, notes: e.target.value }
                      }))}
                      placeholder="misal: Lengan baju minta lebih panjang..."
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 font-bold text-slate-800 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Seksi 3: Catatan & Deposit Keamanan */}
              <div className="rounded-[20px] bg-white border border-slate-100 p-4 space-y-3 shadow-sm">
                <h4 className="font-bold text-slate-800 flex items-center gap-1">
                  <Info size={14} className="text-emerald-700" /> Deposit Keuangan &amp; Catatan Khusus
                </h4>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sisa Limit Deposit Pribadi (Jaminan)</label>
                    <input
                      type="text"
                      value={formatNumberDot(draftCustomer.depositAmount)}
                      onChange={(event) => setDraftCustomer(prev => ({ ...prev, depositAmount: event.target.value.replace(/[^0-9]/g, '') }))}
                      placeholder="Rp 0"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-800 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Catatan Umum Pelanggan</label>
                    <input
                      type="text"
                      value={draftCustomer.note}
                      onChange={(event) => setDraftCustomer(prev => ({ ...prev, note: event.target.value }))}
                      placeholder="Catatan pelengkap..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-800 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Catatan Risiko Staf (Internal)</label>
                  <textarea
                    rows="2"
                    value={draftCustomer.riskNote}
                    onChange={(event) => setDraftCustomer(prev => ({ ...prev, riskNote: event.target.value }))}
                    placeholder="misal: Pernah terlambat 5 hari, harap dimintai jaminan KTP asli..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-bold text-slate-800 focus:bg-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-150">
                  <div>
                    <p className="font-bold text-slate-800">Status Pemblokiran Pelanggan</p>
                    <p className="text-[10px] text-slate-500 font-semibold">Tandai jika pelanggan bermasalah parah agar dilarang melakukan sewa.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDraftCustomer(prev => ({ ...prev, isBlocked: !prev.isBlocked }))}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${draftCustomer.isBlocked ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-350'}`}
                  >
                    {draftCustomer.isBlocked ? <Lock size={12} /> : <Unlock size={12} />}
                    {draftCustomer.isBlocked ? 'BLOCKED (Diblokir)' : 'UNLOCKED (Aktif)'}
                  </button>
                </div>
              </div>

              {/* Tombol Aksi di Bawah Form */}
              <div className="flex flex-wrap justify-between items-center gap-3 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmCustomer(editingCustomer)}
                  className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-2.5 font-bold hover:bg-red-100 transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Trash2 size={14} /> Hapus Pelanggan
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeEditCustomer}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-emerald-800 px-5 py-2.5 font-bold text-white hover:bg-emerald-950 shadow-sm"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 📖 MODAL DETAIL & RIWAYAT TRANSAKSI (TAB PREMIUM)    */}
      {/* ---------------------------------------------------- */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[28px] w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col max-h-[90vh]">

            {/* Header Detail */}
            <div className="p-4 bg-emerald-900 text-white flex justify-between items-center border-b border-emerald-800 relative">
              <div className="absolute inset-0 bg-tenun opacity-[0.045] pointer-events-none" />
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400">Profil Lengkap Pelanggan</p>
                <h3 className="mt-1 text-sm font-black text-gold-100">{selectedCustomer.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
                className="p-1.5 bg-emerald-800 rounded-full hover:bg-emerald-700 transition-colors text-white relative"
              >
                <X size={18} />
              </button>
            </div>

            {/* Panel Tab Navigasi */}
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveDetailTab('profile')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${activeDetailTab === 'profile' ? 'bg-emerald-800 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                Profil &amp; Nota Sewa
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailTab('fitting')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${activeDetailTab === 'fitting' ? 'bg-emerald-800 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                Ukuran Fitting Badan
              </button>
              <button
                type="button"
                onClick={() => setActiveDetailTab('risk')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${activeDetailTab === 'risk' ? 'bg-emerald-800 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                Analisis Risiko &amp; Keamanan
              </button>
            </div>

            {/* Konten Tab Aktif */}
            <div className="p-4 md:p-6 bg-slate-50 overflow-y-auto flex-1 text-xs">

              {/* TAB 1: PROFIL & RIWAYAT NOTA */}
              {activeDetailTab === 'profile' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[20px] bg-white border border-slate-100 p-4 shadow-sm">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Kontak Utama</p>
                      <p className="mt-1 text-xs font-bold text-slate-800">{selectedCustomer.phone || '-'}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-semibold">Identitas: {selectedCustomer.identityType || 'KTP'} ({maskIdentityNumber(selectedCustomer.identityNumber)})</p>
                      <p className="text-[10px] text-slate-600 mt-2 font-medium break-words leading-relaxed">{selectedCustomer.address || 'Alamat tidak tercatat.'}</p>
                    </div>

                    <div className="rounded-[20px] bg-white border border-slate-100 p-4 shadow-sm">
                      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Statistik Belanja</p>
                      <p className="mt-1 text-sm font-black text-slate-900">{formatCurrency(selectedCustomer.totalSpend)}</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">{selectedCustomer.visitCount} Transaksi Selesai</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Terakhir Sewa: {selectedCustomer.lastRentDate ? formatDate(selectedCustomer.lastRentDate) : 'Belum Pernah'}</p>
                    </div>

                    <div className="rounded-[20px] bg-white border border-slate-100 p-4 shadow-sm flex flex-col justify-between">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Deposit Aktif Saat Ini</p>
                        <p className="mt-1 text-sm font-black text-emerald-800">{formatCurrency(selectedCustomer.activeDeposit)}</p>
                      </div>
                      {selectedCustomer.depositDeducted > 0 && (
                        <p className="text-[9px] font-bold text-red-600 border-t border-dashed border-red-100 pt-1.5 mt-2">
                          Total Denda Dipotong: {formatCurrency(selectedCustomer.depositDeducted)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Daftar Transaksi */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Clock size={12} /> Riwayat Dokumen Transaksi Sewa
                    </p>

                    <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-1">
                      {selectedCustomer.recentTransactions.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-400 font-semibold">
                          Belum ada nota transaksi sewa yang tercatat untuk pelanggan ini.
                        </div>
                      ) : (
                        selectedCustomer.recentTransactions.map((tx) => {
                          const isOverdue = tx.status === 'overdue' || (isActiveTransaction(tx) && getLateDays(tx) > 0);
                          const statusColors = tx.status === 'void'
                            ? 'bg-slate-100 text-slate-600'
                            : tx.status === 'returned'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : tx.status === 'partially_returned'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : isOverdue
                                  ? 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200';

                          return (
                            <div key={tx.id} className="rounded-2xl border border-slate-200 bg-white p-3 space-y-2.5 shadow-sm">
                              <div className="flex justify-between items-center gap-2">
                                <div>
                                  <p className="font-bold text-slate-800">{tx.id}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Sewa: {formatDate(tx.rentDate)} | Batas: {formatDate(tx.expectedReturnDate)}</p>
                                </div>
                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${statusColors}`}>
                                  {tx.status === 'void' ? 'Batal (Void)' : tx.status === 'returned' ? 'Selesai' : tx.status === 'partially_returned' ? 'Sebagian Kembali' : isOverdue ? 'Terlambat' : 'Disewa'}
                                </span>
                              </div>

                              {/* Item */}
                              <div className="bg-slate-50 rounded-xl p-2.5 space-y-1">
                                {(tx.items || []).map((item, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-slate-700 font-semibold">
                                    <span>{item.qty}x {item.product?.name || item.productName || 'Kostum'}</span>
                                    <span>{formatCurrency((item.product?.rentPrice || item.rentPrice || 0) * item.qty)}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Mutasi Denda */}
                              {tx.returnHistory && tx.returnHistory.length > 0 && (
                                <div className="border-t border-slate-100 pt-2 space-y-1.5">
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Log Riwayat Kembali</p>
                                  {tx.returnHistory.map((ret, rIdx) => (
                                    <div key={rIdx} className="bg-emerald-50/50 rounded-lg p-2 border border-emerald-100 text-[10px] text-slate-600">
                                      <div className="flex justify-between font-bold text-slate-700 mb-1">
                                        <span>Kembali #{rIdx + 1}</span>
                                        <span>{formatDate(ret.returnedAt)}</span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-1 font-semibold">
                                        <div>Denda Lambat: {formatCurrency(ret.lateFee || 0)}</div>
                                        <div>Biaya Kondisi: {formatCurrency(ret.conditionFee || 0)}</div>
                                        <div>Dipotong Deposit: {formatCurrency(ret.depositDeducted || 0)}</div>
                                        <div>Dikembalikan: {formatCurrency(ret.depositReturned || 0)}</div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: UKURAN FITTING BADAN */}
              {activeDetailTab === 'fitting' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="rounded-[20px] bg-white border border-slate-200 p-4 space-y-4 shadow-sm relative overflow-hidden">
                    {/* Hiasan background meteran tipis */}
                    <div className="absolute -right-10 -bottom-10 opacity-[0.05] text-slate-900 pointer-events-none">
                      <Scissors size={200} />
                    </div>

                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                      <Scissors size={18} className="text-emerald-700" />
                      <div>
                        <h4 className="font-bold text-slate-800">Spesifikasi Ukuran Jahit (Fitting)</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">Gunakan data ini untuk mempermudah pengecekan kecocokan ukuran kostum di gudang.</p>
                      </div>
                    </div>

                    {/* Parameter Grid */}
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 font-bold">
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Tinggi Badan</span>
                        <span className="text-sm font-black text-slate-800">
                          {selectedCustomer.measurement?.heightCm ? `${selectedCustomer.measurement.heightCm} cm` : '-'}
                        </span>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Berat Badan</span>
                        <span className="text-sm font-black text-slate-800">
                          {selectedCustomer.measurement?.weightKg ? `${selectedCustomer.measurement.weightKg} kg` : '-'}
                        </span>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Lingkar Dada</span>
                        <span className="text-sm font-black text-slate-800">
                          {selectedCustomer.measurement?.chestCm ? `${selectedCustomer.measurement.chestCm} cm` : '-'}
                        </span>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Lingkar Pinggang</span>
                        <span className="text-sm font-black text-slate-800">
                          {selectedCustomer.measurement?.waistCm ? `${selectedCustomer.measurement.waistCm} cm` : '-'}
                        </span>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Lingkar Pinggul</span>
                        <span className="text-sm font-black text-slate-800">
                          {selectedCustomer.measurement?.hipCm ? `${selectedCustomer.measurement.hipCm} cm` : '-'}
                        </span>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Lebar Bahu</span>
                        <span className="text-sm font-black text-slate-800">
                          {selectedCustomer.measurement?.shoulderCm ? `${selectedCustomer.measurement.shoulderCm} cm` : '-'}
                        </span>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Lingkar Kepala</span>
                        <span className="text-sm font-black text-slate-800">
                          {selectedCustomer.measurement?.headCm ? `${selectedCustomer.measurement.headCm} cm` : '-'}
                        </span>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-center">
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Ukuran Sepatu</span>
                        <span className="text-sm font-black text-slate-800">
                          {selectedCustomer.measurement?.shoeSize || '-'}
                        </span>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-100 font-bold">
                      <div className="rounded-xl bg-emerald-50/50 border border-emerald-100 p-3">
                        <span className="text-emerald-800 block text-[9px] uppercase tracking-wider">Preferensi Ukuran Sandang</span>
                        <span className="text-sm font-black text-emerald-950">
                          {selectedCustomer.measurement?.preferredSize || 'Belum diisi'}
                        </span>
                      </div>
                      <div className="rounded-xl bg-amber-50/50 border border-amber-100 p-3">
                        <span className="text-amber-800 block text-[9px] uppercase tracking-wider">Catatan Jahit Khusus</span>
                        <span className="text-xs text-slate-700 block mt-1 leading-normal font-semibold">
                          {selectedCustomer.measurement?.notes || 'Tidak ada catatan tambahan.'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ANALISIS RISIKO & KEAMANAN */}
              {activeDetailTab === 'risk' && (
                <div className="space-y-4 animate-in fade-in duration-200">

                  {/* Status Risiko Dinamis */}
                  <div className="rounded-[20px] bg-white border border-slate-200 p-4 space-y-3.5 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                      <ShieldAlert size={18} className="text-emerald-700" />
                      <div>
                        <h4 className="font-bold text-slate-800">Analisis Kepatuhan &amp; Risiko</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">Perhitungan kepatuhan otomatis berdasarkan rekam jejak sewa di sanggar.</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-slate-50 rounded-xl p-3 border">
                      <div>
                        <p className="font-bold text-slate-800">Tingkat Risiko Pelanggan</p>
                        <p className="text-[10px] text-slate-500 font-semibold leading-relaxed mt-0.5">
                          {selectedCustomer.riskReason || 'Pelanggan memiliki riwayat yang stabil dan bersih.'}
                        </p>
                      </div>
                      <div>
                        {renderRiskBadge(selectedCustomer.riskLevel)}
                      </div>
                    </div>

                    {/* Metrik Kepatuhan */}
                    <div className="grid gap-3 grid-cols-2 font-bold">
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Total Terlambat Kembali</span>
                        <span className="text-sm font-black text-slate-800 block mt-0.5">{selectedCustomer.totalLateReturns || 0} Kali</span>
                      </div>
                      <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                        <span className="text-slate-400 block text-[8px] uppercase tracking-wider">Jaminan Dipotong Denda</span>
                        <span className="text-sm font-black text-red-700 block mt-0.5">{formatCurrency(selectedCustomer.depositDeducted || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Form Catatan Risiko Staf */}
                  <div className="rounded-[20px] bg-amber-50 border border-amber-200 p-4 space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle size={16} />
                      <p className="text-[10px] font-bold uppercase tracking-[0.1em]">Catatan Risiko Khusus Pelanggan (Staf Kasir)</p>
                    </div>
                    <p className="text-[10px] text-slate-600 font-semibold">
                      Catatan ini hanya terlihat oleh internal kasir dan admin untuk menganalisis risiko saat fitting maupun penagihan kostum.
                    </p>
                    <div className="flex gap-2">
                      <textarea
                        rows="2"
                        value={draftRiskNote}
                        onChange={(e) => setDraftRiskNote(e.target.value)}
                        placeholder="Tulis catatan risiko khusus (misal: Suka menunggak denda, payet payung rusak)..."
                        className="w-full rounded-[12px] border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 focus:border-amber-400 focus:outline-none resize-none"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await onUpdateCustomer({
                              ...selectedCustomer,
                              riskNote: draftRiskNote
                            });
                            onNotify?.({
                              title: 'Catatan Diperbarui',
                              message: 'Catatan risiko staf berhasil disimpan.',
                              type: 'success'
                            });
                          } catch {
                            onNotify?.({
                              title: 'Gagal Menyimpan',
                              message: 'Gagal memperbarui catatan risiko.',
                              type: 'error'
                            });
                          }
                        }}
                        className="self-end rounded-[12px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2.5 shrink-0 shadow-sm transition-colors"
                      >
                        Simpan
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Detail */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCustomerId(null)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
              >
                Tutup Profil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 🚨 MODAL KONFIRMASI SOFT DELETE INTERNAL (NO ALERT)   */}
      {/* ---------------------------------------------------- */}
      {deleteConfirmCustomer && (
        <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 z-55 animate-in fade-in">
          <div className="bg-white rounded-[24px] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 p-5 text-xs font-semibold text-slate-700 space-y-4">
            <div className="flex items-center gap-3 text-red-700 border-b border-slate-100 pb-3">
              <AlertTriangle size={24} />
              <div>
                <h4 className="text-sm font-black">Hapus Pelanggan (Soft Delete)?</h4>
                <p className="text-[10px] text-slate-400 font-semibold">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="leading-relaxed">
              Apakah Anda yakin ingin menonaktifkan pelanggan <strong className="text-slate-900 font-bold">{deleteConfirmCustomer.name}</strong>?
            </p>
            <p className="bg-slate-50 border rounded-xl p-3 text-[10px] text-slate-500 font-semibold leading-normal">
              Informasi pelanggan akan disembunyikan dari daftar pelanggan aktif dan form sewa checkout POS baru. Namun, seluruh riwayat nota sewa masa lalu pelanggan tetap utuh di database demi keakuratan laporan keuangan Anda.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCustomer(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSoftDeleteCustomer}
                className="rounded-xl bg-red-600 text-white px-5 py-2 font-bold hover:bg-red-700 shadow-sm"
              >
                Ya, Nonaktifkan Pelanggan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
