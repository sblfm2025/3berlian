import { useState, useMemo } from 'react';
import { Package, Plus, Search, Cloud, Edit, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatNumberDot } from '../utils/format';
import { normalizeProduct } from '../utils/product';
import { compressImage } from '../utils/browser';

const PRODUCTS_PER_PAGE = 20;

const getProductStatusLabel = (product) => {
  if (product.status === 'maintenance') return 'Perbaikan';
  if (product.status === 'laundry') return 'Laundry';
  if (product.stock <= 0) return 'Habis';
  if (product.stock <= 2) return 'Stok rendah';
  return 'Tersedia';
};

const getStatusOptionLabel = (status) => {
  if (status === 'maintenance') return 'Perbaikan';
  if (status === 'laundry') return 'Laundry';
  if (status === 'habis') return 'Habis';
  if (status === 'rendah') return 'Stok rendah';
  if (status === 'tersedia') return 'Tersedia';
  return status;
};

// ==========================================
export default function ProductsPage({ products, onSave, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [productPage, setProductPage] = useState(1);

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
    dailyLateFee: ''
  });

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'All Size'];
  const statusOptions = ['tersedia', 'maintenance', 'laundry', 'habis'];

  const normalizedProducts = useMemo(() => {
    return products.map(normalizeProduct);
  }, [products]);

  const categories = useMemo(() => {
    const unique = ['Semua', ...new Set(normalizedProducts.map(product => product.category).filter(Boolean))];
    return unique;
  }, [normalizedProducts]);

  const stats = useMemo(() => {
    const available = normalizedProducts.filter(product => product.stock > 0).length;
    const lowStock = normalizedProducts.filter(product => product.stock > 0 && product.stock <= 2).length;
    const outOfStock = normalizedProducts.filter(product => product.stock <= 0).length;
    const totalInventoryValue = normalizedProducts.reduce((sum, product) => sum + product.rentPrice * product.stock, 0);

    return { available, lowStock, outOfStock, totalInventoryValue };
  }, [normalizedProducts]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return normalizedProducts.filter(product => {
      const matchesSearch = [product.name, product.category, product.size].join(' ').toLowerCase().includes(term);
      const matchesCategory = categoryFilter === 'Semua' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'Semua'
        || (statusFilter === 'tersedia' && product.stock > 0)
        || (statusFilter === 'habis' && product.stock <= 0)
        || (statusFilter === 'rendah' && product.stock > 0 && product.stock <= 2);
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
        status: product.status || (Number(product.stock) > 0 ? 'tersedia' : 'habis'),
        rentPrice: String(product.rentPrice || ''),
        stock: String(product.stock || ''),
        photo: product.photo || '',
        dailyLateFee: String(product.dailyLateFee || '')
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
        dailyLateFee: ''
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
      alert('Gagal memproses gambar. Coba gambar lain.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      const stockValue = Number(formData.stock);
      const rentPriceValue = Number(formData.rentPrice);
      const dailyLateFeeValue = Number(formData.dailyLateFee);
      const dataToSave = {
        ...formData,
        rentPrice: rentPriceValue,
        dailyRentPrice: rentPriceValue,
        stock: stockValue,
        stockTotal: Number(formData.stockTotal ?? stockValue),
        stockAvailable: Number(formData.stockAvailable ?? stockValue),
        stockRented: Number(formData.stockRented || 0),
        stockLaundry: Number(formData.stockLaundry || 0),
        stockDamaged: Number(formData.stockDamaged || 0),
        dailyLateFee: dailyLateFeeValue,
        lateFeePerDay: dailyLateFeeValue,
        gender: formData.gender || 'Unisex',
        notes: formData.notes || '',
        status: formData.status || (stockValue > 0 ? 'tersedia' : 'habis')
      };

      if (editingProduct) dataToSave.id = editingProduct.id;

      await onSave(dataToSave, !!editingProduct);
      setIsModalOpen(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Yakin ingin menghapus produk ini?')) onDelete(id);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="sticky top-0 z-20 mb-5 grid gap-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:static md:mb-6 md:border-0 md:bg-transparent md:p-0 md:shadow-none xl:grid-cols-[1.2fr_1fr] xl:items-end">
        <div>
          <p className="text-sm font-semibold text-slate-500">Inventaris</p>
          <h2 className="mt-2 text-2xl font-black text-slate-900">Manajemen produk penyewaan</h2>
          <p className="mt-2 hidden max-w-2xl text-sm text-slate-600 md:block">
            Pantau stok, kategori, dan harga sewa dengan cepat agar proses pembayaran dan pengembalian lebih konsisten.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
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
            className="rounded-[18px] bg-amber-500 px-5 py-3 text-sm font-black text-white shadow-sm transition-transform active:scale-95"
          >
            <span className="flex items-center justify-center gap-2">
              <Plus size={18} strokeWidth={3} />
              Tambah Produk
            </span>
          </button>
        </div>
      </div>

      <div className="mb-6 hidden gap-3 sm:grid-cols-2 md:grid xl:grid-cols-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Total produk</p>
          <p className="mt-3 text-2xl font-black text-slate-900">{normalizedProducts.length}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Tersedia</p>
          <p className="mt-3 text-2xl font-black text-emerald-600">{stats.available}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Stok rendah</p>
          <p className="mt-3 text-2xl font-black text-amber-600">{stats.lowStock}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Nilai stok</p>
          <p className="mt-3 text-2xl font-black text-blue-700">{formatCurrency(stats.totalInventoryValue)}</p>
        </div>
      </div>

      <div className="mb-5 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
          {categories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => {
                setCategoryFilter(category);
                setProductPage(1);
              }}
              className={`shrink-0 max-w-full break-words rounded-full px-4 py-2 text-sm font-bold transition-all ${categoryFilter === category ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible">
          {['Semua', 'tersedia', 'rendah', 'habis'].map(option => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setStatusFilter(option);
                setProductPage(1);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-all ${statusFilter === option ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
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
          <span className="rounded-full bg-blue-50 px-3 py-1 text-blue-700">
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

      <div className="hidden lg:block bg-white rounded-[28px] border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Foto</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Produk</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Kode Produk</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Kategori</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Ukuran</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Warna</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Sewa / Denda</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Status</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px]">Stok</th>
              <th className="p-4 font-bold text-slate-500 uppercase tracking-[0.2em] text-[11px] text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-8 text-center text-slate-500">Produk tidak ditemukan.</td>
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
                  <span className={`rounded-full px-3 py-1 text-[11px] font-black ${product.status === 'maintenance' ? 'bg-violet-100 text-violet-700' : product.status === 'laundry' ? 'bg-cyan-100 text-cyan-700' : product.stock <= 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {getProductStatusLabel(product)}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${product.stock > 2 ? 'bg-emerald-100 text-emerald-700' : product.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stock} unit
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button type="button" onClick={() => openModal(product)} className="rounded-[14px] bg-blue-50 p-2.5 text-blue-700 transition-colors hover:bg-blue-700 hover:text-white"><Edit size={16} /></button>
                    <button type="button" onClick={() => handleDelete(product.id)} className="rounded-[14px] bg-red-50 p-2.5 text-red-700 transition-colors hover:bg-red-700 hover:text-white"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
            Produk tidak ditemukan.
          </div>
        ) : paginatedProducts.map(product => (
          <div key={product.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex gap-3 sm:gap-4">
              <div className="shrink-0">
                {product.photo ? (
                  <img src={product.photo} alt={product.name} className="h-20 w-20 rounded-[20px] border border-slate-100 object-cover sm:h-24 sm:w-24" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-slate-100 text-slate-400 sm:h-24 sm:w-24">
                    <Package size={28} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-black leading-tight text-slate-900">{product.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                      <span className="max-w-full break-words rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">{product.category}</span>
                      <span className="max-w-full break-words rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">{product.size}</span>
                      <span className="max-w-full break-words rounded-full bg-slate-100 px-2.5 py-1 font-bold text-slate-700">{product.color || 'Warna belum diisi'}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-black ${product.stock > 2 ? 'bg-emerald-100 text-emerald-700' : product.stock > 0 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                    {product.stock} unit
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm">
                  <p className="break-words font-black text-amber-600">{formatCurrency(product.rentPrice)}</p>
                  <p className="text-red-500 font-semibold">{formatCurrency(product.dailyLateFee)}/hari</p>
                  <p className="break-words text-xs font-bold text-slate-400">Kode: {product.sku || '-'}</p>
                  <p className="text-xs font-bold text-slate-400">
                    {getProductStatusLabel(product)}
                  </p>
                  <p className="mt-1 break-words text-sm leading-relaxed text-slate-500">{product.description || 'Deskripsi belum diisi'}</p>
                </div>

                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={() => openModal(product)} className="flex-1 rounded-[16px] bg-blue-50 py-2.5 text-sm font-bold text-blue-700">Edit</button>
                  <button type="button" onClick={() => handleDelete(product.id)} className="flex-1 rounded-[16px] bg-red-50 py-2.5 text-sm font-bold text-red-700">Hapus</button>
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
                  <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-2">Stok</label>
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
                  disabled={isUploading}
                  className="flex-1 rounded-[18px] bg-blue-800 py-3.5 text-sm font-black text-white"
                >
                  {isUploading ? 'Proses...' : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
