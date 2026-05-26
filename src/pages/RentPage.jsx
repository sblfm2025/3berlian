import { useState, useMemo, useEffect } from 'react';
import { QrCode } from 'lucide-react';
import { formatCurrency, formatDate, formatDateInput, formatNumberDot } from '../utils/format';
import { useCustomerSelection } from '../features/rental/hooks/useCustomerSelection';
import { usePaymentCalculation } from '../features/rental/hooks/usePaymentCalculation';
import { PRODUCTS_PER_PAGE, useProductFiltering } from '../features/rental/hooks/useProductFiltering';
import { useRentalCart } from '../features/rental/hooks/useRentalCart';
import { useRentalCheckout } from '../features/rental/hooks/useRentalCheckout';
import { getCustomerMissingFields } from '../features/rental/utils/rentalValidation';
import { useMobileSearchRegistration } from '../components/layout/useMobileSearch';

// Import Subkomponen Modular
import ProductCatalog from '../features/rental/components/ProductCatalog';
import CheckoutPanel from '../features/rental/components/CheckoutPanel';
import RentalMobileBar from '../features/rental/components/RentalMobileBar';

export default function RentPage({ products, customers, transactions = [], onCheckout, onNotify }) {
  const [showMobileCheckout, setShowMobileCheckout] = useState(false);
  const [depositAmountInput, setDepositAmountInput] = useState('');
  const [qrScanInput, setQrScanInput] = useState('');
  const [activeStep, setActiveStep] = useState(1); // 1: Katalog, 2: Keranjang, 3: Pelanggan, 4: Pembayaran

  const handleQrScanSubmit = (e) => {
    e.preventDefault();
    if (!qrScanInput.trim()) return;

    const scannedCode = qrScanInput.trim().toUpperCase();
    setQrScanInput('');

    const parts = scannedCode.split('-');
    if (parts.length >= 3) {
      const codePart = parts[0];
      const sizePart = parts[1];

      // Cari produk yang cocok di katalog
      const foundProduct = products.find(p => {
        const pCode = (p.sku || p.id || '').toUpperCase();
        const nameClean = (p.name || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        return (pCode.includes(codePart) || nameClean.includes(codePart)) && String(p.size || '').toUpperCase() === sizePart;
      });

      if (foundProduct) {
        if (Number(foundProduct.availableStock || 0) <= 0) {
          onNotify?.({
            title: 'Stok Habis',
            message: `Kostum ${foundProduct.name} sedang tidak tersedia untuk disewa.`,
            type: 'warning'
          });
          return;
        }

        // Tambah ke keranjang sewa
        updateCartQty(foundProduct, 1);
        onNotify?.({
          title: 'Scan Unit Berhasil',
          message: `Unit ${scannedCode} (${foundProduct.name}) ditambahkan ke keranjang.`,
          type: 'success'
        });
      } else {
        onNotify?.({
          title: 'Kostum Tidak Ditemukan',
          message: `Kostum adat dengan kode "${codePart}" ukuran "${sizePart}" tidak terdaftar di katalog.`,
          type: 'error'
        });
      }
    } else {
      onNotify?.({
        title: 'Kode QR Tidak Valid',
        message: 'Gunakan format kode unit inventaris yang benar (e.g. BUGIS-L-001).',
        type: 'warning'
      });
    }
  };

  const {
    cart,
    clearCart,
    getStockIssue,
    removeCartItem,
    setCart,
    updateCartQty
  } = useRentalCart({
    onCartWarning: (message) => onNotify?.({ title: 'Stok belum cukup', message, type: 'warning' }),
    products,
    onEmptyCart: () => setShowMobileCheckout(false)
  });

  const {
    availableProducts,
    categories,
    categoryCounts,
    favoriteProducts,
    paginatedProducts,
    productEndNumber,
    productPageCount,
    productStartNumber,
    safeProductPage,
    search,
    selectedCategory,
    selectCategory,
    setProductPage,
    sortedProducts,
    updateSearch
  } = useProductFiltering({ products, transactions, cart });

  const mobileSearchConfig = useMemo(() => ({
    placeholder: 'Cari kostum, kategori, ukuran',
    value: search,
    onChange: updateSearch
  }), [search, updateSearch]);
  useMobileSearchRegistration(mobileSearchConfig);

  const {
    cashPresets,
    cashReceived,
    changeAmount,
    depositAmount,
    discountAmount,
    discountType,
    discountValue,
    finalCashReceived,
    grandTotal,
    paymentMethod,
    setCashReceived,
    setDiscountType,
    setDiscountValue,
    setPaymentMethod,
    subTotal,
    totalItems
  } = usePaymentCalculation({ cart, depositAmountInput });

  const {
    applyCustomer,
    applyLastTransaction,
    customerAddressInput,
    customerIdentityNumber,
    customerIdentityType,
    customerNameInput,
    customerNoteInput,
    customerPhoneInput,
    defaultDateStr,
    favoriteCustomers,
    filteredCustomers,
    lastCompletedTransaction,
    recentCustomers,
    resetAfterCheckout,
    resetCustomer,
    returnDateInput,
    setCustomerAddressInput,
    setCustomerIdentityNumber,
    setCustomerIdentityType,
    setCustomerNameInput,
    setCustomerNoteInput,
    setCustomerPhoneInput,
    setReturnDateInput,
    setShowSuggestions,
    showSuggestions
  } = useCustomerSelection({
    customers,
    transactions,
    products,
    cart,
    depositAmountInput,
    onCustomerWarning: (message, title = 'Transaksi cepat belum tersedia') => onNotify?.({ title, message, type: 'warning' }),
    setCart,
    setPaymentMethod,
    setDiscountType,
    setDiscountValue,
    setCashReceived,
    setDepositAmountInput,
    openCheckout: () => setShowMobileCheckout(true)
  });

  const lowStockCount = products.filter(product => product.stock > 0 && product.stock <= 2).length;
  const currentDate = formatDateInput();
  const customerMissingFields = getCustomerMissingFields({ customerPhoneInput, customerAddressInput, customerIdentityNumber });
  const customerProfileReady = customerMissingFields.length === 0;

  const flowSteps = [
    { label: 'Pilih barang', done: cart.length > 0 },
    { label: 'Lengkapi pelanggan', done: customerNameInput.trim().length > 0 && customerProfileReady },
    { label: 'Bayar & cetak nota', done: paymentMethod !== 'Tunai' || finalCashReceived >= grandTotal }
  ];
  const nextFlowStep = flowSteps.find(step => !step.done)?.label || 'Pembayaran siap';

  const paymentSummaryLabel = totalItems === 0
    ? 'Tambah barang untuk mulai transaksi'
    : paymentMethod === 'Tunai'
      ? finalCashReceived >= grandTotal
        ? 'Uang diterima cukup'
        : 'Uang diterima masih kurang'
      : 'Pembayaran non-tunai siap diproses';

  const checkoutChecklist = [
    { label: 'Keranjang tidak kosong', ok: cart.length > 0 },
    { label: 'Pelanggan terisi', ok: customerNameInput.trim().length > 0 },
    { label: 'Data pelanggan lengkap', ok: customerProfileReady },
    { label: 'Tanggal kembali valid', ok: Boolean(returnDateInput && new Date(returnDateInput) >= new Date(currentDate)) },
    { label: 'Stok aman', ok: getStockIssue().length === 0 },
    { label: 'Pembayaran cukup', ok: paymentMethod !== 'Tunai' || grandTotal === 0 || finalCashReceived >= grandTotal }
  ];

  const { handleCheckoutClick, isCheckingOut } = useRentalCheckout({
    cart,
    changeAmount,
    clearCart,
    customerAddressInput,
    customerIdentityNumber,
    customerIdentityType,
    customerNameInput,
    customerNoteInput,
    customerPhoneInput,
    customers,
    depositAmount,
    discountAmount,
    finalCashReceived,
    getStockIssue,
    grandTotal,
    onCheckout,
    onValidationError: (errors) => onNotify?.({
      title: 'Belum bisa checkout',
      message: errors.slice(0, 3).join(' '),
      type: 'warning'
    }),
    paymentMethod,
    resetCustomerAfterCheckout: resetAfterCheckout,
    returnDateInput,
    setCashReceived,
    setDiscountValue,
    setPaymentMethod,
    subTotal
  });

  // Mengambil data booking otomatis untuk di-checkout jika ada di localStorage
  useEffect(() => {
    const bookingJson = localStorage.getItem('checkout_booking_data');
    if (bookingJson) {
      try {
        const booking = JSON.parse(bookingJson);
        window.setTimeout(() => {
          if (booking.items && booking.items.length > 0) {
            setCart(booking.items);
          }
          if (booking.customerName) {
            setCustomerNameInput(booking.customerName);
          }
          if (booking.customerPhone) {
            setCustomerPhoneInput(booking.customerPhone);
          }
          if (booking.customerAddress) {
            setCustomerAddressInput(booking.customerAddress);
          }
          if (booking.deposit) {
            setDepositAmountInput(String(booking.deposit));
          }

          // Simpan referensi bookingId di localStorage agar dibaca saat checkout sukses
          if (booking.bookingId) {
            localStorage.setItem('checkout_active_booking_id', booking.bookingId);
          }

          onNotify?.({
            title: 'Booking kostum dimuat',
            message: `Data booking milik ${booking.customerName} telah terisi otomatis di form kasir.`,
            type: 'success'
          });
        }, 0);
      } catch (err) {
        console.error('Gagal memuat data booking dari localStorage:', err);
      } finally {
        localStorage.removeItem('checkout_booking_data');
      }
    }
  }, [setCart, setCustomerNameInput, setCustomerPhoneInput, setCustomerAddressInput, setDepositAmountInput, onNotify]);

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-3">
      {/* POS Header Banner */}
      <div className="brand-gradient hidden rounded-[24px] p-4 text-white shadow-soft md:block md:p-5">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-white/80">POS kasir</p>
            <h2 className="mt-3 text-lg sm:text-2xl md:text-3xl font-bold leading-tight">Terminal sewa kostum yang cepat, rapi, dan siap transaksi</h2>
            <p className="mt-3 text-xs sm:text-sm md:text-base text-white/90">
              Cari produk, tambahkan ke keranjang, pilih pelanggan, dan selesaikan pembayaran dengan tata letak kasir modern untuk desktop maupun tablet.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 lg:min-w-[320px]">
            <div className="rounded-[20px] bg-white/10 border border-white/20 p-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Item keranjang</p>
              <p className="mt-2 text-lg sm:text-2xl font-black">{totalItems}</p>
            </div>
            <div className="rounded-[20px] bg-white/10 border border-white/20 p-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Produk ready</p>
              <p className="mt-2 text-lg sm:text-2xl font-black">{products.filter(product => product.stock > 0).length}</p>
            </div>
            <div className="rounded-[20px] bg-white/10 border border-white/20 p-3 backdrop-blur-sm sm:col-span-1 col-span-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Stok menipis</p>
              <p className="mt-2 text-lg sm:text-2xl font-black">{lowStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* POS Quick Metrics */}
      {/* PANEL SCANNER BARCODE/QR SECARA OFFLINE */}
      <div className="rounded-[24px] border border-slate-200 bg-white p-4.5 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-blue-900 flex items-center gap-1.5"><QrCode size={18} className="text-amber-500 animate-pulse" /> Pemindaian QR/Barcode Kostum</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Tembak scanner QR hardware Anda atau ketik manual kode unit fisik untuk checkout cepat.</p>
          </div>
          <form onSubmit={handleQrScanSubmit} className="flex gap-2 max-w-md w-full shrink-0">
            <input
              type="text"
              value={qrScanInput}
              onChange={(e) => setQrScanInput(e.target.value)}
              placeholder="Fokus kursor & scan QR (e.g. BUGIS-L-001)..."
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-800 placeholder-slate-400 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 transition"
            />
            <button
              type="submit"
              className="rounded-2xl bg-blue-800 hover:bg-blue-900 text-white px-4 py-2.5 text-xs font-black shadow-sm flex items-center gap-1 transition"
            >
              Proses
            </button>
          </form>
        </div>
      </div>

      <div className="hidden gap-3 sm:grid-cols-2 md:grid xl:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Pelanggan</p>
          <p className="mt-2 text-sm font-black text-slate-900">{customerNameInput || 'Belum diisi'}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Tanggal kembali</p>
          <p className="mt-2 text-sm font-black text-slate-900">{formatDate(returnDateInput || defaultDateStr)}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Pembayaran</p>
          <p className="mt-2 text-sm font-black text-slate-900">{paymentMethod}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Deposit</p>
          <p className="mt-2 text-sm font-black text-slate-900">{depositAmount > 0 ? formatCurrency(depositAmount) : 'Tidak ada'}</p>
        </div>
      </div>

      {/* POS Quick Flow Steps */}
      <div className="hidden rounded-[20px] border border-blue-200 bg-white p-4 shadow-sm md:block">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Alur transaksi cepat</p>
            <p className="mt-1 text-sm font-bold text-slate-700">Langkah berikutnya: {nextFlowStep}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {flowSteps.map((step, index) => (
              <span
                key={step.label}
                className={`rounded-full px-3 py-1 text-[11px] font-bold ${step.done ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
              >
                {index + 1}. {step.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* POS Inventory Safety Warnings */}
      <div className="hidden gap-3 md:grid xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">Stok menipis</p>
              <p className="mt-2 text-sm font-black text-slate-900">{lowStockCount} produk butuh perhatian</p>
            </div>
            <button
              type="button"
              onClick={() => selectCategory('Semua')}
              className="rounded-[16px] bg-amber-500 px-3 py-2 text-xs font-bold text-slate-900"
            >
              Tampilkan semua
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {products.filter(product => product.stock > 0 && product.stock <= 2).slice(0, 4).map(product => (
              <span key={product.id} className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-amber-800">
                {product.name}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-blue-200 bg-blue-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">Ringkasan keranjang</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-blue-800">{totalItems} item</span>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-blue-800">{formatCurrency(subTotal)}</span>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-blue-800">{discountAmount > 0 ? `Diskon ${formatCurrency(discountAmount)}` : 'Tanpa diskon'}</span>
          </div>
          <p className="mt-3 text-sm text-slate-700">Gunakan tombol pembayaran di bagian bawah jika keranjang sudah siap diverifikasi.</p>
        </div>
      </div>

      {/* POS Stock Category Breakdown */}
      <div className="hidden rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:block">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Stok per kategori</p>
            <p className="mt-1 text-sm font-bold text-slate-700">Ringkasan cepat untuk menjaga inventaris tetap seimbang.</p>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-700">{categories.length - 1} kategori</span>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {categories.filter(category => category !== 'Semua').map(category => {
            const categoryProducts = products.filter(product => product.category === category);
            const available = categoryProducts.filter(product => product.stock > 0).length;
            const lowStock = categoryProducts.filter(product => product.stock > 0 && product.stock <= 2).length;
            return (
              <div key={category} className="rounded-[20px] bg-slate-50 px-4 py-3 border border-slate-100">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{category}</p>
                <p className="mt-2 text-lg font-black text-slate-900">{available} tersedia</p>
                <p className="mt-1 text-sm text-slate-500">{lowStock} menipis - {categoryProducts.length} total</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stepper Indicator - Hanya Tampil di Mobile */}
      <div className="md:hidden bg-white border border-slate-200 p-4 rounded-2xl mb-1 shadow-sm">
        <div className="flex justify-between w-full relative">
          <div className="absolute top-4 left-4 right-4 h-[2px] bg-slate-100 z-0" />
          <div
            className="absolute top-4 left-4 h-[2px] bg-emerald-900 z-0 transition-all duration-300"
            style={{ width: `calc(${((activeStep - 1) / 3) * 100}% - 8px)` }}
          />

          {[
            { step: 1, label: 'Katalog' },
            { step: 2, label: 'Keranjang' },
            { step: 3, label: 'Pelanggan' },
            { step: 4, label: 'Bayar' }
          ].map(s => (
            <button
              key={s.step}
              type="button"
              onClick={() => {
                if (s.step === 2 && cart.length === 0) {
                  onNotify?.({ title: 'Keranjang Kosong', message: 'Silakan pilih kostum terlebih dahulu.', type: 'warning' });
                  return;
                }
                if (s.step === 3 && cart.length === 0) {
                  onNotify?.({ title: 'Keranjang Kosong', message: 'Silakan pilih kostum terlebih dahulu.', type: 'warning' });
                  return;
                }
                if (s.step === 4 && !customerNameInput?.trim()) {
                  onNotify?.({ title: 'Pelanggan Kosong', message: 'Isi nama pelanggan terlebih dahulu.', type: 'warning' });
                  return;
                }
                setActiveStep(s.step);
                if (s.step > 1) {
                  setShowMobileCheckout(true);
                } else {
                  setShowMobileCheckout(false);
                }
              }}
              className="relative z-10 flex flex-col items-center gap-1.5 focus:outline-none"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all duration-300 ${
                activeStep === s.step
                  ? 'bg-emerald-950 border-emerald-950 text-white shadow-md scale-110'
                  : activeStep > s.step
                    ? 'bg-white border-emerald-900 text-emerald-900 font-extrabold'
                    : 'bg-white border-slate-200 text-slate-400'
              }`}>
                {s.step}
              </div>
              <span className={`text-[9px] font-bold tracking-tight uppercase ${activeStep === s.step ? 'text-emerald-950 font-extrabold' : 'text-slate-400'}`}>{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main POS Interface (Catalog Left, Checkout Panel Right) */}
      <div className="flex flex-col xl:flex-row gap-4 xl:items-start">
        <div className={`${activeStep === 1 ? 'block' : 'hidden'} md:block flex-1`}>
          <ProductCatalog
            search={search}
            updateSearch={updateSearch}
            categories={categories}
            selectedCategory={selectedCategory}
            selectCategory={selectCategory}
            favoriteProducts={favoriteProducts}
            updateCartQty={updateCartQty}
            cart={cart}
            lastCompletedTransaction={lastCompletedTransaction}
            applyLastTransaction={applyLastTransaction}
            totalItems={totalItems}
            subTotal={subTotal}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
            paymentMethod={paymentMethod}
            clearCart={clearCart}
            categoryCounts={categoryCounts}
            availableProducts={availableProducts}
            paginatedProducts={paginatedProducts}
            safeProductPage={safeProductPage}
            productPageCount={productPageCount}
            productStartNumber={productStartNumber}
            productEndNumber={productEndNumber}
            sortedProducts={sortedProducts}
            setProductPage={setProductPage}
            PRODUCTS_PER_PAGE={PRODUCTS_PER_PAGE}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
          />
        </div>

        <CheckoutPanel
          activeStep={activeStep}
          showMobileCheckout={showMobileCheckout}
          setShowMobileCheckout={setShowMobileCheckout}
          paymentSummaryLabel={paymentSummaryLabel}
          totalItems={totalItems}
          grandTotal={grandTotal}
          paymentMethod={paymentMethod}
          checkoutChecklist={checkoutChecklist}
          customerNameInput={customerNameInput}
          setCustomerNameInput={setCustomerNameInput}
          setShowSuggestions={setShowSuggestions}
          showSuggestions={showSuggestions}
          filteredCustomers={filteredCustomers}
          applyCustomer={applyCustomer}
          resetCustomer={resetCustomer}
          customerMissingFields={customerMissingFields}
          favoriteCustomers={favoriteCustomers}
          recentCustomers={recentCustomers}
          customerPhoneInput={customerPhoneInput}
          setCustomerPhoneInput={setCustomerPhoneInput}
          customerIdentityType={customerIdentityType}
          setCustomerIdentityType={setCustomerIdentityType}
          customerIdentityNumber={customerIdentityNumber}
          setCustomerIdentityNumber={setCustomerIdentityNumber}
          returnDateInput={returnDateInput}
          setReturnDateInput={setReturnDateInput}
          customerAddressInput={customerAddressInput}
          setCustomerAddressInput={setCustomerAddressInput}
          customerNoteInput={customerNoteInput}
          setCustomerNoteInput={setCustomerNoteInput}
          depositAmountInput={depositAmountInput}
          setDepositAmountInput={setDepositAmountInput}
          cart={cart}
          removeCartItem={removeCartItem}
          updateCartQty={updateCartQty}
          discountType={discountType}
          setDiscountType={setDiscountType}
          setDiscountValue={setDiscountValue}
          discountValue={discountValue}
          setPaymentMethod={setPaymentMethod}
          cashReceived={cashReceived}
          setCashReceived={setCashReceived}
          cashPresets={cashPresets}
          finalCashReceived={finalCashReceived}
          changeAmount={changeAmount}
          subTotal={subTotal}
          discountAmount={discountAmount}
          depositAmount={depositAmount}
          handleCheckoutClick={handleCheckoutClick}
          isCheckingOut={isCheckingOut}
          getStockIssue={getStockIssue}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
          formatDateInput={formatDateInput}
          formatNumberDot={formatNumberDot}
        />
      </div>

      {/* Mobile Nav Sticky Checkout Info */}
      <RentalMobileBar
        activeStep={activeStep}
        setActiveStep={setActiveStep}
        totalItems={totalItems}
        grandTotal={grandTotal}
        customerNameInput={customerNameInput}
        customerProfileReady={customerProfileReady}
        paymentMethod={paymentMethod}
        setShowMobileCheckout={setShowMobileCheckout}
        formatCurrency={formatCurrency}
        handleCheckoutClick={handleCheckoutClick}
        isCheckingOut={isCheckingOut}
        getStockIssue={getStockIssue}
        finalCashReceived={finalCashReceived}
        onNotify={onNotify}
      />
    </div>
  );
}
