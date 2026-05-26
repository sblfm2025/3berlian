import { useState, useMemo, useCallback } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, X, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { formatCurrency, formatNumberDot } from '../utils/format';
import { checkProductAvailability, BOOKING_STATUS, isDateOverlap } from '../repositories/bookingRepository';

export default function BookingPage({
  products,
  transactions,
  bookings,
  onCreateBooking,
  onCancelBooking,
  onNavigate,
  operatorId,
  onNotify
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(() => new Date().toISOString().split('T')[0]);
  const [cancelDialog, setCancelDialog] = useState({ isOpen: false, bookingId: '', reason: '' });

  // Form Booking Baru dengan Purity-Safe Lazy Initialization
  const [formData, setFormData] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const threeDaysLater = new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return {
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      productId: '',
      qty: 1,
      startDate: today,
      endDate: threeDaysLater,
      depositPaid: '',
      notes: ''
    };
  });

  // Kalender Bulan
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const m = month === 0 ? 11 : month - 1;
      const y = month === 0 ? year - 1 : year;
      days.push({ day: d, month: m, year: y, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, month, year, isCurrentMonth: true });
    }
    const totalSlots = days.length <= 35 ? 35 : 42;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      const m = month === 11 ? 0 : month + 1;
      const y = month === 11 ? year + 1 : year;
      days.push({ day: i, month: m, year: y, isCurrentMonth: false });
    }
    return days;
  }, [year, month, daysInMonth, firstDayIndex]);

  // Dapatkan daftar transaksi & booking aktif di tanggal tertentu secara useCallback agar pure
  const getEventsForDate = useCallback((y, m, d) => {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const activeRentals = transactions.filter(trx => {
      const isActive = ['rented', 'disewa', 'overdue', 'ACTIVE_RENTAL', 'RETURNED_PARTIAL', 'OVERDUE'].includes(trx.status);
      if (!isActive) return false;
      return isDateOverlap(trx.rentedAt || trx.rentDate, trx.expectedReturnDate, dateStr, dateStr);
    });

    const activeBookings = bookings.filter(book => {
      const isReserved = [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING].includes(book.status);
      if (!isReserved) return false;
      return isDateOverlap(book.startDate, book.endDate, dateStr, dateStr);
    });

    return { rentals: activeRentals, bookings: activeBookings };
  }, [transactions, bookings]);

  // Hitung ketersediaan stok dinamis pada form booking
  const selectedProduct = useMemo(() => {
    return products.find(p => p.id === formData.productId);
  }, [products, formData.productId]);

  const availableStockForForm = useMemo(() => {
    if (!selectedProduct || !formData.startDate || !formData.endDate) return 0;
    return checkProductAvailability(selectedProduct, transactions, bookings, formData.startDate, formData.endDate);
  }, [selectedProduct, formData.startDate, formData.endDate, transactions, bookings]);

  const isConflictDetected = useMemo(() => {
    if (!formData.productId) return false;
    return Number(formData.qty) > availableStockForForm;
  }, [formData.productId, formData.qty, availableStockForForm]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSelectDate = (y, m, d) => {
    setSelectedDateStr(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  };

  const handleOpenModal = () => {
    const endDefault = new Date(new Date(selectedDateStr).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFormData({
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      productId: products[0]?.id || '',
      qty: 1,
      startDate: selectedDateStr,
      endDate: endDefault,
      depositPaid: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSaveBooking = async (e) => {
    e.preventDefault();
    if (isConflictDetected) {
      onNotify?.({ title: 'Bentrok stok terdeteksi', message: 'Stok kostum pada tanggal tersebut tidak mencukupi.', type: 'error' });
      return;
    }

    const prod = products.find(p => p.id === formData.productId);
    const bookingPayload = {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerAddress: formData.customerAddress,
      startDate: formData.startDate,
      endDate: formData.endDate,
      depositPaid: Number(formData.depositPaid || 0),
      notes: formData.notes || '',
      status: BOOKING_STATUS.CONFIRMED,
      createdBy: operatorId,
      items: [
        {
          productId: formData.productId,
          productName: prod?.name || 'Kostum',
          qty: Number(formData.qty),
          rentPrice: prod?.rentPrice || 0,
          dailyLateFee: prod?.dailyLateFee || 50000,
          product: prod
        }
      ]
    };

    try {
      await onCreateBooking(bookingPayload);
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Konversi Booking ke Rental Sewa Kasir
  const handleProcessRental = (booking) => {
    const checkoutData = {
      bookingId: booking.id,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      customerAddress: booking.customerAddress,
      deposit: booking.depositPaid,
      items: booking.items?.map(item => ({
        id: item.productId,
        productId: item.productId,
        qty: item.qty,
        rentPrice: item.rentPrice,
        dailyLateFee: item.dailyLateFee,
        product: products.find(p => p.id === item.productId) || item.product
      }))
    };

    localStorage.setItem('checkout_booking_data', JSON.stringify(checkoutData));
    onNotify?.({ title: 'Booking dimuat', message: 'Data sewa berhasil dimuat ke kasir checkout.', type: 'success' });
    onNavigate('rent');
  };

  const handleCancelClick = (bookingId) => {
    setCancelDialog({ isOpen: true, bookingId, reason: '' });
  };

  const handleConfirmCancel = async () => {
    if (!cancelDialog.reason.trim()) return;
    try {
      await onCancelBooking(cancelDialog.bookingId, cancelDialog.reason);
      setCancelDialog({ isOpen: false, bookingId: '', reason: '' });
    } catch (err) {
      console.error(err);
    }
  };

  // Dapatkan daftar rincian sewa aktif dan booking di tanggal terpilih
  const selectedDateEvents = useMemo(() => {
    const parts = selectedDateStr.split('-');
    const y = Number(parts[0]);
    const m = Number(parts[1]) - 1;
    const d = Number(parts[2]);
    return getEventsForDate(y, m, d);
  }, [selectedDateStr, getEventsForDate]);

  return (
    <div className="max-w-7xl mx-auto space-y-3 sm:space-y-5">
      {/* HEADER UTAMA */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">Operasional</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-2xl">Kalender Booking & Ketersediaan</h2>
          <p className="mt-1.5 text-xs text-slate-600 sm:mt-2 sm:text-sm">
            Hindari bentrok penyewaan kostum dengan memantau jadwal sewa aktif dan pesanan di kalender visual.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
          className="rounded-xl bg-blue-800 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-950 transition active:scale-95 flex items-center justify-center gap-2 shadow-md sm:rounded-2xl sm:px-5 sm:py-3"
        >
          <Plus size={18} strokeWidth={3} />
          Buat Booking Baru
        </button>
      </div>

      <div className="grid gap-3 sm:gap-5 lg:grid-cols-[1.8fr_1.2fr]">
        {/* PANEL KIRI: KALENDER BULANAN */}
        <div className="rounded-[18px] border border-slate-200 bg-white p-3 shadow-sm space-y-3 sm:rounded-[28px] sm:p-5 sm:space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 sm:text-lg">
              {monthNames[month]} {year}
            </h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition active:scale-95 text-slate-600"
              >
                <ChevronLeft size={20} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 transition active:scale-95 text-slate-600"
              >
                <ChevronRight size={20} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* GRID HARI */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-semibold text-slate-400 uppercase tracking-[0.12em] pb-2 sm:text-xs sm:font-bold">
            <div>Min</div>
            <div>Sen</div>
            <div>Sel</div>
            <div>Rab</div>
            <div>Kam</div>
            <div>Jum</div>
            <div>Sab</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map((item, idx) => {
              const { rentals, bookings: dayBook } = getEventsForDate(item.year, item.month, item.day);
              const dateKey = `${item.year}-${String(item.month + 1).padStart(2, '0')}-${String(item.day).padStart(2, '0')}`;
              const isSelected = dateKey === selectedDateStr;
              const hasEvents = rentals.length > 0 || dayBook.length > 0;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectDate(item.year, item.month, item.day)}
                  className={`min-h-[64px] rounded-xl p-1.5 text-left border flex flex-col justify-between transition-all group sm:min-h-[75px] sm:rounded-[18px] sm:p-2 ${
                    !item.isCurrentMonth ? 'bg-slate-50/50 border-slate-100 text-slate-400' : 'bg-white border-slate-200 hover:border-blue-400 text-slate-900'
                  } ${isSelected ? 'ring-4 ring-blue-100 border-blue-600 bg-blue-50/30' : ''}`}
                >
                  <span className={`text-[11px] font-bold rounded-full h-6 w-6 flex items-center justify-center ${isSelected ? 'bg-blue-800 text-white' : 'text-slate-800'}`}>
                    {item.day}
                  </span>

                  {hasEvents && (
                    <div className="space-y-0.5 mt-1.5 w-full">
                      {rentals.length > 0 && (
                        <div className="bg-blue-100 text-blue-800 text-[9px] font-semibold px-1.5 py-0.5 rounded-[6px] truncate leading-normal">
                          {rentals.length} Disewa
                        </div>
                      )}
                      {dayBook.length > 0 && (
                        <div className="bg-amber-100 text-amber-800 text-[9px] font-semibold px-1.5 py-0.5 rounded-[6px] truncate leading-normal">
                          {dayBook.length} Booking
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* PANEL KANAN: RINCIAN AGENDA HARIAN */}
        <div className="rounded-[18px] border border-slate-200 bg-white p-3 shadow-sm space-y-3 sm:rounded-[28px] sm:p-5 sm:space-y-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <CalendarIcon size={18} />
            </span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px] sm:tracking-[0.15em]">Jadwal Harian</p>
              <h3 className="mt-0.5 text-sm font-bold text-slate-900 sm:text-base">
                Agenda {new Date(selectedDateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h3>
            </div>
          </div>

          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            {selectedDateEvents.rentals.length === 0 && selectedDateEvents.bookings.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs font-semibold text-slate-500 bg-slate-50/30 sm:p-8 sm:text-sm">
                Tidak ada agenda transaksi sewa atau booking aktif pada tanggal ini.
              </div>
            )}

            {/* SEWA AKTIF */}
            {selectedDateEvents.rentals.map(trx => (
              <div key={trx.id} className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 border-l-4 border-l-blue-600 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="bg-blue-600 text-white font-semibold text-[9px] px-1.5 py-0.5 rounded">DISEWA</span>
                    <p className="mt-1 text-sm font-bold text-slate-900">{trx.customerName || trx.customer?.name}</p>
                    <p className="text-xs font-bold text-slate-500">Invoice: {trx.id}</p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    {trx.items?.length || 0} Kostum
                  </span>
                </div>
                <div className="pt-2 border-t border-blue-100 flex justify-between text-xs font-bold text-slate-600">
                  <span>Kembali:</span>
                  <span>{new Date(trx.expectedReturnDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>
            ))}

            {/* BOOKINGS */}
            {selectedDateEvents.bookings.map(book => (
              <div key={book.id} className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 border-l-4 border-l-amber-500 space-y-2.5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="bg-amber-500 text-white font-semibold text-[9px] px-1.5 py-0.5 rounded">BOOKING</span>
                    <p className="mt-1 text-sm font-bold text-slate-900">{book.customerName}</p>
                    <p className="text-xs font-bold text-slate-500">Kode: {book.bookingNumber}</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    {book.items?.[0]?.qty || 1} Kostum
                  </span>
                </div>

                {book.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-2.5 items-center text-xs font-bold text-slate-700">
                    <Package size={14} className="text-slate-400" />
                    <span>{item.productName} ({item.qty} unit)</span>
                  </div>
                ))}

                <div className="pt-2 border-t border-amber-100 flex flex-wrap gap-2 justify-between items-center text-xs font-bold">
                  <span className="text-slate-500">DP: {formatCurrency(book.depositPaid || 0)}</span>
                  <div className="flex gap-1.5">
                    {book.status === BOOKING_STATUS.CONFIRMED && (
                      <button
                        type="button"
                        onClick={() => handleProcessRental(book)}
                        className="rounded-lg bg-blue-800 text-white hover:bg-blue-900 px-2.5 py-1 text-[11px] font-semibold shadow-sm transition"
                      >
                        Proses Sewa
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCancelClick(book.id)}
                      className="rounded-lg bg-red-50 text-red-700 hover:bg-red-100 p-1 text-[11px] font-bold border border-red-100"
                      title="Batalkan Booking"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FORM MODAL BOOKING BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-t-[22px] bg-white shadow-xl sm:rounded-[24px]">
            <div className="flex items-center justify-between bg-blue-900 px-5 py-4 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-blue-100">Booking</p>
                <h3 className="mt-1 text-base font-bold sm:text-lg">Buat Booking Kostum Baru</h3>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full bg-blue-800 p-2 hover:bg-blue-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBooking} className="max-h-[80vh] overflow-y-auto bg-slate-50 px-3 py-3 space-y-3 sm:px-5 sm:py-5 sm:space-y-4">
              <div className="rounded-[24px] bg-white p-4 border border-slate-100 space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Informasi Pelanggan</label>
                <input
                  required
                  placeholder="Nama Lengkap Pelanggan"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-300"
                />
                <input
                  required
                  type="tel"
                  placeholder="Nomor Whatsapp / HP"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-300"
                />
                <input
                  placeholder="Alamat Pelanggan (Opsional)"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-300"
                />
              </div>

              <div className="rounded-[24px] bg-white p-4 border border-slate-100 space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Pilih Kostum & Qty</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData(prev => ({ ...prev, productId: e.target.value }))}
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                >
                  <option value="" disabled>-- Pilih Kostum Adat --</option>
                  {products.filter(p => p.isActive !== false && p.status !== 'inactive').map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.size} - {formatCurrency(p.rentPrice)})
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-500 uppercase">Jumlah:</span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.qty}
                    onChange={(e) => setFormData(prev => ({ ...prev, qty: Math.max(1, Number(e.target.value)) }))}
                    className="w-24 rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-800 text-center"
                  />
                  {formData.productId && (
                    <span className="text-xs font-bold text-slate-400">
                      (Sisa Fisik: {selectedProduct?.availableStock || 0} unit)
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 rounded-[24px] bg-white p-4 border border-slate-100">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Mulai Booking</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Selesai Booking</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* LIVE BENTROK DETECTOR */}
              {formData.productId && (
                <div className={`rounded-[24px] p-4 border flex gap-3 items-start ${isConflictDetected ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                  {isConflictDetected ? (
                    <>
                      <AlertTriangle size={18} className="shrink-0 text-red-600 mt-0.5 animate-bounce" />
                      <div>
                        <p className="font-bold text-xs sm:text-sm">Bentrok Terdeteksi!</p>
                        <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-red-700">
                          Kostum adat ini telah di-booking/disewa pada rentang tanggal tersebut. Stok maksimal tersedia hanyalah **{availableStockForForm} unit**.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                      <div>
                        <p className="font-bold text-xs sm:text-sm">Stok Tersedia Aman</p>
                        <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-emerald-700">
                          Kostum adat ini siap disewa. Sisa kapasitas stok aman hingga **{availableStockForForm} unit** di tanggal terpilih.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="rounded-[24px] bg-white p-4 border border-slate-100 space-y-3">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Uang Muka / DP Booking</label>
                <input
                  type="text"
                  placeholder="Contoh: 100.000"
                  value={formatNumberDot(formData.depositPaid)}
                  onChange={(e) => setFormData(prev => ({ ...prev, depositPaid: e.target.value.replace(/[^0-9]/g, '') }))}
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-300"
                />

                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 pt-2">Catatan Khusus</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Tulis detail kostum (warna, aksesoris dll) atau catatan pengiriman"
                  rows="2"
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-800 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-[18px] border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isConflictDetected}
                  className="flex-1 rounded-xl bg-blue-800 py-2.5 text-sm font-semibold text-white disabled:opacity-50 sm:rounded-[18px] sm:py-3.5"
                >
                  Simpan Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG PEMBATALAN BOOKING WAJIB ALASAN */}
      {cancelDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-t-[22px] bg-white shadow-xl sm:rounded-[24px]">
            <div className="bg-red-900 px-5 py-4 text-white">
              <h3 className="text-base font-bold">Batalkan Booking Pemesanan?</h3>
              <p className="mt-1 text-xs text-red-200">Aksi ini tidak dapat dibatalkan kembali.</p>
            </div>
            <div className="p-3 space-y-3 sm:p-5 sm:space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Alasan Pembatalan (Wajib)</label>
                <textarea
                  required
                  value={cancelDialog.reason}
                  onChange={(e) => setCancelDialog(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Silakan tulis alasan pembatalan pemesanan booking ini..."
                  rows="3"
                  className="w-full rounded-[16px] border border-red-200 bg-red-50/20 px-4 py-3 text-sm font-semibold text-slate-800 resize-none focus:ring-2 focus:ring-red-100"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelDialog({ isOpen: false, bookingId: '', reason: '' })}
                  className="flex-1 rounded-[16px] border border-slate-200 bg-white py-3 text-xs font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={!cancelDialog.reason.trim()}
                  onClick={handleConfirmCancel}
                  className="flex-1 rounded-[16px] bg-red-700 py-3 text-xs font-semibold text-white hover:bg-red-800 disabled:opacity-50"
                >
                  Batalkan Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
