import { Search, ChevronLeft, ChevronRight, Package, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import ProductFilterDrawer from './ProductFilterDrawer';
import VariantPickerModal from './VariantPickerModal';

export default function ProductCatalog({
  search,
  updateSearch,
  categories,
  selectedCategory,
  selectCategory,
  favoriteProducts,
  updateCartQty,
  cart,
  lastCompletedTransaction,
  applyLastTransaction,
  clearCart,
  categoryCounts,
  availableProducts,
  paginatedProducts,
  safeProductPage,
  productPageCount,
  productStartNumber,
  productEndNumber,
  sortedProducts,
  setProductPage,
  PRODUCTS_PER_PAGE,
  formatCurrency,
  formatDate
}) {
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [variantProduct, setVariantProduct] = useState(null);
  const primaryCategories = useMemo(() => {
    const preferred = ['Semua', 'Bugis', 'Jilbab', 'Aksesoris', 'Anak', 'Lainnya'];
    const byPreferred = preferred.filter(category => categories.includes(category));
    const fallback = categories.filter(category => !byPreferred.includes(category)).slice(0, Math.max(0, 6 - byPreferred.length));
    return [...byPreferred, ...fallback].slice(0, 6);
  }, [categories]);
  const handleAddProduct = (product) => {
    if (Array.isArray(product.variants) && product.variants.length > 1) {
      setVariantProduct(product);
      return;
    }
    updateCartQty(product, 1);
  };

  const handleConfirmVariant = ({ variant, qty }) => {
    if (!variantProduct) return;
    updateCartQty(variantProduct, qty, variant);
    setVariantProduct(null);
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className={`pos-card sticky top-0 z-20 p-4 md:static md:p-5 ${search ? 'hidden md:block' : ''}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-slate-500">Katalog produk</p>
            <h3 className="mt-1 text-base font-bold text-slate-900 sm:text-lg">Pilih kostum untuk transaksi</h3>
          </div>
          <div className="relative hidden flex-1 max-w-xl md:block">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari produk, kategori, atau ukuran"
              value={search}
              onChange={event => {
                updateSearch(event.target.value);
              }}
              className="w-full rounded-[18px] border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm font-medium text-slate-700 focus:border-blue-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-nowrap gap-2 overflow-x-auto pb-1 md:mt-4 md:flex-wrap md:overflow-visible">
          {primaryCategories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => {
                selectCategory(category);
              }}
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-all sm:px-4 sm:py-2 sm:text-sm ${selectedCategory === category ? 'bg-blue-700 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'}`}
            >
              {category}
            </button>
          ))}
          {categories.length > primaryCategories.length && (
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-700 sm:px-4 sm:py-2 sm:text-sm"
            >
              <SlidersHorizontal size={14} />
              Filter
            </button>
          )}
        </div>

        <div className="mt-4 hidden rounded-[22px] border border-slate-200 bg-slate-50 p-4 md:block">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px] sm:tracking-[0.18em]">Produk cepat</p>
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
                  onClick={() => handleAddProduct(product)}
                  className="rounded-[18px] border border-slate-200 bg-white px-3 py-2 text-left shadow-sm"
                >
                  <p className="text-sm font-bold text-slate-900">{product.name}</p>
                  <p className="mt-1 text-[11px] text-slate-500">{formatCurrency(product.rentPrice)} - {selectedQty > 0 ? `${selectedQty} di keranjang` : 'Tambah cepat'}</p>
                </button>
              );
            })}
          </div>

          {lastCompletedTransaction && (
            <div className="mt-3 rounded-[20px] border border-blue-100 bg-gradient-to-r from-blue-50 to-amber-50 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700 sm:text-[11px] sm:tracking-[0.18em]">Transaksi terakhir</p>
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
                updateSearch('');
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
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">{item.category}</p>
              <p className="mt-1 text-sm font-bold text-slate-900">{item.count} produk siap</p>
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
            <p className="text-sm font-bold text-slate-900">Halaman {safeProductPage} dari {productPageCount}</p>
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

      <div className="grid gap-2.5 pb-28 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-4 md:gap-5 xl:pb-6">
        {availableProducts.length === 0 ? (
          <div className="col-span-full rounded-[24px] border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
            <Package size={32} className="mx-auto text-slate-300" />
            <p className="mt-3 font-bold text-slate-700">Barang tidak ditemukan</p>
            <p className="mt-1 text-sm">Coba ubah kata kunci atau kategori.</p>
          </div>
        ) : paginatedProducts.map(product => {
          const productCartItems = cart.filter(item => item.product.id === product.id);
          const cartItem = productCartItems.length > 0
            ? {
              ...productCartItems[0],
              qty: productCartItems.reduce((sum, item) => sum + Number(item.qty || 0), 0)
            }
            : null;
          const isSelected = Boolean(cartItem);

          return (
            <ProductCard
              key={product.id}
              product={product}
              cartItem={cartItem}
              isSelected={isSelected}
              updateCartQty={updateCartQty}
              onAddProduct={handleAddProduct}
              formatCurrency={formatCurrency}
            />
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
          <span className="text-sm font-bold text-slate-900">{safeProductPage}/{productPageCount}</span>
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

      <ProductFilterDrawer
        categories={categories}
        categoryCounts={categoryCounts}
        filterSearch={filterSearch}
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        onSelect={selectCategory}
        selectedCategory={selectedCategory}
        setFilterSearch={setFilterSearch}
      />
      {variantProduct && (
        <VariantPickerModal
          key={variantProduct.id}
          product={variantProduct}
          open={Boolean(variantProduct)}
          onClose={() => setVariantProduct(null)}
          onConfirm={handleConfirmVariant}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}
