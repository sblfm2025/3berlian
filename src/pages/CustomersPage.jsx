import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { formatCurrency, formatDate, formatNumberDot } from '../utils/format';
import { useMobileSearchRegistration } from '../components/layout/useMobileSearch';

const CUSTOMERS_PER_PAGE = 20;

// ==========================================
export default function CustomersPage({ customers, transactions, onUpdateCustomer }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('terbaru');
  const [customerPage, setCustomerPage] = useState(1);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [draftCustomer, setDraftCustomer] = useState({
    address: '',
    note: '',
    identityType: 'KTP',
    identityNumber: '',
    depositAmount: ''
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

  const enrichedCustomers = useMemo(() => {
    return customers.map(customer => {
      const customerTransactions = transactions.filter(tx => tx.customerName === customer.name);
      const recentTransactions = [...customerTransactions].sort((a, b) => new Date(b.rentDate || 0) - new Date(a.rentDate || 0));
      const totalSpend = customerTransactions.reduce((sum, tx) => sum + (tx.totalAmount || 0) + (tx.lateFee || 0), 0);
      const visitCount = customerTransactions.length;
      const lastRentDate = customer.lastRentDate || recentTransactions[0]?.rentDate || '';
      const pendingReturns = customerTransactions.filter(tx => tx.status === 'disewa').length;

      return {
        ...customer,
        recentTransactions,
        totalSpend,
        visitCount,
        lastRentDate,
        pendingReturns,
        depositAmount: Number(customer.depositAmount || 0)
      };
    });
  }, [customers, transactions]);

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

  const repeatCustomers = enrichedCustomers.filter(customer => customer.visitCount > 1).length;
  const activeCustomerCount = enrichedCustomers.filter(customer => customer.pendingReturns > 0).length;
  const totalDeposit = enrichedCustomers.reduce((sum, customer) => sum + customer.depositAmount, 0);

  const openEditCustomer = (customer) => {
    setEditingCustomer(customer);
    setDraftCustomer({
      address: customer.address || '',
      note: customer.note || '',
      identityType: customer.identityType || 'KTP',
      identityNumber: customer.identityNumber || '',
      depositAmount: customer.depositAmount ? String(customer.depositAmount) : ''
    });
  };

  const closeEditCustomer = () => {
    setEditingCustomer(null);
    setDraftCustomer({
      address: '',
      note: '',
      identityType: 'KTP',
      identityNumber: '',
      depositAmount: ''
    });
  };

  const handleSaveCustomer = async (event) => {
    event.preventDefault();
    if (!editingCustomer) return;

    await onUpdateCustomer({
      ...editingCustomer,
      address: draftCustomer.address,
      note: draftCustomer.note,
      identityType: draftCustomer.identityType,
      identityNumber: draftCustomer.identityNumber,
      depositAmount: draftCustomer.depositAmount ? Number(draftCustomer.depositAmount) : 0
    });

    closeEditCustomer();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
      <div className="brand-gradient hidden rounded-[24px] p-4 text-white shadow-soft md:block md:p-5">
        <div className="max-w-2xl">
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-white/80">Pelanggan</p>
          <h2 className="mt-3 text-lg font-bold leading-tight sm:text-2xl md:text-3xl">Data pelanggan dan pola kunjungan tersusun rapi</h2>
          <p className="mt-3 text-xs text-white/90 sm:text-sm md:text-base">
            Pantau pelanggan aktif, nilai transaksi, deposit, dan riwayat terakhir tanpa perlu membuka nota satu per satu.
          </p>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[20px] bg-white/10 border border-white/20 p-3 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Pelanggan unik</p>
            <p className="mt-2 text-lg font-black sm:text-2xl">{enrichedCustomers.length}</p>
          </div>
          <div className="rounded-[20px] bg-white/10 border border-white/20 p-3 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Pelanggan kembali</p>
            <p className="mt-2 text-lg font-black sm:text-2xl">{repeatCustomers}</p>
          </div>
          <div className="rounded-[20px] bg-white/10 border border-white/20 p-3 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Pelanggan aktif</p>
            <p className="mt-2 text-lg font-black sm:text-2xl">{activeCustomerCount}</p>
          </div>
          <div className="rounded-[20px] bg-white/10 border border-white/20 p-3 backdrop-blur-sm">
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Total deposit</p>
            <p className="mt-2 text-lg font-black sm:text-2xl">{formatCurrency(totalDeposit)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.05fr_0.95fr] xl:gap-4">
        <div className="pos-card sticky top-0 z-20 p-3 md:static md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-500">Daftar pelanggan</p>
              <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg sm:font-black">Cari nama, telepon, atau alamat</h3>
            </div>
            <div className={`flex flex-wrap gap-2 ${searchTerm ? 'hidden md:flex' : ''}`}>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCustomerPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 sm:rounded-[18px] sm:px-4 sm:py-3 sm:text-sm"
              >
                <option value="terbaru">Terbaru</option>
                <option value="terbanyak">Terbanyak transaksi</option>
                <option value="nilai">Nilai terbesar</option>
                <option value="alphabet">A-Z</option>
              </select>
            </div>
          </div>

          <div className="mt-4 hidden md:block relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari pelanggan"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCustomerPage(1);
              }}
              className="w-full rounded-[18px] border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm font-medium text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
              {customerStartNumber}-{customerEndNumber} dari {filteredCustomers.length} pelanggan
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
              Halaman {safeCustomerPage}/{customerPageCount}
            </span>
          </div>

          {filteredCustomers.length > CUSTOMERS_PER_PAGE && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50 p-2">
              <button
                type="button"
                onClick={() => setCustomerPage(page => Math.max(1, page - 1))}
                disabled={safeCustomerPage === 1}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-white text-slate-700 disabled:opacity-40"
                aria-label="Halaman pelanggan sebelumnya"
              >
                <ChevronLeft size={18} strokeWidth={3} />
              </button>
              <p className="text-sm font-black text-slate-900">{safeCustomerPage}/{customerPageCount}</p>
              <button
                type="button"
                onClick={() => setCustomerPage(page => Math.min(customerPageCount, page + 1))}
                disabled={safeCustomerPage === customerPageCount}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] bg-white text-slate-700 disabled:opacity-40"
                aria-label="Halaman pelanggan berikutnya"
              >
                <ChevronRight size={18} strokeWidth={3} />
              </button>
            </div>
          )}

          <div className="mt-3 space-y-2.5 sm:mt-4 sm:space-y-3">
            {filteredCustomers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 sm:rounded-[22px] sm:p-8">
                Tidak ada pelanggan sesuai pencarian.
              </div>
            ) : paginatedCustomers.map(customer => (
              <div key={customer.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[22px] sm:p-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm font-semibold text-slate-900 sm:font-black">{customer.name}</p>
                    <p className="mt-1 break-words text-xs text-slate-500 sm:text-sm">{customer.phone || 'Nomor telepon tidak tersedia'}</p>
                    <p className="mt-1 break-words text-xs text-slate-500">{customer.address || 'Alamat belum dicatat'}</p>
                  </div>
                  <div className="text-right">
                    <p className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700 sm:px-3 sm:text-[11px]">{customer.visitCount} kunjungan</p>
                    <p className="mt-1.5 text-sm font-semibold text-slate-900 sm:mt-2 sm:font-black">{formatCurrency(customer.totalSpend)}</p>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-3 sm:gap-3">
                  <div className="rounded-xl bg-slate-50 px-3 py-2 sm:rounded-[18px]">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 sm:text-[11px] sm:tracking-[0.2em]">Terakhir</p>
                    <p className="mt-1 text-xs font-bold text-slate-900 sm:text-sm">{customer.lastRentDate ? formatDate(customer.lastRentDate) : 'Belum ada'}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 sm:rounded-[18px]">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 sm:text-[11px] sm:tracking-[0.2em]">Deposit</p>
                    <p className="mt-1 text-xs font-bold text-slate-900 sm:text-sm">{formatCurrency(customer.depositAmount)}</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 sm:rounded-[18px]">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500 sm:text-[11px] sm:tracking-[0.2em]">Status</p>
                    <p className="mt-1 text-xs font-bold text-emerald-700 sm:text-sm">{customer.pendingReturns > 0 ? 'Aktif' : 'Rutin'}</p>
                  </div>
                </div>

                {customer.note && (
                  <p className="mt-3 break-words text-sm text-slate-600">Catatan: {customer.note}</p>
                )}

                <div className="mt-3 flex flex-wrap gap-2 sm:mt-4">
                  <button
                    type="button"
                    onClick={() => openEditCustomer(customer)}
                    className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 sm:rounded-[16px] sm:px-4 sm:text-sm"
                  >
                    Ubah data pelanggan
                  </button>
                  <span className="rounded-[16px] bg-slate-100 px-3 py-2 text-[11px] font-bold text-slate-600">
                    {customer.recentTransactions.length} transaksi terdokumentasi
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden gap-4 md:grid">
          <div className="pos-card p-3 sm:p-5">
            <p className="text-sm font-semibold text-slate-500">Pelanggan utama</p>
            <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg sm:font-black">Pelanggan prioritas</h3>
            <div className="mt-4 space-y-3">
              {filteredCustomers.slice(0, 5).map(customer => (
                <div key={customer.id} className="rounded-2xl bg-slate-50 px-3 py-2.5 sm:rounded-[18px] sm:px-4 sm:py-3">
                  <p className="font-bold text-slate-900">{customer.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{customer.visitCount} kunjungan - {formatCurrency(customer.totalSpend)}</p>
                </div>
              ))}
              {filteredCustomers.length === 0 && (
                <p className="text-sm text-slate-500">Pilih filter atau cari pelanggan untuk melihat profil.</p>
              )}
            </div>
          </div>

          <div className="pos-card p-3 sm:p-5">
            <p className="text-sm font-semibold text-slate-500">Informasi identitas</p>
            <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg sm:font-black">Data penting pelanggan</h3>
            <div className="mt-4 space-y-3">
              {filteredCustomers.slice(0, 5).map(customer => (
                <div key={customer.id} className="rounded-2xl border border-slate-100 bg-white p-3 sm:rounded-[18px] sm:p-4">
                  <p className="font-bold text-slate-900">{customer.name}</p>
                  <p className="mt-2 text-sm text-slate-500">{customer.identityType || 'KTP'}: {customer.identityNumber || '-'}</p>
                  <p className="mt-1 text-sm text-slate-500">Telepon: {customer.phone || '-'}</p>
                </div>
              ))}
              {filteredCustomers.length === 0 && (
                <p className="text-sm text-slate-500">Belum ada pelanggan yang bisa ditampilkan dalam panel ini.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {editingCustomer && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-[28px] w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 bg-blue-900 text-white flex justify-between items-center border-b border-blue-800">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-100">Perbarui data pelanggan</p>
                <h3 className="mt-2 text-lg font-black">{editingCustomer.name}</h3>
              </div>
              <button type="button" onClick={closeEditCustomer} className="p-2 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveCustomer} className="p-5 md:p-6 bg-slate-50 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[20px] bg-white border border-slate-100 p-4">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Jenis identitas</label>
                  <select
                    value={draftCustomer.identityType}
                    onChange={(event) => setDraftCustomer(prev => ({ ...prev, identityType: event.target.value }))}
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                  >
                    <option value="KTP">KTP</option>
                    <option value="SIM">SIM</option>
                    <option value="Kartu Pelajar">Kartu Pelajar</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="rounded-[20px] bg-white border border-slate-100 p-4">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Nomor identitas</label>
                  <input
                    value={draftCustomer.identityNumber}
                    onChange={(event) => setDraftCustomer(prev => ({ ...prev, identityNumber: event.target.value }))}
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="rounded-[20px] bg-white border border-slate-100 p-4">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Alamat</label>
                <textarea
                  rows="3"
                  value={draftCustomer.address}
                  onChange={(event) => setDraftCustomer(prev => ({ ...prev, address: event.target.value }))}
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 resize-none"
                />
              </div>

              <div className="rounded-[20px] bg-white border border-slate-100 p-4">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Catatan pelanggan</label>
                <textarea
                  rows="3"
                  value={draftCustomer.note}
                  onChange={(event) => setDraftCustomer(prev => ({ ...prev, note: event.target.value }))}
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 resize-none"
                />
              </div>

              <div className="rounded-[20px] bg-white border border-slate-100 p-4">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Deposit / Jaminan</label>
                <input
                  type="text"
                  value={formatNumberDot(draftCustomer.depositAmount)}
                  onChange={(event) => setDraftCustomer(prev => ({ ...prev, depositAmount: event.target.value.replace(/[^0-9]/g, '') }))}
                  placeholder="Rp 0"
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeEditCustomer}
                  className="rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-[16px] bg-blue-800 px-5 py-3 text-sm font-bold text-white hover:bg-blue-900"
                >
                  Simpan perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
