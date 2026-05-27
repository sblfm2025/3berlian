import { Search, X } from 'lucide-react';

export default function ProductFilterDrawer({
  categories,
  categoryCounts,
  filterSearch,
  isOpen,
  onClose,
  onSelect,
  selectedCategory,
  setFilterSearch
}) {
  if (!isOpen) return null;

  const filteredCategories = categories.filter(category => (
    category.toLowerCase().includes(filterSearch.toLowerCase())
  ));
  const countByCategory = new Map(categoryCounts.map(item => [item.category, item.count]));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm md:hidden" onClick={onClose}>
      <div
        className="absolute inset-x-0 bottom-0 max-h-[82vh] rounded-t-[22px] bg-white p-4 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-900">Filter lengkap</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">Pilih kategori kostum yang ingin ditampilkan.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700"
            aria-label="Tutup filter"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative mt-4">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={filterSearch}
            onChange={(event) => setFilterSearch(event.target.value)}
            placeholder="Cari kategori"
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-semibold text-slate-700 outline-none focus:border-blue-300 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
        </div>

        <div className="mt-4 grid max-h-[52vh] gap-2 overflow-y-auto pr-1">
          {filteredCategories.map(category => (
            <button
              key={category}
              type="button"
              onClick={() => {
                onSelect(category);
                onClose();
              }}
              className={`flex min-h-[44px] items-center justify-between rounded-2xl border px-4 py-2 text-left text-sm font-bold ${
                selectedCategory === category
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-700'
              }`}
            >
              <span className="line-clamp-1">{category}</span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600">
                {category === 'Semua' ? '' : countByCategory.get(category) || 0}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
