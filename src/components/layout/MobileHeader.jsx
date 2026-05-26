import { LogOut, Search } from 'lucide-react';
import { useMobileSearch } from './useMobileSearch';

export default function MobileHeader({ currentPage, onLogout }) {
  const mobileSearch = useMobileSearch();
  const searchConfig = mobileSearch?.searchConfig;
  const placeholder = searchConfig?.placeholder || currentPage.searchPlaceholder || 'Cari menu atau nota';

  return (
    <header className="md:hidden bg-[#0d47a1] text-white px-4 pb-4 pt-3 shadow-[0_16px_36px_-28px_rgba(13,71,161,0.95)] sticky top-0 z-30">
      <div className="flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white shadow-md">
          <img src="/app-logo-192.png" alt="Logo 3 Berlian" className="h-7 w-7 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
        <div>
          <h1 className="font-black text-base text-amber-300">3 Berlian</h1>
          <p className="text-[10px] uppercase tracking-[0.2em] text-blue-100/80">POS Penyewaan Kostum</p>
        </div>
      </div>
      <button onClick={onLogout} className="p-2 text-blue-100 hover:text-white active:scale-95 transition-transform">
        <LogOut size={20} />
      </button>
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-[18px] bg-white px-4 py-3 text-blue-900 shadow-sm">
        <Search size={17} className="text-blue-500" />
        {searchConfig?.onChange ? (
          <input
            type="text"
            value={searchConfig.value || ''}
            onChange={event => searchConfig.onChange(event.target.value)}
            placeholder={placeholder}
            className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none placeholder:text-slate-400"
          />
        ) : (
          <span className="text-sm font-semibold text-slate-500">{placeholder}</span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-blue-100/85">{currentPage.eyebrow}</p>
        <h2 className="mt-1 text-lg font-black text-white">{currentPage.title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-blue-50/90">{currentPage.subtitle}</p>
      </div>
    </header>
  );
}
