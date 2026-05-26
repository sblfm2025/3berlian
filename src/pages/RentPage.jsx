import { useState, useMemo } from 'react';
import { Package, Plus, Minus, Search, CheckCircle, AlertCircle, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDate, formatDateInput, formatNumberDot } from '../utils/format';
import { createInvoiceNumber } from '../utils/invoice';

const PRODUCTS_PER_PAGE = 20;

// ==========================================
export default function RentPage({ products, customers, transactions = [], onCheckout }) {
  const [cart, setCart] = useState([]);
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [customerPhoneInput, setCustomerPhoneInput] = useState('');
  const [customerAddressInput, setCustomerAddressInput] = useState('');
  const [customerNoteInput, setCustomerNoteInput] = useState('');
  const [customerIdentityType, setCustomerIdentityType] = useState('KTP');
  const [customerIdentityNumber, setCustomerIdentityNumber] = useState('');
  const [depositAmountInput, setDepositAmountInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = formatDateInput(tomorrow);
  const [returnDateInput, setReturnDateInput] = useState(defaultDateStr);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [showMobileCheckout, setShowMobileCheckout] = useState(false);
  const [discountType, setDiscountType] = useState('nominal');
  const [discountValue, setDiscountValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [cashReceived, setCashReceived] = useState('');
  const [productPage, setProductPage] = useState(1);

  const categories = useMemo(() => {
    return ['Semua', ...new Set(products.map(product => product.category).filter(Boolean))];
  }, [products]);

  const availableProducts = useMemo(() => products.filter(product => {
    const productText = [
      product.name,
      product.sku,
      product.category,
      product.size,
      product.color
    ].filter(Boolean).join(' ').toLowerCase();
    const matchesSearch = productText.includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    return product.stock > 0 && matchesSearch && matchesCategory;
  }), [products, search, selectedCategory]);

  const categoryCounts = useMemo(() => {
    return categories.filter(category => category !== 'Semua').map(category => ({
      category,
      count: products.filter(product => product.category === category && product.stock > 0).length
    }));
  }, [categories, products]);

  const sortedProducts = useMemo(() => {
    return [...availableProducts].sort((a, b) => {
      const aSelected = cart.some(item => item.product.id === a.id);
      const bSelected = cart.some(item => item.product.id === b.id);
      if (aSelected !== bSelected) return aSelected ? -1 : 1;
      if (a.stock !== b.stock) return b.stock - a.stock;
      return a.name.localeCompare(b.name);
    });
  }, [availableProducts, cart]);

  const productPageCount = Math.max(1, Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE));
  const safeProductPage = Math.min(productPage, productPageCount);
  const paginatedProducts = sortedProducts.slice(
    (safeProductPage - 1) * PRODUCTS_PER_PAGE,
    safeProductPage * PRODUCTS_PER_PAGE
  );
  const productStartNumber = sortedProducts.length === 0 ? 0 : ((safeProductPage - 1) * PRODUCTS_PER_PAGE) + 1;
  const productEndNumber = Math.min(safeProductPage * PRODUCTS_PER_PAGE, sortedProducts.length);

  const favoriteProducts = useMemo(() => {
    const demand = transactions.reduce((acc, trx) => {
      (trx.items || []).forEach(item => {
        const productId = item.product?.id || item.product?.name;
        if (!productId) return;
        acc[productId] = (acc[productId] || 0) + (item.qty || 0);
      });
      return acc;
    }, {});

    return products
      .filter(product => product.stock > 0)
      .sort((a, b) => {
        const aDemand = demand[a.id] || 0;
        const bDemand = demand[b.id] || 0;
        if (aDemand !== bDemand) return bDemand - aDemand;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 5);
  }, [products, transactions]);

  const lastCompletedTransaction = useMemo(() => {
    return [...transactions]
      .filter(transaction => Array.isArray(transaction.items) && transaction.items.length > 0)
      .sort((a, b) => {
        const aDate = new Date(a.rentDate || a.expectedReturnDate || 0).getTime();
        const bDate = new Date(b.rentDate || b.expectedReturnDate || 0).getTime();
        return bDate - aDate;
      })[0];
  }, [transactions]);

  const filteredCustomers = customers
    .filter(c => c.name.toLowerCase().includes(customerNameInput.toLowerCase()) && customerNameInput.length > 0)
    .slice(0, 6);
  const recentCustomers = useMemo(() => {
    return [...customers]
      .filter(customer => customer?.name)
      .sort((a, b) => new Date(b.lastRentDate || 0) - new Date(a.lastRentDate || 0))
      .slice(0, 4);
  }, [customers]);

  const customerActivity = useMemo(() => {
    const counts = (transactions || []).reduce((acc, trx) => {
      const name = (trx.customerName || '').trim();
      if (!name) return acc;
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        customer: customers.find(customer => customer.name === name)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [customers, transactions]);

  const favoriteCustomers = useMemo(() => {
    return customerActivity
      .map(item => ({
        ...item.customer,
        name: item.name,
        count: item.count,
        source: 'favorit'
      }))
      .filter(item => item.name);
  }, [customerActivity]);

  const applyCustomer = (customer) => {
    setCustomerNameInput(customer.name || '');
    setCustomerPhoneInput(customer.phone || '');
    setCustomerAddressInput(customer.address || '');
    setCustomerNoteInput(customer.note || '');
    setCustomerIdentityType(customer.identityType || 'KTP');
    setCustomerIdentityNumber(customer.identityNumber || '');
    setDepositAmountInput(customer.depositAmount ? String(customer.depositAmount) : '');
    setShowSuggestions(false);
  };

  const applyLastTransaction = () => {
    if (!lastCompletedTransaction) {
      alert('Belum ada transaksi sebelumnya untuk diulang.');
      return;
    }

    const restoredItems = (lastCompletedTransaction.items || [])
      .map(item => {
        const currentProduct = products.find(product => product.id === item.product?.id);
        return currentProduct ? { product: currentProduct, qty: item.qty || 1 } : null;
      })
      .filter(Boolean);

    if (restoredItems.length === 0) {
      alert('Produk dari transaksi terakhir tidak tersedia untuk diulang.');
      return;
    }

    setCart(restoredItems);
    setCustomerNameInput(lastCompletedTransaction.customerName || '');
    setCustomerPhoneInput(lastCompletedTransaction.customerPhone || '');
    setCustomerAddressInput(lastCompletedTransaction.customerAddress || '');
    setCustomerNoteInput(lastCompletedTransaction.customerNote || '');
    setCustomerIdentityType(lastCompletedTransaction.customerIdentityType || 'KTP');
    setCustomerIdentityNumber(lastCompletedTransaction.customerIdentityNumber || '');
    setDepositAmountInput(lastCompletedTransaction.depositAmount ? String(lastCompletedTransaction.depositAmount) : '');
    setReturnDateInput(lastCompletedTransaction.expectedReturnDate || defaultDateStr);
    setPaymentMethod(lastCompletedTransaction.paymentMethod || 'Tunai');
    setCashReceived(lastCompletedTransaction.cashReceived ? String(lastCompletedTransaction.cashReceived) : '');
    setDiscountType('nominal');
    setDiscountValue('');
    setShowMobileCheckout(true);
  };

  const resetCustomer = () => {
    setCustomerNameInput('');
    setCustomerPhoneInput('');
    setCustomerAddressInput('');
    setCustomerNoteInput('');
    setCustomerIdentityType('KTP');
    setCustomerIdentityNumber('');
    setDepositAmountInput('');
    setShowSuggestions(false);
  };

  const getStockIssue = () => {
    return cart.reduce((issues, item) => {
      const latestProduct = products.find(product => product.id === item.product.id);
      if (!latestProduct) {
        issues.push({ item, reason: 'Produk tidak ditemukan' });
        return issues;
      }
      if (latestProduct.stock <= 0) {
        issues.push({ item, reason: 'Produk sudah habis' });
        return issues;
      }
      if (item.qty > latestProduct.stock) {
        issues.push({ item, reason: `Stok tersisa ${latestProduct.stock} unit` });
      }
      return issues;
    }, []);
  };

  const subTotal = cart.reduce((sum, item) => sum + (item.product.rentPrice * item.qty), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const rawDiscount = Number(discountValue) || 0;
  const discountAmount = discountType === 'percent' ? subTotal * (rawDiscount / 100) : rawDiscount;
  const depositAmount = Number(depositAmountInput) || 0;
  const grandTotal = Math.max(0, subTotal - discountAmount);
  const finalCashReceived = Number(cashReceived) || 0;
  const changeAmount = paymentMethod === 'Tunai' ? Math.max(0, finalCashReceived - grandTotal) : 0;
  const cashPresets = Array.from(new Set([
    grandTotal,
    Math.max(grandTotal, 100000),
    Math.max(Math.round(grandTotal * 1.1), 100000),
    Math.max(Math.round(grandTotal * 1.25), 200000)
  ])).sort((a, b) => a - b);
  const lowStockCount = products.filter(product => product.stock > 0 && product.stock <= 2).length;
  const currentDate = formatDateInput();
  const customerMissingFields = [];
  if (!customerPhoneInput.trim()) customerMissingFields.push('Nomor telepon');
  if (!customerAddressInput.trim()) customerMissingFields.push('Alamat');
  if (!customerIdentityNumber.trim()) customerMissingFields.push('Nomor identitas');
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

  const clearCart = () => {
    setCart([]);
    setShowMobileCheckout(false);
  };

  const removeCartItem = (productId) => {
    const nextCart = cart.filter(item => item.product.id !== productId);
    setCart(nextCart);
    if (nextCart.length === 0) setShowMobileCheckout(false);
  };

  const updateCartQty = (product, delta) => {
    const existing = cart.find(item => item.product.id === product.id);

    if (product.stock <= 0 && delta > 0) {
      alert(`Produk ${product.name} sedang habis.`);
      return;
    }

    if (!existing && delta > 0) {
      setCart([...cart, { product, qty: 1 }]);
      return;
    }

    if (existing) {
      const nextQty = existing.qty + delta;
      if (nextQty <= 0) {
        setCart(cart.filter(item => item.product.id !== product.id));
        if (cart.length === 1 && nextQty <= 0) setShowMobileCheckout(false);
        return;
      }

      if (nextQty > product.stock) {
        alert(`Stok ${product.name} tersisa ${product.stock} unit.`);
        return;
      }

      setCart(cart.map(item => item.product.id === product.id ? { ...item, qty: nextQty } : item));
    }
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0) return alert('Pilih barang terlebih dahulu');
    if (!customerNameInput.trim()) return alert('Masukkan nama pelanggan');
    if (!returnDateInput) return alert('Masukkan tanggal pengembalian');

    const stockIssues = getStockIssue();
    if (stockIssues.length > 0) {
      const firstIssue = stockIssues[0];
      return alert(`${firstIssue.item.product.name}: ${firstIssue.reason}`);
    }

    const todayDate = new Date();
    const rentDate = formatDateInput(todayDate);
    const invoiceNumber = createInvoiceNumber(todayDate);
    if (new Date(returnDateInput) < new Date(rentDate)) {
      return alert('Tanggal pengembalian tidak boleh lebih awal dari tanggal sewa');
    }

    if (paymentMethod === 'Tunai' && finalCashReceived < grandTotal) {
      return alert('Transaksi Ditolak: Uang tunai yang diterima kurang dari total tagihan!');
    }

    onCheckout({
      id: invoiceNumber,
      invoiceNumber,
      customerName: customerNameInput,
      customerPhone: customerPhoneInput,
      customerAddress: customerAddressInput,
      customerNote: customerNoteInput,
      customerIdentityType,
      customerIdentityNumber,
      depositAmount,
      items: cart,
      rentDate,
      expectedReturnDate: returnDateInput,
      subTotal,
      discountAmount,
      totalAmount: grandTotal,
      paymentMethod,
      cashReceived: paymentMethod === 'Tunai' ? finalCashReceived : 0,
      change: paymentMethod === 'Tunai' ? changeAmount : 0,
      status: 'disewa',
      lateFee: 0
    }, cart);

    setCart([]);
    setCustomerNameInput('');
    setCustomerPhoneInput('');
    setCustomerAddressInput('');
    setCustomerNoteInput('');
    setCustomerIdentityType('KTP');
    setCustomerIdentityNumber('');
    setDepositAmountInput('');
    setReturnDateInput(defaultDateStr);
    setDiscountValue('');
    setCashReceived('');
    setPaymentMethod('Tunai');
    setShowMobileCheckout(false);
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-4">
      <div className="brand-gradient hidden rounded-[24px] p-5 text-white shadow-soft md:block md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-white/80">POS kasir</p>
            <h2 className="mt-3 text-2xl md:text-3xl font-black leading-tight">Terminal sewa kostum yang cepat, rapi, dan siap transaksi</h2>
            <p className="mt-3 text-sm md:text-base text-white/90">
              Cari produk, tambahkan ke keranjang, pilih pelanggan, dan selesaikan pembayaran dengan tata letak kasir modern untuk desktop maupun tablet.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:min-w-[320px]">
            <div className="rounded-[22px] bg-white/10 border border-white/20 p-4 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Item keranjang</p>
              <p className="mt-2 text-2xl font-black">{totalItems}</p>
            </div>
            <div className="rounded-[22px] bg-white/10 border border-white/20 p-4 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Produk ready</p>
              <p className="mt-2 text-2xl font-black">{products.filter(product => product.stock > 0).length}</p>
            </div>
            <div className="rounded-[22px] bg-white/10 border border-white/20 p-4 backdrop-blur-sm sm:col-span-1 col-span-2">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">Stok menipis</p>
              <p className="mt-2 text-2xl font-black">{lowStockCount}</p>
            </div>
          </div>
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

      <div className="hidden gap-3 md:grid xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-700">Stok menipis</p>
              <p className="mt-2 text-sm font-black text-slate-900">{lowStockCount} produk butuh perhatian</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategory('Semua')}
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

      <div className="flex flex-col xl:flex-row gap-4 xl:items-start">
        <div className="flex-1 flex flex-col gap-4">
          <div className="pos-card sticky top-0 z-20 p-4 md:static md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Katalog produk</p>
                <h3 className="mt-1 text-lg font-black text-slate-900">Pilih kostum untuk transaksi</h3>
              </div>
              <div className="relative flex-1 max-w-xl">
                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari produk, kategori, atau ukuran"
                  value={search}
                  onChange={event => {
                    setSearch(event.target.value);
                    setProductPage(1);
                  }}
                  className="w-full rounded-[18px] border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm font-medium text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-nowrap gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
              {categories.map(category => (
                <button
                  key={category}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(category);
                    setProductPage(1);
                  }}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all ${selectedCategory === category ? 'bg-blue-700 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-4 hidden rounded-[22px] border border-slate-200 bg-slate-50 p-4 md:block">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Produk cepat</p>
                  <p className="mt-1 text-sm font-bold text-slate-700">Tambahkan barang favorit dari riwayat transaksi.</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">{favoriteProducts.length} favorit</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {favoriteProducts.map(product => {
                  const selectedQty = cart.find(item => item.product.id === product.id)?.qty || 0;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => updateCartQty(product, 1)}
                      className="rounded-[18px] border border-slate-200 bg-white px-3 py-2 text-left shadow-sm"
                    >
                      <p className="text-sm font-black text-slate-900">{product.name}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{formatCurrency(product.rentPrice)} - {selectedQty > 0 ? `${selectedQty} di keranjang` : 'Tambah cepat'}</p>
                    </button>
                  );
                })}
              </div>

              {lastCompletedTransaction && (
                <div className="mt-3 rounded-[20px] border border-blue-100 bg-gradient-to-r from-blue-50 to-amber-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">Transaksi terakhir</p>
                      <p className="mt-1 text-sm font-bold text-slate-900">{lastCompletedTransaction.customerName || 'Pelanggan belum tercatat'}</p>
                      <p className="mt-1 text-[11px] text-slate-600">
                        {formatDate(lastCompletedTransaction.rentDate || lastCompletedTransaction.expectedReturnDate || new Date().toISOString())} - {lastCompletedTransaction.paymentMethod || 'Tunai'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={applyLastTransaction}
                      className="rounded-[16px] bg-blue-700 px-4 py-2 text-sm font-bold text-white"
                    >
                      Ulangi cepat
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  {selectedCategory === 'Semua' ? 'Semua kategori' : selectedCategory}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {productStartNumber}-{productEndNumber} dari {sortedProducts.length} produk
                </span>
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                  {cart.length} item di keranjang
                </span>
              </div>

              <div className="hidden flex-wrap gap-2 md:flex">
                <button
                  type="button"
                  onClick={clearCart}
                  className="rounded-[16px] border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                >
                  Bersihkan keranjang
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setProductPage(1);
                  }}
                  className="rounded-[16px] border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
                >
                  Reset pencarian
                </button>
              </div>
            </div>

            <div className="mt-4 hidden gap-2 sm:grid-cols-2 md:grid xl:grid-cols-3">
              {categoryCounts.map(item => (
                <div key={item.category} className="rounded-[18px] border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">{item.category}</p>
                  <p className="mt-1 text-sm font-black text-slate-900">{item.count} produk siap</p>
                </div>
              ))}
            </div>
          </div>

          {sortedProducts.length > PRODUCTS_PER_PAGE && (
            <div className="pos-card flex items-center justify-between gap-3 p-3 md:p-4">
              <button
                type="button"
                onClick={() => setProductPage(page => Math.max(1, page - 1))}
                disabled={safeProductPage === 1}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft size={18} strokeWidth={3} />
              </button>
              <div className="min-w-0 text-center">
                <p className="text-sm font-black text-slate-900">Halaman {safeProductPage} dari {productPageCount}</p>
                <p className="mt-1 text-xs text-slate-500">{productStartNumber}-{productEndNumber} produk ditampilkan</p>
              </div>
              <button
                type="button"
                onClick={() => setProductPage(page => Math.min(productPageCount, page + 1))}
                disabled={safeProductPage === productPageCount}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight size={18} strokeWidth={3} />
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pb-28 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4 md:gap-5 xl:pb-6">
            {availableProducts.length === 0 ? (
              <div className="col-span-full rounded-[24px] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
                <Package size={32} className="mx-auto text-slate-300" />
                <p className="mt-3 font-bold text-slate-700">Barang tidak ditemukan</p>
                <p className="mt-1 text-sm">Coba ubah kata kunci atau kategori.</p>
              </div>
            ) : paginatedProducts.map(product => {
              const cartItem = cart.find(item => item.product.id === product.id);
              const isSelected = Boolean(cartItem);
              const stockStatus = product.stock <= 0 ? 'habis' : product.stock <= 2 ? 'menipis' : 'normal';
              const stockBadgeClass = stockStatus === 'habis'
                ? 'bg-red-500 text-white'
                : stockStatus === 'menipis'
                  ? 'bg-amber-400 text-slate-900'
                  : 'bg-slate-900/80 text-white';
              const stockLabel = stockStatus === 'habis'
                ? 'Habis'
                : stockStatus === 'menipis'
                  ? 'Stok menipis'
                  : `Sisa ${product.stock}`;
              const statusText = stockStatus === 'habis'
                ? 'Tidak tersedia'
                : stockStatus === 'menipis'
                  ? 'Restock segera'
                  : 'Siap disewa';

              return (
                <article
                  key={product.id}
                  className={`rounded-[24px] border bg-white shadow-sm overflow-hidden transition-all ${isSelected ? 'border-blue-500 shadow-[0_22px_50px_-30px_rgba(30,64,175,0.45)]' : stockStatus === 'habis' ? 'border-red-200' : stockStatus === 'menipis' ? 'border-amber-200' : 'border-transparent hover:border-slate-200'}`}
                >
                  <div className="relative h-32 bg-slate-100 sm:h-36" onClick={() => !isSelected && updateCartQty(product, 1)}>
                    {product.photo ? (
                      <img src={product.photo} alt={product.name} className="h-full w-full object-cover" onError={(event) => { event.target.onerror = null; event.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48bGluZSB4MT0iMyIgeTE9IjMiIHgyPSIyMSIgeTI9IjIxIj48L2xpbmU+PHBhdGggZD0iTTEwLjUgMTAuNVYxMGg0djMuNW0tMiAyaC00djRMNSA4bDEuNS0xLjUiPjwvcGF0aD48L3N2Zz4='; }} />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <Package size={36} />
                      </div>
                    )}

                    <div className={`absolute left-3 bottom-3 rounded-full px-3 py-1 text-[11px] font-bold ${stockBadgeClass}`}>
                      {stockLabel}
                    </div>
                    {isSelected && (
                      <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-black text-white shadow-lg">
                        {cartItem.qty}
                      </div>
                    )}
                  </div>

                  <div className="p-3 sm:p-4">
                    <div className="flex flex-wrap gap-2">
                      <span className="max-w-full break-words rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                        {product.category || 'Lainnya'}
                      </span>
                      <span className="max-w-full break-words rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                        {product.size || 'All Size'}
                      </span>
                    </div>
                    <h4 className="mt-3 break-words text-sm font-black leading-snug text-slate-900">{product.name}</h4>
                    <p className={`mt-2 text-[11px] font-bold uppercase tracking-[0.2em] ${stockStatus === 'habis' ? 'text-red-600' : stockStatus === 'menipis' ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {statusText}
                    </p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Harga sewa</p>
                        <p className="mt-1 break-words text-base font-black text-amber-600 sm:text-lg">{formatCurrency(product.rentPrice)}</p>
                      </div>
                      {isSelected ? (
                        <div className="flex w-full items-center justify-between gap-2 rounded-[18px] border border-blue-100 bg-blue-50 px-2 py-1.5 sm:w-auto">
                          <button type="button" onClick={() => updateCartQty(product, -1)} className="rounded-xl bg-white p-2 text-blue-700 shadow-sm hover:bg-blue-100">
                            <Minus size={16} strokeWidth={3} />
                          </button>
                          <span className="w-6 text-center text-base font-black text-blue-900">{cartItem.qty}</span>
                          <button type="button" onClick={() => updateCartQty(product, 1)} className="rounded-xl bg-blue-700 p-2 text-white shadow-sm hover:bg-blue-800">
                            <Plus size={16} strokeWidth={3} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateCartQty(product, 1)}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-[16px] bg-slate-900 px-4 py-2 text-sm font-bold text-white transition-all hover:bg-blue-800 sm:w-auto"
                        >
                          <Plus size={16} strokeWidth={3} /> Tambah
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {sortedProducts.length > PRODUCTS_PER_PAGE && (
            <div className="pos-card mb-24 flex items-center justify-between gap-3 p-3 md:mb-0 md:p-4">
              <button
                type="button"
                onClick={() => setProductPage(page => Math.max(1, page - 1))}
                disabled={safeProductPage === 1}
                className="rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-sm font-black text-slate-900">{safeProductPage}/{productPageCount}</span>
              <button
                type="button"
                onClick={() => setProductPage(page => Math.min(productPageCount, page + 1))}
                disabled={safeProductPage === productPageCount}
                className="rounded-[16px] bg-blue-800 px-4 py-3 text-sm font-bold text-white disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>

        <div
          className={`${showMobileCheckout ? 'fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm md:hidden' : 'hidden'} md:block md:w-[420px] shrink-0 xl:sticky xl:top-4 xl:self-start`}
          onClick={() => showMobileCheckout && setShowMobileCheckout(false)}
        >
          <div
            className={`bg-white h-full flex flex-col md:rounded-[28px] md:border md:border-slate-200 md:shadow-soft overflow-hidden ${showMobileCheckout ? 'absolute inset-x-0 bottom-0 max-h-[92vh] rounded-t-[28px]' : ''}`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-blue-900 px-5 py-4 text-white md:rounded-t-[28px]">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-blue-100">Pembayaran</p>
                <h3 className="mt-1 text-lg font-black">Ringkasan tagihan</h3>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-100">
                  {paymentSummaryLabel}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                  <span className="rounded-full bg-white/10 px-3 py-1">{totalItems} item</span>
                  <span className="rounded-full bg-white/10 px-3 py-1">{formatCurrency(grandTotal)}</span>
                  <span className="rounded-full bg-white/10 px-3 py-1">{paymentMethod}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileCheckout(false)}
                className="rounded-full bg-white/10 p-2 md:hidden"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-5 space-y-4">
              <div className="rounded-[24px] bg-white p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Checklist pembayaran</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{checkoutChecklist.every(item => item.ok) ? 'Semua langkah siap' : 'Lengkapi langkah yang masih tertinggal'}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">{checkoutChecklist.filter(item => item.ok).length}/{checkoutChecklist.length}</span>
                </div>

                <div className="mt-4 space-y-3">
                  {checkoutChecklist.map(item => {
                    const Icon = item.ok ? CheckCircle : AlertCircle;
                    return (
                      <div key={item.label} className="flex items-start gap-3 rounded-[18px] bg-slate-50 px-3 py-2">
                        <Icon size={18} className={item.ok ? 'text-emerald-600' : 'text-amber-600'} />
                        <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Pelanggan</p>
                    <p className="mt-2 text-sm font-bold text-slate-900">{customerNameInput || 'Pelanggan belum diisi'}</p>
                  </div>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">{totalItems} item</span>
                </div>

                <div className="mt-4 relative">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={customerNameInput}
                      onChange={event => { setCustomerNameInput(event.target.value); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="Ketik nama pelanggan *"
                      className="w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50"
                    />
                    {customerNameInput && (
                      <button
                        type="button"
                        onMouseDown={(event) => {
                          event.preventDefault();
                          resetCustomer();
                        }}
                        className="rounded-[18px] border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-600"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  {showSuggestions && customerNameInput && filteredCustomers.length > 0 && (
                    <ul className="absolute z-20 mt-2 w-full rounded-[18px] border border-slate-200 bg-white shadow-2xl overflow-y-auto max-h-64">
                      {filteredCustomers.map(customer => (
                        <li
                          key={customer.id}
                          onMouseDown={() => applyCustomer(customer)}
                          className="cursor-pointer px-4 py-3 border-b border-slate-100 last:border-b-0 hover:bg-blue-50"
                        >
                          <p className="break-words text-sm font-bold text-slate-900">{customer.name}</p>
                          <p className="mt-1 break-words text-[11px] leading-snug text-slate-500">{customer.phone || '-'} - {customer.address || 'Alamat belum tersedia'}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {customerMissingFields.length > 0 && (
                  <div className="mt-3 rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-800">Peringatan data pelanggan</p>
                    <p className="mt-2 text-sm font-semibold text-amber-900">
                      Lengkapi: {customerMissingFields.join(', ')} sebelum pembayaran.
                    </p>
                  </div>
                )}

                {(favoriteCustomers.length > 0 || recentCustomers.length > 0) && (
                  <div className="mt-3 rounded-[20px] border border-slate-100 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Pelanggan cepat</p>
                        <p className="mt-1 text-xs text-slate-500">Pilih pelanggan favorit atau terakhir untuk mengisi data dengan cepat.</p>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2">
                      {favoriteCustomers.map(customer => (
                        <button
                          key={`favorite-${customer.name}`}
                          type="button"
                          onMouseDown={() => applyCustomer(customer)}
                          className="rounded-[18px] border border-blue-200 bg-white px-3 py-3 text-left transition-all hover:border-blue-300 hover:bg-blue-50"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                              <p className="text-[11px] text-slate-500">{customer.phone || '-'} - {customer.address || 'Alamat belum tersedia'}</p>
                            </div>
                            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">Favorit</span>
                          </div>
                          <p className="mt-2 text-[11px] font-bold text-blue-700">{customer.count || 1} transaksi</p>
                        </button>
                      ))}
                      {recentCustomers
                        .filter(customer => !favoriteCustomers.some(item => item.name === customer.name))
                        .map(customer => (
                          <button
                            key={`recent-${customer.id}`}
                            type="button"
                            onMouseDown={() => applyCustomer(customer)}
                            className="rounded-[18px] border border-slate-200 bg-white px-3 py-3 text-left transition-all hover:border-slate-300 hover:bg-slate-50"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                                <p className="text-[11px] text-slate-500">{customer.phone || '-'} - {customer.address || 'Alamat belum tersedia'}</p>
                              </div>
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">Terbaru</span>
                            </div>
                            {customer.lastRentDate && (
                              <p className="mt-2 text-[11px] font-bold text-blue-700">Terakhir sewa: {formatDate(customer.lastRentDate)}</p>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    type="tel"
                    placeholder="Telepon"
                    value={customerPhoneInput}
                    onChange={event => setCustomerPhoneInput(event.target.value)}
                    className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50"
                  />
                  <select
                    value={customerIdentityType}
                    onChange={event => setCustomerIdentityType(event.target.value)}
                    className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50"
                  >
                    <option value="KTP">KTP</option>
                    <option value="SIM">SIM</option>
                    <option value="Kartu Pelajar">Kartu Pelajar</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    placeholder="Nomor identitas"
                    value={customerIdentityNumber}
                    onChange={event => setCustomerIdentityNumber(event.target.value)}
                    className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50"
                  />
                  <input
                    type="date"
                    value={returnDateInput}
                    min={formatDateInput()}
                    onChange={event => setReturnDateInput(event.target.value)}
                    className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50"
                  />
                </div>
                <textarea
                  placeholder="Alamat lengkap (opsional)"
                  value={customerAddressInput}
                  onChange={event => setCustomerAddressInput(event.target.value)}
                  rows="2"
                  className="mt-3 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 resize-none"
                />
                <textarea
                  placeholder="Catatan pelanggan / kebutuhan khusus"
                  value={customerNoteInput}
                  onChange={event => setCustomerNoteInput(event.target.value)}
                  rows="2"
                  className="mt-3 w-full rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50 resize-none"
                />
                <div className="mt-3 rounded-[18px] border border-amber-200 bg-amber-50 p-4">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-amber-800">Deposit / Jaminan (opsional)</label>
                  <input
                    type="text"
                    value={formatNumberDot(depositAmountInput)}
                    onChange={event => setDepositAmountInput(event.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Rp 0"
                    className="mt-3 w-full rounded-[16px] border border-white bg-white px-4 py-3 text-sm font-black text-amber-900 focus:outline-none"
                  />
                  <p className="mt-2 text-[11px] text-amber-900/80">Deposit disimpan pada transaksi dan dapat dijadikan acuan pengembalian di tahap berikutnya.</p>
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Keranjang</h4>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">{cart.length} item</span>
                </div>
                {cart.length === 0 ? (
                  <div className="mt-4 rounded-[20px] border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
                    Keranjang kosong. Tambahkan produk dari katalog.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {cart.map(item => (
                      <div key={item.product.id} className="rounded-[20px] bg-slate-50 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="break-words text-sm font-bold leading-snug text-slate-900">{item.product.name}</p>
                            <p className="text-[11px] text-slate-500">{formatCurrency(item.product.rentPrice)} / item</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCartItem(item.product.id)}
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 shadow-sm"
                            aria-label={`Hapus ${item.product.name} dari keranjang`}
                          >
                            <Trash2 size={15} strokeWidth={2.5} />
                          </button>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="text-sm font-black text-blue-800">{formatCurrency(item.product.rentPrice * item.qty)}</p>
                          <div className="flex items-center gap-2">
                            <button type="button" onClick={() => updateCartQty(item.product, -1)} className="rounded-xl bg-white p-2 text-blue-700 shadow-sm">
                              <Minus size={14} strokeWidth={3} />
                            </button>
                            <span className="w-7 text-center text-sm font-black text-slate-900">{item.qty}</span>
                            <button type="button" onClick={() => updateCartQty(item.product, 1)} className="rounded-xl bg-blue-700 p-2 text-white shadow-sm">
                              <Plus size={14} strokeWidth={3} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-[24px] bg-white p-5 border border-slate-100 shadow-sm">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Diskon & Metode</h4>
                <div className="mt-4 space-y-4">
                  <div className="grid gap-2 sm:grid-cols-[100px_1fr]">
                    <select
                      value={discountType}
                      onChange={event => { setDiscountType(event.target.value); setDiscountValue(''); }}
                      className="rounded-[18px] border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700"
                    >
                      <option value="nominal">Rp</option>
                      <option value="percent">%</option>
                    </select>
                    <input
                      type="text"
                      value={discountType === 'nominal' ? formatNumberDot(discountValue) : discountValue}
                      onChange={event => {
                        const rawValue = event.target.value.replace(/[^0-9]/g, '');
                        if (discountType === 'percent' && Number(rawValue) > 100) return;
                        setDiscountValue(rawValue);
                      }}
                      placeholder="Nilai diskon"
                      className="rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {['Tunai', 'Transfer', 'QRIS'].map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`rounded-[18px] px-2 py-3 text-[11px] font-bold border transition-all ${paymentMethod === method ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-500'}`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'Tunai' && (
                    <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4">
                      <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-amber-800">Uang diterima</label>
                      <div className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={formatNumberDot(cashReceived)}
                          onChange={event => setCashReceived(event.target.value.replace(/[^0-9]/g, ''))}
                          placeholder="Rp 0"
                          className="flex-1 rounded-[16px] border border-white bg-white px-4 py-3 text-sm font-black text-amber-900 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setCashReceived(String(grandTotal))}
                          className="rounded-[16px] bg-amber-500 px-4 py-3 text-xs font-bold text-white"
                        >
                          Uang Pas
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {cashPresets.map(preset => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setCashReceived(String(Math.round(preset)))}
                            className="rounded-[14px] bg-white px-3 py-2 text-[11px] font-bold text-amber-900 border border-white"
                          >
                            {formatCurrency(Math.round(preset))}
                          </button>
                        ))}
                      </div>

                      {finalCashReceived > 0 && finalCashReceived < grandTotal && (
                        <p className="mt-3 text-[11px] font-bold text-red-600">Uang kurang {formatCurrency(grandTotal - finalCashReceived)}</p>
                      )}
                      {finalCashReceived >= grandTotal && finalCashReceived > 0 && (
                        <div className="mt-3 flex items-center justify-between rounded-[16px] bg-white/80 px-3 py-2">
                          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-800">Kembalian</span>
                          <span className="text-lg font-black text-emerald-600">{formatCurrency(changeAmount)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-white px-4 py-4 md:px-5 md:py-5">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-800">{formatCurrency(subTotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Diskon</span>
                    <span className="font-bold">-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                {depositAmount > 0 && (
                  <div className="flex justify-between text-sm text-amber-700">
                    <span>Deposit / Jaminan</span>
                    <span className="font-bold">{formatCurrency(depositAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Total tagihan</span>
                  <span className="text-3xl font-black text-blue-700">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCheckoutClick}
                disabled={cart.length === 0 || getStockIssue().length > 0 || (paymentMethod === 'Tunai' && finalCashReceived < grandTotal)}
                className="mt-4 w-full rounded-[20px] bg-blue-800 px-4 py-4 text-lg font-black text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {getStockIssue().length > 0 ? 'Periksa ulang stok' : 'Bayar & Cetak Nota'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-24 left-0 right-0 px-4 z-20 pointer-events-none">
        {totalItems > 0 && (
          <div className="pointer-events-auto rounded-[24px] bg-blue-900 px-4 py-3 text-white shadow-[0_24px_60px_-24px_rgba(30,64,175,0.9)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] uppercase tracking-[0.2em] text-blue-100">Keranjang</p>
                <p className="mt-1 break-words text-base font-black leading-snug sm:text-lg">{totalItems} item - {formatCurrency(grandTotal)}</p>
                <p className="mt-1 break-words text-[11px] leading-snug text-blue-100">
                  {customerNameInput || 'Pelanggan belum diisi'} - {paymentMethod}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileCheckout(true)}
                className="rounded-[18px] bg-amber-400 px-4 py-3 text-sm font-black text-slate-900 shrink-0"
              >
                Bayar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
