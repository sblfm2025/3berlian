import { useState, useMemo } from 'react';
import { Package, Plus, Search, Cloud, Edit, Trash2, X, ChevronLeft, ChevronRight, Copy, Minus, Barcode, Printer } from 'lucide-react';
import { formatCurrency, formatNumberDot } from '../utils/format';
import { normalizeProduct } from '../utils/product';
import { compressImage } from '../utils/browser';
import { useMobileSearchRegistration } from '../components/layout/useMobileSearch';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import BarcodeCanvas from '../components/ui/BarcodeCanvas';
import { getProductItems, saveProductItem } from '../repositories/productItemRepository';
import EmptyState from '../components/ui/EmptyState';

const PRODUCTS_PER_PAGE = 20;

const getProductStatusLabel = (product) => {
  if (product.isActive === false || product.status === 'inactive') return 'Nonaktif';
  if (product.status === 'maintenance') return 'Perbaikan';
  if (product.status === 'laundry') return 'Laundry';
  if (product.availableStock <= 0) return 'Habis';
  if (product.availableStock <= 2) return 'Stok rendah';
  return 'Tersedia';
};

const getStatusOptionLabel = (status) => {
  if (status === 'maintenance') return 'Perbaikan';
  if (status === 'laundry') return 'Laundry';
  if (status === 'habis') return 'Habis';
  if (status === 'inactive') return 'Nonaktif';
  if (status === 'rendah') return 'Stok rendah';
  if (status === 'tersedia') return 'Tersedia';
  return status;
};

