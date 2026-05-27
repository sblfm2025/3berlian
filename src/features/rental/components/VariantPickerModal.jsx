import { useMemo, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';

const getVariantKey = (variant = {}, index = 0) => (
  String(variant.id || variant.variantId || `${variant.size || 'All Size'}-${variant.color || 'default'}-${index}`)
);

const getProductVariants = (product = {}) => {
  if (Array.isArray(product.variants) && product.variants.length > 0) return product.variants;

  return [{
    id: `${product.id || 'product'}-${product.size || 'default'}`,
    size: product.size || 'All Size',
    color: product.color || '',
    rentPrice: Number(product.rentPrice || 0),
    deposit: Number(product.deposit || 0),
    stockAvailable: Number(product.stock || product.availableStock || 0)
  }];
};

export default function VariantPickerModal({ product, open, onClose, onConfirm, formatCurrency }) {
  const variants = useMemo(() => getProductVariants(product), [product]);
  const [selectedKey, setSelectedKey] = useState(() => getVariantKey(variants[0], 0));
  const [qty, setQty] = useState(1);

  if (!open || !product) return null;

  const activeSelectedKey = selectedKey || getVariantKey(variants[0], 0);
  const selectedIndex = variants.findIndex((variant, index) => getVariantKey(variant, index) === activeSelectedKey);
  const selectedVariant = variants[Math.max(0, selectedIndex)] || variants[0] || {};
  const stockAvailable = Number(selectedVariant.stockAvailable ?? selectedVariant.availableStock ?? product.stock ?? product.availableStock ?? 0);
  const safeMaxQty = Math.max(1, stockAvailable || 1);
  const safeQty = Math.min(Math.max(1, Number(qty || 1)), safeMaxQty);
  const rentPrice = Number(selectedVariant.rentPrice ?? product.rentPrice ?? 0);
  const deposit = Number(selectedVariant.deposit ?? product.deposit ?? 0);
  const isOutOfStock = stockAvailable <= 0;

  const handleConfirm = () => {
    if (isOutOfStock) return;
    onConfirm?.({
      qty: safeQty,
      variant: {
        ...selectedVariant,
        size: selectedVariant.size || product.size || 'All Size',
        color: selectedVariant.color || product.color || '',
        rentPrice,
        deposit
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700 sm:text-[11px]">Pilih varian</p>
            <h3 className="mt-1 break-words text-base font-bold text-slate-900">{product.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600"
            aria-label="Tutup pilihan varian"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid gap-2">
            {variants.map((variant, index) => {
              const key = getVariantKey(variant, index);
              const variantStock = Number(variant.stockAvailable ?? variant.availableStock ?? product.stock ?? product.availableStock ?? 0);
              const isSelected = key === activeSelectedKey;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  className={`rounded-[18px] border p-3 text-left transition-all ${isSelected ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-bold text-slate-900">
                        {variant.size || product.size || 'All Size'}{variant.color ? ` - ${variant.color}` : ''}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {formatCurrency(Number(variant.rentPrice ?? product.rentPrice ?? 0))} / sewa
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${variantStock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                      {variantStock > 0 ? `Sisa ${variantStock}` : 'Habis'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="rounded-[20px] border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Jumlah</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{formatCurrency(rentPrice * safeQty)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQty(current => Math.max(1, Number(current || 1) - 1))}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm"
                  aria-label="Kurangi jumlah"
                >
                  <Minus size={16} strokeWidth={3} />
                </button>
                <input
                  type="number"
                  min="1"
                  max={safeMaxQty}
                  value={safeQty}
                  onChange={event => setQty(event.target.value)}
                  className="h-10 w-16 rounded-xl border border-slate-200 bg-white text-center text-sm font-bold text-slate-900"
                  aria-label="Jumlah varian"
                />
                <button
                  type="button"
                  onClick={() => setQty(current => Math.min(safeMaxQty, Number(current || 1) + 1))}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm"
                  aria-label="Tambah jumlah"
                >
                  <Plus size={16} strokeWidth={3} />
                </button>
              </div>
            </div>
            {deposit > 0 && <p className="mt-2 text-xs font-semibold text-slate-500">Deposit {formatCurrency(deposit)} / item</p>}
          </div>
        </div>

        <div className="flex gap-2 border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isOutOfStock}
            className="flex-1 rounded-[18px] bg-blue-700 px-4 py-3 text-sm font-bold text-white disabled:bg-slate-300"
          >
            Tambah
          </button>
        </div>
      </div>
    </div>
  );
}
