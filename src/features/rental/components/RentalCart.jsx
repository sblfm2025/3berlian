import { Trash2, Minus, Plus } from 'lucide-react';

export default function RentalCart({ cart, removeCartItem, updateCartQty, formatCurrency }) {
  return (
    <div className="rounded-2xl bg-white p-3 border border-slate-100 shadow-sm sm:p-5 sm:rounded-[24px]">
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
            <div key={item.product.id} className="rounded-2xl bg-slate-50 px-3 py-2.5 sm:rounded-[20px] sm:px-4 sm:py-3">
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
  );
}