// ==========================================
export default function ProductsPage({
  products,
  onSave,
  onDelete,
  onCompleteLaundry,
  onCompleteMaintenance,
  onRetireCostume,
  onNotify,
  operatorId
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [productPage, setProductPage] = useState(1);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, product: null, isLoading: false });

  // State untuk Kelola Unit & QR (Product Items)
  const [selectedProductForItems, setSelectedProductForItems] = useState(null);
  const [productItemsList, setProductItemsList] = useState([]);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
  const [isSavingItemStatus, setIsSavingItemStatus] = useState(false);

  const handleOpenProductItems = async (product) => {
    setSelectedProductForItems(product);
    setIsItemsLoading(true);
    try {
      const items = await getProductItems(product.id);
      setProductItemsList(items);
    } catch {
      onNotify?.({
        title: 'Gagal memuat data',
        message: 'Gagal mengambil unit item fisik kostum dari database.',
        type: 'error'
      });
    } finally {
      setIsItemsLoading(false);
    }
  };

  const handleUpdateItemStatus = async (item, newStatus, newCondition) => {
    setIsSavingItemStatus(true);
    const beforeStatus = item.status;
    const updatedItem = {
      ...item,
      status: newStatus,
      condition: newCondition,
      operatorId
    };

    try {
      await saveProductItem(updatedItem);

      // Update list di UI secara lokal agar responsif
      setProductItemsList(prev => prev.map(p => p.id === item.id ? updatedItem : p));

      // Hitung mutasi perubahan stok global untuk disinkronkan ke Firestore
      const product = selectedProductForItems;
      const updates = {};

      // Helper untuk menghitung pengurangan stok asal dan penambahan stok tujuan
      const adjustStockVal = (status, val) => {
        if (status === 'READY') updates.stock = Number(product.availableStock || 0) + val;
        if (status === 'IN_LAUNDRY') updates.laundryStock = Number(product.laundryStock || 0) + val;
        if (status === 'IN_MAINTENANCE') updates.maintenanceStock = Number(product.maintenanceStock || 0) + val;
        if (status === 'LOST') updates.lostStock = Number(product.lostStock || 0) + val;
        if (status === 'RETIRED') updates.retiredStock = Number(product.retiredStock || 0) + val;
      };

      adjustStockVal(beforeStatus, -1);
      adjustStockVal(newStatus, 1);

      // Sinkronkan ke dokumen produk global secara atomik
      await handleQuickSave(product, updates);

      onNotify?.({
        title: 'Status unit diperbarui',
        message: `Unit ${item.itemCode} berhasil dipindahkan ke status ${newStatus.toUpperCase()}.`,
        type: 'success'
      });
    } catch (err) {
      onNotify?.({
        title: 'Gagal memperbarui status',
        message: err.message || 'Terjadi kesalahan saat menyinkronkan status unit.',
        type: 'error'
      });
    } finally {
      setIsSavingItemStatus(false);
    }
  };

  // Dialog Aksi Cepat Operasional
  const [quickAction, setQuickAction] = useState({
    isOpen: false,
    type: '', // 'laundry', 'maintenance', 'retire'
    product: null,
    qty: 1,
    fromBucket: 'available'
  });

  const mobileSearchConfig = useMemo(() => ({
    placeholder: 'Cari nama, kategori, ukuran',
    value: searchTerm,
    onChange: (value) => {
      setSearchTerm(value);
      setProductPage(1);
    }
  }), [searchTerm]);
  useMobileSearchRegistration(mobileSearchConfig);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Bugis',
    size: 'All Size',
    sku: '',
    color: '',
    description: '',
    status: 'tersedia',
    rentPrice: '',
    stock: '',
    photo: '',
    dailyLateFee: '',
    adjustmentReason: ''
  });

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'All Size'];
  const statusOptions = ['tersedia', 'maintenance', 'laundry', 'habis', 'inactive'];

  const normalizedProducts = useMemo(() => {
    return products.map(normalizeProduct);
  }, [products]);

  const categories = useMemo(() => {
    const unique = ['Semua', ...new Set(normalizedProducts.map(product => product.category).filter(Boolean))];
    return unique;
  }, [normalizedProducts]);

  const stats = useMemo(() => {
    const activeProducts = normalizedProducts.filter(product => product.isActive !== false && product.status !== 'inactive');
    const available = activeProducts.filter(product => product.availableStock > 0).length;
    const lowStock = activeProducts.filter(product => product.availableStock > 0 && product.availableStock <= 2).length;
    const outOfStock = activeProducts.filter(product => product.availableStock <= 0).length;
    const totalInventoryValue = activeProducts.reduce((sum, product) => sum + product.rentPrice * product.availableStock, 0);

    return { available, lowStock, outOfStock, totalInventoryValue };
  }, [normalizedProducts]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return normalizedProducts.filter(product => {
      const isActive = product.isActive !== false && product.status !== 'inactive';
      const matchesSearch = [product.name, product.category, product.size].join(' ').toLowerCase().includes(term);
      const matchesCategory = categoryFilter === 'Semua' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'Semua'
        || (statusFilter === 'tersedia' && isActive && product.status === 'tersedia' && product.availableStock > 0)
        || (statusFilter === 'habis' && isActive && product.availableStock <= 0)
        || (statusFilter === 'rendah' && isActive && product.availableStock > 0 && product.availableStock <= 2)
        || (statusFilter === 'laundry' && isActive && (product.status === 'laundry' || product.laundryStock > 0))
        || (statusFilter === 'maintenance' && isActive && (product.status === 'maintenance' || product.maintenanceStock > 0))
        || (statusFilter === 'inactive' && !isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [normalizedProducts, searchTerm, categoryFilter, statusFilter]);

  const productPageCount = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const safeProductPage = Math.min(productPage, productPageCount);
  const paginatedProducts = filteredProducts.slice(
    (safeProductPage - 1) * PRODUCTS_PER_PAGE,
    safeProductPage * PRODUCTS_PER_PAGE
  );
  const productStartNumber = filteredProducts.length === 0 ? 0 : ((safeProductPage - 1) * PRODUCTS_PER_PAGE) + 1;
  const productEndNumber = Math.min(safeProductPage * PRODUCTS_PER_PAGE, filteredProducts.length);

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category,
        size: product.size,
        sku: product.sku || '',
        color: product.color || '',
        description: product.description || '',
        status: product.status || (Number(product.availableStock) > 0 ? 'tersedia' : 'habis'),
        rentPrice: String(product.rentPrice || ''),
        stock: String(product.availableStock || product.stock || ''),
        photo: product.photo || '',
        dailyLateFee: String(product.dailyLateFee || ''),
        adjustmentReason: ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        category: 'Bugis',
        size: 'All Size',
        sku: '',
        color: '',
        description: '',
        status: 'tersedia',
        rentPrice: '',
        stock: '',
        photo: '',
        dailyLateFee: '',
        adjustmentReason: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64Image = await compressImage(file);
      setFormData(prev => ({ ...prev, photo: base64Image }));
    } catch {
      onNotify?.({ title: 'Gambar gagal diproses', message: 'Coba gunakan gambar lain.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Validasi alasan adjustment stok wajib jika nilai stok berubah saat edit
    if (editingProduct && Number(formData.stock) !== Number(editingProduct.availableStock) && !formData.adjustmentReason?.trim()) {
      onNotify?.({ title: 'Alasan wajib diisi', message: 'Silakan isi alasan perubahan stok fisik.', type: 'error' });
      return;
    }

    setIsUploading(true);

    try {
      const stockValue = Number(formData.stock);
      const rentPriceValue = Number(formData.rentPrice);
      const dailyLateFeeValue = Number(formData.dailyLateFee);
      const stockRentedValue = Number(editingProduct?.rentedStock || 0);
      const stockLaundryValue = Number(editingProduct?.laundryStock || 0);
      const stockDamagedValue = Number(editingProduct?.maintenanceStock || 0);
      const lostStockValue = Number(editingProduct?.lostStock || 0);
      const retiredStockValue = Number(editingProduct?.retiredStock || 0);
      const stockTotalValue = stockValue + stockRentedValue + stockLaundryValue + stockDamagedValue + lostStockValue + retiredStockValue;

      const dataToSave = {
        ...formData,
        rentPrice: rentPriceValue,
        dailyRentPrice: rentPriceValue,
        stock: stockValue,
        stockTotal: stockTotalValue,
        stockAvailable: stockValue,
        stockRented: stockRentedValue,
        stockLaundry: stockLaundryValue,
        stockDamaged: stockDamagedValue,
        availableStock: stockValue,
        rentedStock: stockRentedValue,
        laundryStock: stockLaundryValue,
        maintenanceStock: stockDamagedValue,
        lostStock: lostStockValue,
        retiredStock: retiredStockValue,
        totalStock: stockTotalValue,
        dailyLateFee: dailyLateFeeValue,
        lateFeePerDay: dailyLateFeeValue,
        gender: formData.gender || 'Unisex',
        notes: formData.notes || '',
        status: formData.status || (stockValue > 0 ? 'tersedia' : 'habis'),
        operatorId,
        adjustmentReason: formData.adjustmentReason || ''
      };

      if (editingProduct) dataToSave.id = editingProduct.id;

      await onSave(dataToSave, !!editingProduct);
      setIsModalOpen(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (product) => {
    setDeleteDialog({ isOpen: true, product, isLoading: false });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.product) return;
    setDeleteDialog(prev => ({ ...prev, isLoading: true }));
    await onDelete(deleteDialog.product.id);
    setDeleteDialog({ isOpen: false, product: null, isLoading: false });
  };

  const handleDuplicate = (product) => {
    setEditingProduct(null);
    setFormData({
      name: `${product.name} (Salinan)`,
      category: product.category,
      size: product.size,
      sku: product.sku ? `${product.sku}-COPY` : '',
      color: product.color || '',
      description: product.description || '',
      status: product.status || 'tersedia',
      rentPrice: String(product.rentPrice || ''),
      stock: String(product.availableStock || ''),
      photo: product.photo || '',
      dailyLateFee: String(product.dailyLateFee || ''),
      adjustmentReason: ''
    });
    setIsModalOpen(true);
  };

  const handleQuickSave = async (product, updates) => {
    const nextStock = updates.stock !== undefined ? Number(updates.stock) : Number(product.availableStock || 0);
    const rentPriceValue = Number(product.rentPrice || 0);
    const dailyLateFeeValue = Number(product.dailyLateFee || 0);
    const stockRentedValue = Number(product.rentedStock || 0);
    const stockLaundryValue = Number(product.laundryStock || 0);
    const stockDamagedValue = Number(product.maintenanceStock || 0);
    const lostStockValue = Number(product.lostStock || 0);
    const retiredStockValue = Number(product.retiredStock || 0);
    const stockTotalValue = nextStock + stockRentedValue + stockLaundryValue + stockDamagedValue + lostStockValue + retiredStockValue;

    const dataToSave = {
      ...product,
      ...updates,
      rentPrice: rentPriceValue,
      dailyRentPrice: rentPriceValue,
      stock: nextStock,
      stockTotal: stockTotalValue,
      stockAvailable: nextStock,
      stockRented: stockRentedValue,
      stockLaundry: stockLaundryValue,
      stockDamaged: stockDamagedValue,
      availableStock: nextStock,
      rentedStock: stockRentedValue,
      laundryStock: stockLaundryValue,
      maintenanceStock: stockDamagedValue,
      lostStock: lostStockValue,
      retiredStock: retiredStockValue,
      totalStock: stockTotalValue,
      dailyLateFee: dailyLateFeeValue,
      lateFeePerDay: dailyLateFeeValue,
      operatorId,
      adjustmentReason: updates.stock !== undefined
        ? `Aksi cepat ${updates.stock > (product.availableStock || 0) ? 'tambah' : 'kurangi'} stok`
        : 'Pembaruan cepat status operasional'
    };

    await onSave(dataToSave, true);
  };

  // Pemicu Modal Aksi Cepat Operasional
  const handleOpenQuickAction = (product, type) => {
    setQuickAction({
      isOpen: true,
      type,
      product,
      qty: type === 'laundry' ? (product.laundryStock || 0) : type === 'maintenance' ? (product.maintenanceStock || 0) : 1,
      fromBucket: 'available'
    });
  };

  // Submit Aksi Cepat Operasional
  const handleConfirmQuickAction = async () => {
    const { type, product, qty, fromBucket } = quickAction;
    if (!product || qty <= 0) return;

    try {
      if (type === 'laundry') {
        await onCompleteLaundry(product.id, qty);
      } else if (type === 'maintenance') {
        await onCompleteMaintenance(product.id, qty);
      } else if (type === 'retire') {
        await onRetireCostume(product.id, qty, fromBucket);
      }
      setQuickAction({ isOpen: false, type: '', product: null, qty: 1, fromBucket: 'available' });
    } catch (err) {
      onNotify?.({ title: 'Gagal memproses aksi', message: err.message || 'Terjadi kesalahan.', type: 'error' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className={`sticky top-0 z-20 mb-3 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:static md:mb-5 md:border-0 md:bg-transparent md:p-0 md:shadow-none xl:grid-cols-[1.2fr_1fr] xl:items-end ${searchTerm ? 'hidden md:grid' : ''}`}>
        <div className="hidden md:block">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">Ringkasan inventaris</p>
          <p className="mt-1 text-sm font-semibold text-slate-700">
            {stats.available} tersedia, {stats.lowStock} stok rendah, {stats.outOfStock} habis.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
          <div className="relative hidden flex-1 md:block">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama / kategori / ukuran"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setProductPage(1);
              }}
              className="w-full rounded-[18px] border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm font-medium text-slate-700 focus:border-blue-300 focus:outline-none focus:ring-4 focus:ring-blue-50"
            />
          </div>
          <button
            type="button"
            onClick={() => openModal()}
            className="rounded-xl bg-amber-500 px-3 py-2.5 text-sm font-bold text-white shadow-sm transition-transform active:scale-95 sm:rounded-[18px] sm:px-5 sm:py-3 sm:font-black"
          >
            <span className="flex items-center justify-center gap-2">
              <Plus size={18} strokeWidth={3} />
              Tambah Produk
            </span>
          </button>
        </div>
      </div>

      <div className="mb-5 hidden gap-3 sm:grid-cols-2 md:grid xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[24px] sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">Total produk</p>
          <p className="mt-2 text-xl font-bold text-slate-900 sm:mt-3 sm:text-2xl sm:font-black">{normalizedProducts.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[24px] sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">Tersedia</p>
          <p className="mt-2 text-xl font-bold text-emerald-600 sm:mt-3 sm:text-2xl sm:font-black">{stats.available}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[24px] sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">Stok rendah</p>
          <p className="mt-2 text-xl font-bold text-amber-600 sm:mt-3 sm:text-2xl sm:font-black">{stats.lowStock}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-[24px] sm:p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">Nilai stok</p>
          <p className="mt-2 text-xl font-bold text-blue-700 sm:mt-3 sm:text-2xl sm:font-black">{formatCurrency(stats.totalInventoryValue)}</p>
        </div>
      </div>

      <div className={`mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-5 sm:rounded-[20px] sm:p-4 ${searchTerm ? 'hidden md:block' : ''}`}>
        <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
          {categories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setCategoryFilter(category);
                setProductPage(1);
              }}
              className={`shrink-0 max-w-full break-words rounded-full px-3 py-1.5 text-xs font-bold transition-all sm:px-4 sm:py-2 sm:text-sm ${categoryFilter === category ? 'bg-emerald-900 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-900'} min-h-[36px]`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
          {['Semua', 'tersedia', 'rendah', 'habis', 'laundry', 'maintenance', 'inactive'].map(option => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setStatusFilter(option);
                setProductPage(1);
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-all sm:px-4 sm:py-2 sm:text-sm ${statusFilter === option ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} min-h-[36px]`}
            >
              {option === 'Semua' ? 'Semua status' : getStatusOptionLabel(option)}
            </button>
          ))}
        </div>

        <div className="mt-4 hidden text-sm text-slate-500 md:block">
          {stats.lowStock > 0
            ? `${stats.lowStock} produk perlu perhatian karena stok rendah.`
            : stats.outOfStock > 0
              ? `${stats.outOfStock} produk sedang habis.`
              : 'Stok semua produk tergolong aman.'}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-bold">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-850">
            {productStartNumber}-{productEndNumber} dari {filteredProducts.length} produk
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
            Halaman {safeProductPage}/{productPageCount}
          </span>
        </div>
      </div>

      {filteredProducts.length > PRODUCTS_PER_PAGE && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-[20px] border border-slate-200 bg-white p-3 shadow-sm">
          <button
            type="button"
            onClick={() => setProductPage(page => Math.max(1, page - 1))}
            disabled={safeProductPage === 1}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border border-slate-200 bg-white text-slate-700 disabled:opacity-40"
            aria-label="Halaman produk sebelumnya"
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
            aria-label="Halaman produk berikutnya"
          >
            <ChevronRight size={18} strokeWidth={3} />
          </button>
        </div>
      )}

      {/* TAMPILAN TABEL DESKTOP */}
      <div className="hidden lg:block bg-white rounded-[28px] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Foto</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Produk</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Kode</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Kategori</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Ukuran</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Warna</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Sewa / Denda</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Status</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px] w-64">Detail Rincian Stok</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px] text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-4">
                  <EmptyState
                    title="Kostum Adat Tidak Ditemukan"
                    description="Coba gunakan kata kunci pencarian lain atau pilih kategori/status yang berbeda."
                    ctaText="Reset Filter"
                    onCtaClick={() => {
                      setSearchTerm('');
                      setCategoryFilter('Semua');
                      setStatusFilter('Semua');
                    }}
                  />
                </td>
              </tr>
            ) : paginatedProducts.map(product => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="p-4">
                  {product.photo ? (
                    <img src={product.photo} alt={product.name} className="w-16 h-16 rounded-[18px] object-cover border border-slate-100" />
                  ) : (
                    <div className="w-16 h-16 rounded-[18px] bg-slate-100 flex items-center justify-center text-slate-400">
                      <Package size={24} />
                    </div>
                  )}
                </td>
                <td className="p-4">
                  <p className="break-words font-black leading-snug text-slate-900">{product.name}</p>
                  <p className="mt-1 max-w-sm break-words text-xs leading-relaxed text-slate-500">{product.description || 'Deskripsi belum diisi'}</p>
                </td>
                <td className="p-4 break-words font-semibold text-slate-700">{product.sku || '-'}</td>
                <td className="p-4">
                  <span className="inline-flex max-w-[160px] break-words rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{product.category}</span>
                </td>
                <td className="p-4 break-words font-semibold text-slate-700">{product.size}</td>
                <td className="p-4 break-words font-semibold text-slate-700">{product.color || '-'}</td>
                <td className="p-4">
                  <p className="font-black text-amber-600">{formatCurrency(product.rentPrice)}</p>
                  <p className="text-xs text-red-500 font-semibold">{formatCurrency(product.dailyLateFee)}/hari</p>
                </td>
                <td className="p-4">
                  <select
                    value={product.status || 'tersedia'}
                    onChange={(e) => handleQuickSave(product, { status: e.target.value })}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-black border-0 bg-transparent focus:ring-2 focus:ring-blue-100 transition-colors cursor-pointer ${product.isActive === false || product.status === 'inactive' ? 'bg-slate-100 text-slate-600' : product.status === 'maintenance' ? 'bg-violet-100 text-violet-700' : product.status === 'laundry' ? 'bg-cyan-100 text-cyan-700' : product.availableStock <= 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}
                  >
                    <option value="tersedia" className="bg-white text-emerald-700 font-bold">Tersedia</option>
                    <option value="laundry" className="bg-white text-cyan-700 font-bold">Laundry</option>
                    <option value="maintenance" className="bg-white text-violet-700 font-bold">Perbaikan</option>
                    <option value="inactive" className="bg-white text-slate-600 font-bold">Nonaktif</option>
                  </select>
                </td>
                <td className="p-4">
                  <div className="space-y-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs font-bold text-slate-700 max-w-[220px]">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Tersedia:</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{product.availableStock || 0} unit</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Disewa:</span>
                      <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{product.rentedStock || 0} unit</span>
                    </div>

                    {Number(product.laundryStock || 0) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Laundry:</span>
                        <span className="text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                          {product.laundryStock}
                          <button
                            type="button"
                            onClick={() => handleOpenQuickAction(product, 'laundry')}
                            className="bg-cyan-700 text-white rounded-[4px] px-1 py-0.5 hover:bg-cyan-800 text-[9px] font-black"
                            title="Selesaikan Laundry"
                          >
                            Selesai
                          </button>
                        </span>
                      </div>
                    )}

                    {Number(product.maintenanceStock || 0) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Perbaikan:</span>
                        <span className="text-violet-700 bg-violet-50 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                          {product.maintenanceStock}
                          <button
                            type="button"
                            onClick={() => handleOpenQuickAction(product, 'maintenance')}
                            className="bg-violet-700 text-white rounded-[4px] px-1 py-0.5 hover:bg-violet-800 text-[9px] font-black"
                            title="Selesaikan Perbaikan"
                          >
                            Selesai
                          </button>
                        </span>
                      </div>
                    )}

                    {Number(product.lostStock || 0) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-red-500">Hilang:</span>
                        <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded-full">{product.lostStock} unit</span>
                      </div>
                    )}

                    {Number(product.retiredStock || 0) > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Pensiun:</span>
                        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full">{product.retiredStock} unit</span>
                      </div>
                    )}

                    <div className="pt-1 mt-1 border-t border-slate-200 flex justify-between text-[11px] font-black text-slate-900">
                      <span>Total Fisik:</span>
                      <span>{product.totalStock || 0} unit</span>
                    </div>
                  </div>

                  {/* KONTROL CEPAT STOK TERSEDIA */}
                  <div className="mt-2.5 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickSave(product, { stock: Math.max(0, Number(product.availableStock || 0) - 1) })}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 shadow-sm transition-colors"
                      aria-label="Kurangi stok tersedia"
                    >
                      <Minus size={13} strokeWidth={3} />
                    </button>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Tersedia</span>
                    <button
                      type="button"
                      onClick={() => handleQuickSave(product, { stock: Number(product.availableStock || 0) + 1 })}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition-colors"
                      aria-label="Tambah stok tersedia"
                    >
                      <Plus size={13} strokeWidth={3} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenQuickAction(product, 'retire')}
                      className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-white hover:bg-slate-950 shadow-sm text-[10px] font-black"
                      title="Pensiunkan Kostum"
                    >
                      P
                    </button>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-1.5">
                    <button type="button" onClick={() => handleOpenProductItems(product)} className="rounded-[12px] bg-cyan-50 p-2 text-cyan-700 transition-colors hover:bg-cyan-700 hover:text-white" title="Kelola Unit & QR"><Barcode size={14} /></button>
                    <button type="button" onClick={() => openModal(product)} className="rounded-[12px] bg-blue-50 p-2 text-blue-700 transition-colors hover:bg-blue-700 hover:text-white" title="Ubah produk"><Edit size={14} /></button>
                    <button type="button" onClick={() => handleDuplicate(product)} className="rounded-[12px] bg-emerald-50 p-2 text-emerald-700 transition-colors hover:bg-emerald-700 hover:text-white" title="Duplikat produk"><Copy size={14} /></button>
                    <button type="button" onClick={() => handleDelete(product)} className="rounded-[12px] bg-red-50 p-2 text-red-700 transition-colors hover:bg-red-700 hover:text-white" title="Nonaktifkan"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TAMPILAN MOBILE */}
      <div className="space-y-2.5 lg:hidden">
        {filteredProducts.length === 0 ? (
          <EmptyState
            title="Kostum Adat Tidak Ditemukan"
            description="Coba gunakan kata kunci pencarian lain atau pilih kategori/status yang berbeda."
            ctaText="Reset Filter"
            onCtaClick={() => {
              setSearchTerm('');
              setCategoryFilter('Semua');
              setStatusFilter('Semua');
            }}
          />
        ) : paginatedProducts.map(product => (
          <div key={product.id} className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="flex gap-3 sm:gap-4">
              <div className="shrink-0">
                {product.photo ? (
                  <img src={product.photo} alt={product.name} className="h-14 w-14 rounded-xl border border-slate-100 object-cover sm:h-24 sm:w-24 sm:rounded-[20px]" />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400 sm:h-24 sm:w-24 sm:rounded-[20px]">
                    <Package size={22} className="sm:h-7 sm:w-7" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 break-words text-sm font-semibold leading-tight text-slate-900 sm:font-black">{product.name}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px] sm:mt-2 sm:gap-2 sm:text-[11px]">
                      <span className="max-w-full break-words rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-700 sm:px-2.5 sm:py-1">{product.category}</span>
                      <span className="max-w-full break-words rounded-full bg-slate-100 px-2 py-0.5 font-bold text-slate-700 sm:px-2.5 sm:py-1">{product.size}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold sm:text-[11px] sm:font-black ${product.availableStock > 2 ? 'bg-emerald-100 text-emerald-700' : product.availableStock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {product.availableStock} unit
                  </span>
                </div>

                {/* DETAIL STOK MOBILE */}
                <div className="mt-3 grid grid-cols-3 gap-1 bg-slate-50 p-2 rounded-xl text-[10px] font-bold text-slate-500 sm:text-[11px]">
                  <div>Tersedia: <span className="text-emerald-700">{product.availableStock || 0}</span></div>
                  <div>Disewa: <span className="text-blue-700">{product.rentedStock || 0}</span></div>
                  <div>Laundry: <span className="text-cyan-700">{product.laundryStock || 0}</span></div>
                  <div>Rusak: <span className="text-violet-700">{product.maintenanceStock || 0}</span></div>
                  <div>Hilang: <span className="text-red-700">{product.lostStock || 0}</span></div>
                  <div>Pensiun: <span className="text-slate-600">{product.retiredStock || 0}</span></div>
                </div>

                {/* TOMBOL AKSI CEPAT MOBILE */}
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {Number(product.laundryStock || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => handleOpenQuickAction(product, 'laundry')}
                      className="rounded-lg bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-700 border border-cyan-100"
                    >
                      Laundry Selesai ({product.laundryStock})
                    </button>
                  )}
                  {Number(product.maintenanceStock || 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => handleOpenQuickAction(product, 'maintenance')}
                      className="rounded-lg bg-violet-50 px-2 py-1 text-[10px] font-bold text-violet-700 border border-violet-100"
                    >
                      Perbaikan Selesai ({product.maintenanceStock})
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenQuickAction(product, 'retire')}
                    className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 border border-slate-200"
                  >
                    Pensiunkan Kostum
                  </button>
                </div>

                <div className="mt-2.5 space-y-0.5 text-xs sm:mt-3 sm:text-sm">
                  <p className="break-words font-bold text-amber-600 sm:font-black">{formatCurrency(product.rentPrice)}</p>
                  <p className="font-semibold text-red-500">{formatCurrency(product.dailyLateFee)}/hari</p>
                  <p className="break-words text-[11px] font-bold text-slate-400 sm:text-xs">Kode: {product.sku || '-'}</p>
                  <p className="text-[11px] font-bold text-slate-400 sm:text-xs">
                    Status: {getProductStatusLabel(product)}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4">
                  <button type="button" onClick={() => handleOpenProductItems(product)} className="flex-1 min-w-[70px] rounded-xl bg-cyan-50 text-cyan-700 hover:bg-cyan-100 py-2 px-1 text-[11px] font-bold min-h-[44px] flex items-center justify-center transition">Kelola Unit</button>
                  <button type="button" onClick={() => openModal(product)} className="flex-1 min-w-[70px] rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 py-2 px-1 text-[11px] font-bold min-h-[44px] flex items-center justify-center transition">Edit</button>
                  <button type="button" onClick={() => handleDuplicate(product)} className="flex-1 min-w-[70px] rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 py-2 px-1 text-[11px] font-bold min-h-[44px] flex items-center justify-center transition">Salin</button>
                  <button type="button" onClick={() => handleDelete(product)} className="flex-1 min-w-[70px] rounded-xl bg-red-50 text-red-700 hover:bg-red-100 py-2 px-1 text-[11px] font-bold min-h-[44px] flex items-center justify-center transition">Hapus</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length > PRODUCTS_PER_PAGE && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-[20px] border border-slate-200 bg-white p-3 shadow-sm">
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

      {/* FORM MODAL ADD/EDIT PRODUK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-blue-900 px-5 py-4 text-white">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-blue-100">Produk</p>
                <h3 className="mt-1 text-lg font-black">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} disabled={isUploading} className="rounded-full bg-blue-800 p-2 hover:bg-blue-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="max-h-[80vh] overflow-y-auto bg-slate-50 px-5 py-5 space-y-4">
              <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Nama Produk</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                  disabled={isUploading}
                />
              </div>

              <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Foto Produk (Opsional)</label>
                {formData.photo && (
                  <div className="flex justify-center mb-3">
                    <img src={formData.photo} alt="Preview" className="h-28 w-28 rounded-[20px] object-cover border border-slate-100" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  disabled={isUploading}
                  onChange={handleImageSelect}
                  className="w-full rounded-[16px] border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500"
                />
                {isUploading && (
                  <p className="mt-2 flex items-center gap-2 text-sm font-bold text-amber-600">
                    <Cloud size={16} className="animate-pulse" /> Memproses gambar...
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Kategori</label>
                  <input
                    required
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                    disabled={isUploading}
                  />
                </div>

                <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Kode Produk</label>
                  <input
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Contoh: BODO-001"
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                    disabled={isUploading}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Ukuran</label>
                  <input
                    required
                    value={formData.size}
                    onChange={(e) => setFormData(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                    disabled={isUploading}
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sizeOptions.map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, size }))}
                        className={`rounded-full px-3 py-1 text-[11px] font-bold ${formData.size === size ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Warna</label>
                  <input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Contoh: Merah, Hijau, Emas"
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                    disabled={isUploading}
                  />
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Status Operasional</label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, status }))}
                      className={`rounded-full px-3 py-2 text-[11px] font-bold ${formData.status === status ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
                    >
                      {getStatusOptionLabel(status)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Deskripsi Singkat</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows="3"
                  placeholder="Catatan kondisi, bahan, atau kebutuhan khusus produk"
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 resize-none"
                  disabled={isUploading}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Sewa</label>
                  <input
                    type="text"
                    required
                    value={formatNumberDot(formData.rentPrice)}
                    onChange={(e) => setFormData(prev => ({ ...prev, rentPrice: e.target.value.replace(/[^0-9]/g, '') }))}
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                    disabled={isUploading}
                  />
                </div>
                <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Denda</label>
                  <input
                    type="text"
                    required
                    value={formatNumberDot(formData.dailyLateFee)}
                    onChange={(e) => setFormData(prev => ({ ...prev, dailyLateFee: e.target.value.replace(/[^0-9]/g, '') }))}
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                    disabled={isUploading}
                  />
                </div>
                <div className="rounded-[24px] bg-white p-4 border border-slate-100">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Stok Tersedia</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                    disabled={isUploading}
                  />
                </div>
              </div>

              {/* FIELD ALASAN PENYESUAIAN STOK WAJIB JIKA BERUBAH */}
              {editingProduct && Number(formData.stock) !== Number(editingProduct.availableStock) && (
                <div className="rounded-[24px] bg-amber-50/50 p-4 border border-amber-200">
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-amber-800 mb-2">Alasan Penyesuaian Stok (Wajib)</label>
                  <textarea
                    required
                    value={formData.adjustmentReason || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, adjustmentReason: e.target.value }))}
                    placeholder="Sebutkan alasan perubahan stok (misal: Koreksi selisih, tambah stok fisik baru, barang rusak/pensiun, dsb.)"
                    rows="2"
                    className="w-full rounded-[16px] border border-amber-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 resize-none focus:ring-2 focus:ring-amber-100"
                    disabled={isUploading}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUploading}
                  className="flex-1 rounded-[18px] border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading || (editingProduct && Number(formData.stock) !== Number(editingProduct.availableStock) && !formData.adjustmentReason?.trim())}
                  className="flex-1 rounded-[18px] bg-blue-800 py-3.5 text-sm font-black text-white disabled:opacity-50"
                >
                  {isUploading ? 'Proses...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIALOG MODAL AKSI CEPAT OPERASIONAL GUDANG */}
      {quickAction.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-[24px] bg-white shadow-2xl">
            <div className="bg-slate-900 px-5 py-4 text-white">
              <h3 className="text-base font-black">
                {quickAction.type === 'laundry' && 'Selesaikan Cuci Laundry'}
                {quickAction.type === 'maintenance' && 'Selesaikan Perbaikan Kostum'}
                {quickAction.type === 'retire' && 'Pensiunkan Kostum Adat'}
              </h3>
              <p className="mt-1 text-xs text-slate-400 font-bold">{quickAction.product?.name}</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Jumlah Unit (Qty)</label>
                <input
                  type="number"
                  min="1"
                  max={quickAction.type === 'laundry' ? quickAction.product?.laundryStock : quickAction.type === 'maintenance' ? quickAction.product?.maintenanceStock : quickAction.product?.availableStock}
                  value={quickAction.qty}
                  onChange={(e) => setQuickAction(prev => ({ ...prev, qty: Math.max(1, Number(e.target.value)) }))}
                  className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                />
              </div>

              {quickAction.type === 'retire' && (
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Pensiunkan dari Bucket</label>
                  <select
                    value={quickAction.fromBucket}
                    onChange={(e) => setQuickAction(prev => ({ ...prev, fromBucket: e.target.value }))}
                    className="w-full rounded-[16px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800"
                  >
                    <option value="available">Tersedia ({quickAction.product?.availableStock || 0})</option>
                    <option value="laundry">Laundry ({quickAction.product?.laundryStock || 0})</option>
                    <option value="maintenance">Perbaikan ({quickAction.product?.maintenanceStock || 0})</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickAction({ isOpen: false, type: '', product: null, qty: 1, fromBucket: 'available' })}
                  className="flex-1 rounded-[16px] border border-slate-200 bg-white py-3 text-xs font-bold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmQuickAction}
                  className="flex-1 rounded-[16px] bg-blue-900 py-3 text-xs font-black text-white hover:bg-blue-800"
                >
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        cancelLabel="Batal"
        confirmLabel="Nonaktifkan"
        description={`Produk ${deleteDialog.product?.name || ''} akan dinonaktifkan dari transaksi baru tanpa menghapus riwayat inventaris.`}
        isLoading={deleteDialog.isLoading}
        onCancel={() => setDeleteDialog({ isOpen: false, product: null, isLoading: false })}
        onConfirm={handleConfirmDelete}
        open={deleteDialog.isOpen}
        title="Nonaktifkan produk ini?"
        tone="danger"
      />

      {/* DIALOG MODAL KELOLA UNIT & QR */}
      {selectedProductForItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between bg-blue-900 px-6 py-4.5 text-white shrink-0">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-200">Gudang & Identitas Inventaris</p>
                <h3 className="mt-1 text-lg font-black flex items-center gap-2"><Barcode size={20} className="text-yellow-400" /> Kelola Unit Fisik & QR</h3>
              </div>
              <button type="button" onClick={() => setSelectedProductForItems(null)} className="rounded-full bg-blue-800 p-2 hover:bg-blue-700 transition">
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto bg-slate-50 px-6 py-6 space-y-6 flex-1">
              {/* Info Produk */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white border border-slate-100 p-4 rounded-2xl shadow-sm gap-4">
                <div className="flex items-center gap-3">
                  {selectedProductForItems.photo ? (
                    <img src={selectedProductForItems.photo} alt={selectedProductForItems.name} className="h-12 w-12 rounded-xl object-cover" />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400"><Package size={20} /></div>
                  )}
                  <div>
                    <h4 className="text-base font-black text-slate-900 leading-snug">{selectedProductForItems.name}</h4>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Kategori: {selectedProductForItems.category} | Ukuran: {selectedProductForItems.size} | Lokasi: {selectedProductForItems.location || 'Gudang Utama'}</p>
                  </div>
                </div>
                <div className="flex gap-2 text-xs font-bold text-center">
                  <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-100">
                    <p className="text-[9px] uppercase opacity-75">Tersedia</p>
                    <p className="text-sm font-black mt-0.5">{selectedProductForItems.availableStock || 0}</p>
                  </div>
                  <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-100">
                    <p className="text-[9px] uppercase opacity-75">Disewa</p>
                    <p className="text-sm font-black mt-0.5">{selectedProductForItems.rentedStock || 0}</p>
                  </div>
                  <div className="bg-cyan-50 text-cyan-700 px-3 py-1.5 rounded-xl border border-cyan-100">
                    <p className="text-[9px] uppercase opacity-75">Laundry</p>
                    <p className="text-sm font-black mt-0.5">{selectedProductForItems.laundryStock || 0}</p>
                  </div>
                  <div className="bg-violet-50 text-violet-700 px-3 py-1.5 rounded-xl border border-violet-100">
                    <p className="text-[9px] uppercase opacity-75">Rusak</p>
                    <p className="text-sm font-black mt-0.5">{selectedProductForItems.maintenanceStock || 0}</p>
                  </div>
                </div>
              </div>

              {/* Loader */}
              {isItemsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 font-bold">
                  <div className="h-10 w-10 rounded-full border-4 border-slate-100 border-t-blue-800 animate-spin" />
                  <p className="text-sm">Menyiapkan daftar unit item fisik...</p>
                </div>
              ) : productItemsList.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm space-y-2">
                  <Package size={36} className="mx-auto text-slate-350" />
                  <p className="font-black text-slate-900">Belum ada unit item fisik ter-generate.</p>
                  <p className="text-xs max-w-sm mx-auto leading-relaxed">
                    Sistem akan mengotomatisasi pembuatan unit item fisik baru ketika Anda menambahkan stok pada form edit produk.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {productItemsList.map(item => {
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${item.itemCode}`;
                    return (
                      <div key={item.id} className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-sm flex gap-4 hover:border-blue-200 transition relative overflow-hidden group">

                        {/* Status label di kanan atas */}
                        <span className={`absolute top-0 right-0 rounded-bl-xl px-2.5 py-1 text-[9px] font-black uppercase tracking-wider ${
                          item.status === 'READY'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.status === 'RENTED'
                              ? 'bg-blue-100 text-blue-700'
                              : item.status === 'IN_LAUNDRY'
                                ? 'bg-cyan-100 text-cyan-700'
                                : item.status === 'IN_MAINTENANCE'
                                  ? 'bg-violet-100 text-violet-700'
                                  : 'bg-red-100 text-red-700'
                        }`}>
                          {item.status}
                        </span>

                        {/* QR & Barcode Visual Column */}
                        <div className="flex flex-col items-center gap-2 shrink-0 select-none">
                          <img
                            src={qrUrl}
                            alt="QR Code"
                            className="w-[84px] h-[84px] border border-slate-150 p-1 bg-white rounded-lg object-contain"
                            title="Klik kanan untuk simpan QR"
                          />
                          <BarcodeCanvas value={item.itemCode} height={20} width={1.2} />
                        </div>

                        {/* Detail Info & Aksi Operasional per Unit */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Kode Unit Fisik</p>
                            <p className="text-sm font-black text-slate-900 mt-0.5 truncate select-all">{item.itemCode}</p>

                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mt-2">Kondisi Kostum</p>
                            <p className="text-xs font-black text-slate-700 capitalize mt-0.5">
                              {item.condition === 'good' && '🟢 Bagus / Siap'}
                              {item.condition === 'laundry' && '🔵 Kotor (Laundry)'}
                              {item.condition === 'damaged' && '🟣 Rusak Ringan'}
                              {item.condition === 'lost' && '🔴 Hilang'}
                            </p>
                          </div>

                          {/* Tombol Aksi per Unit */}
                          {item.status !== 'RENTED' && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {item.status !== 'READY' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItemStatus(item, 'READY', 'good')}
                                  disabled={isSavingItemStatus}
                                  className="rounded-[6px] bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-700 hover:text-white px-2 py-1 text-[9px] font-black transition-colors"
                                >
                                  Pulihkan Siap
                                </button>
                              )}
                              {item.status !== 'IN_LAUNDRY' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItemStatus(item, 'IN_LAUNDRY', 'laundry')}
                                  disabled={isSavingItemStatus}
                                  className="rounded-[6px] bg-cyan-50 text-cyan-700 border border-cyan-100 hover:bg-cyan-700 hover:text-white px-2 py-1 text-[9px] font-black transition-colors"
                                >
                                  Kirim Laundry
                                </button>
                              )}
                              {item.status !== 'IN_MAINTENANCE' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItemStatus(item, 'IN_MAINTENANCE', 'damaged')}
                                  disabled={isSavingItemStatus}
                                  className="rounded-[6px] bg-violet-50 text-violet-700 border border-violet-100 hover:bg-violet-700 hover:text-white px-2 py-1 text-[9px] font-black transition-colors"
                                >
                                  Kirim Perbaikan
                                </button>
                              )}
                              {item.status !== 'LOST' && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateItemStatus(item, 'LOST', 'lost')}
                                  disabled={isSavingItemStatus}
                                  className="rounded-[6px] bg-red-50 text-red-700 border border-red-100 hover:bg-red-700 hover:text-white px-2 py-1 text-[9px] font-black transition-colors"
                                >
                                  Laporkan Hilang
                                </button>
                              )}
                            </div>
                          )}

                          {item.status === 'RENTED' && (
                            <p className="mt-3 text-[10px] font-black text-blue-700 italic">
                              Kostum sedang disewakan (aktif). Operasional unit dinonaktifkan sementara.
                            </p>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 bg-slate-100 border-t border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedProductForItems(null)}
                className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  const printWindow = window.open('', '', 'width=800,height=600');
                  printWindow.document.write('<html><head><title>Cetak Label Unit Kostum</title><style>');
                  printWindow.document.write('body { font-family: sans-serif; background: white; padding: 20px; }');
                  printWindow.document.write('.grid { display: grid; grid-template-cols: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px; }');
                  printWindow.document.write('.card { border: 1px solid #ddd; padding: 12px; border-radius: 8px; text-align: center; background: white; }');
                  printWindow.document.write('.title { font-weight: bold; font-size: 11px; margin-bottom: 4px; }');
                  printWindow.document.write('.subtitle { font-size: 9px; color: #666; margin-bottom: 8px; }');
                  printWindow.document.write('.qr { width: 100px; height: 100px; margin-bottom: 8px; }');
                  printWindow.document.write('.code { font-family: monospace; font-size: 10px; font-weight: bold; }');
                  printWindow.document.write('</style></head><body>');
                  printWindow.document.write('<h3>LABEL INVENTARIS: ' + selectedProductForItems.name + '</h3>');
                  printWindow.document.write('<div class="grid">');
                  productItemsList.forEach(item => {
                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${item.itemCode}`;
                    printWindow.document.write('<div class="card">');
                    printWindow.document.write('<div class="title">' + selectedProductForItems.name + '</div>');
                    printWindow.document.write('<div class="subtitle">Kategori: ' + selectedProductForItems.category + ' | Size: ' + item.size + '</div>');
                    printWindow.document.write('<img class="qr" src="' + qrUrl + '" />');
                    printWindow.document.write('<div class="code">' + item.itemCode + '</div>');
                    printWindow.document.write('</div>');
                  });
                  printWindow.document.write('</div>');
                  printWindow.document.write('</body></html>');
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                  }, 500);
                }}
                disabled={isItemsLoading || productItemsList.length === 0}
                className="flex-1 rounded-2xl bg-cyan-700 hover:bg-cyan-800 disabled:bg-slate-300 disabled:cursor-not-allowed py-3 text-sm font-black text-white shadow-md flex items-center justify-center gap-1.5 transition"
              >
                <Printer size={16} />
                Cetak Semua Label
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
