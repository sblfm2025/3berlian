import { Trash2, Minus, Plus } from 'lucide-react';

const getSizeOptions = (product = {}) => {
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return [...new Set(product.variants.map(variant => variant.size).filter(Boolean))];
  }

  return [product.size || 'All Size'];
};

export default function RentalCart({ cart, removeCartItem, updateCartItem, updateCartQty, formatCurrency }) {
  return (
    <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm sm:p-5 sm:rounded-[24px]">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">Keranjang</h4>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">{cart.length} item</span>
      </div>
      {cart.length === 0 ? (
        <div className="mt-4 rounded-[20px] border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400">
          Keranjang masih kosong. Pilih produk dari katalog.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {cart.map(item => {
            const itemId = item.cartItemId || item.productId || item.product?.id;
            const canUpdateQty = Boolean(item.product);

            return (
            <div key={itemId} className="rounded-2xl bg-slate-50 px-3 py-2.5 sm:rounded-[20px] sm:px-4 sm:py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-sm font-bold leading-snug text-slate-900">{item.productName || item.product?.name || 'Produk'}</p>
                  <p className="text-[11px] text-slate-500">{formatCurrency(item.rentPrice ?? item.product?.rentPrice ?? 0)} / item</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeCartItem(itemId)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 shadow-sm"
                  aria-label={`Hapus ${item.productName || item.product?.name || 'produk'} dari keranjang`}
                >
                  <Trash2 size={15} strokeWidth={2.5} />
                </button>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Ukuran</span>
                  <select
                    value={item.size || item.product?.size || 'All Size'}
                    onChange={event => updateCartItem(itemId, { size: event.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    {getSizeOptions(item.product).map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Deposit/item</span>
                  <input
                    type="text"
                    value={item.deposit || ''}
                    onChange={event => updateCartItem(itemId, { deposit: event.target.value.replace(/[^0-9]/g, '') })}
                    placeholder="0"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                  />
                </label>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-blue-800">{formatCurrency(item.subtotal ?? ((item.rentPrice ?? item.product?.rentPrice ?? 0) * item.qty))}</p>
                  <input
                    type="text"
                    value={item.rentPrice || ''}
                    onChange={event => updateCartItem(itemId, { rentPrice: event.target.value.replace(/[^0-9]/g, '') })}
                    className="mt-1 w-28 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700"
                    aria-label={`Harga sewa ${item.productName || item.product?.name || 'produk'}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => updateCartQty(item.product, -1)} disabled={!canUpdateQty} className="rounded-xl bg-white p-2 text-blue-700 shadow-sm disabled:opacity-40">
                    <Minus size={14} strokeWidth={3} />
                  </button>
                  <span className="w-7 text-center text-sm font-bold text-slate-900">{item.qty}</span>
                  <button type="button" onClick={() => updateCartQty(item.product, 1)} disabled={!canUpdateQty} className="rounded-xl bg-blue-700 p-2 text-white shadow-sm disabled:opacity-40">
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={item.note || ''}
                onChange={event => updateCartItem(itemId, { note: event.target.value })}
                placeholder="Catatan item"
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
              />
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
