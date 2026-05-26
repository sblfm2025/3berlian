import { Package, Plus, Minus } from 'lucide-react';

export default function ProductCard({ product, cartItem, isSelected, updateCartQty, formatCurrency }) {
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
      className={`flex min-h-[82px] items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm transition-all sm:block sm:min-h-0 sm:overflow-hidden sm:p-0 sm:rounded-[24px] ${isSelected ? 'border-blue-500 shadow-[0_18px_42px_-30px_rgba(30,64,175,0.55)]' : stockStatus === 'habis' ? 'border-red-200' : stockStatus === 'menipis' ? 'border-amber-200' : 'border-slate-100 hover:border-slate-200'}`}
    >
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-36 sm:w-full sm:rounded-none" onClick={() => !isSelected && updateCartQty(product, 1)}>
        {product.photo ? (
          <img src={product.photo} alt={product.name} className="h-full w-full object-cover" onError={(event) => { event.target.onerror = null; event.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48bGluZSB4MT0iMyIgeTE9IjMiIHgyPSIyMSIgeTI9IjIxIj48L2xpbmU+PHBhdGggZD0iTTEwLjUgMTAuNVYxMGg0djMuNW0tMiAyaC00djRMNSA4bDEuNS0xLjUiPjwvcGF0aD48L3N2Zz4='; }} />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <Package size={24} className="sm:h-9 sm:w-9" />
          </div>
        )}

        <div className={`absolute bottom-1 left-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold sm:bottom-3 sm:left-3 sm:px-3 sm:py-1 sm:text-[11px] ${stockBadgeClass}`}>
          {stockLabel}
        </div>
        {isSelected && (
          <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-700 text-[10px] font-bold text-white shadow-sm sm:right-3 sm:top-3 sm:h-8 sm:w-8 sm:text-sm">
            {cartItem.qty}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 sm:p-4">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <span className="max-w-full break-words rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 sm:px-2.5 sm:py-1">
            {product.category || 'Lainnya'}
          </span>
          <span className="max-w-full break-words rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 sm:px-2.5 sm:py-1">
            {product.size || 'All Size'}
          </span>
        </div>
        <h4 className="mt-1.5 line-clamp-2 break-words text-sm font-semibold leading-snug text-slate-900 sm:mt-3 sm:font-bold">{product.name}</h4>
        <p className={`mt-1 text-[10px] font-bold uppercase tracking-[0.12em] sm:mt-2 sm:text-[11px] sm:tracking-[0.18em] ${stockStatus === 'habis' ? 'text-red-600' : stockStatus === 'menipis' ? 'text-amber-700' : 'text-emerald-700'}`}>
          {statusText}
        </p>
        <div className="mt-2 flex items-end justify-between gap-2 sm:mt-3 sm:flex-row sm:gap-3">
          <div className="min-w-0">
            <p className="hidden text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:block">Harga sewa</p>
            <p className="break-words text-sm font-bold text-amber-600 sm:mt-1 sm:text-base">{formatCurrency(product.rentPrice)}</p>
          </div>
          {isSelected ? (
            <div className="flex shrink-0 items-center gap-1.5 rounded-[14px] border border-blue-100 bg-blue-50 px-1.5 py-1 sm:gap-2 sm:rounded-[18px] sm:px-2 sm:py-1.5">
              <button type="button" onClick={() => updateCartQty(product, -1)} className="rounded-lg bg-white p-1.5 text-blue-700 shadow-sm hover:bg-blue-100 sm:rounded-xl sm:p-2">
                <Minus size={14} strokeWidth={3} />
              </button>
              <span className="w-5 text-center text-sm font-bold text-blue-900 sm:w-6 sm:text-base">{cartItem.qty}</span>
              <button type="button" onClick={() => updateCartQty(product, 1)} className="rounded-lg bg-blue-700 p-1.5 text-white shadow-sm hover:bg-blue-800 sm:rounded-xl sm:p-2">
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => updateCartQty(product, 1)}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition-all hover:bg-blue-800 sm:w-auto sm:gap-2 sm:rounded-[16px] sm:px-4 sm:py-2 sm:text-sm sm:font-bold"
              aria-label={`Tambah ${product.name}`}
            >
              <Plus size={16} strokeWidth={3} />
              <span className="hidden sm:inline">Tambah</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
