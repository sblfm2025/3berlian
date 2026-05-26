import { Bell, LogOut, Search } from 'lucide-react';
import { useState } from 'react';
import { useMobileSearch } from './useMobileSearch';

const notificationToneClass = {
  danger: 'bg-red-50 text-red-700 border-red-100',
  warning: 'bg-amber-50 text-amber-700 border-amber-100',
  info: 'bg-blue-50 text-blue-700 border-blue-100'
};

export default function MobileHeader({ currentPage, notifications = [], onNotificationAction, onLogout, onNavigate }) {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const mobileSearch = useMobileSearch();
  const searchConfig = mobileSearch?.searchConfig;
  const placeholder = searchConfig?.placeholder || currentPage.searchPlaceholder || 'Cari menu atau nota';
  const unreadCount = notifications.length;
  const handleNotificationClick = (notification) => {
    setIsNotificationOpen(false);
    if (notification.action) {
      onNotificationAction?.(notification.action);
      return;
    }
    if (notification.target) onNavigate?.(notification.target);
  };

  return (
    <header className="md:hidden sticky top-0 z-30 bg-[#0d47a1] px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] text-white shadow-[0_16px_36px_-28px_rgba(13,71,161,0.95)]">
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
        <div className="relative flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsNotificationOpen(open => !open)}
            className="relative p-2 text-blue-100 transition-transform hover:text-white active:scale-95"
            aria-label="Buka notifikasi"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-black leading-none text-blue-950 ring-2 ring-[#0d47a1]">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <button onClick={onLogout} className="p-2 text-blue-100 hover:text-white active:scale-95 transition-transform" aria-label="Keluar">
            <LogOut size={20} />
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 top-11 z-40 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-[24px] border border-slate-100 bg-white text-slate-900 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.7)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-black">Notifikasi</p>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">{unreadCount} penting</span>
              </div>
              <div className="max-h-[320px] overflow-y-auto p-3">
                {notifications.length === 0 ? (
                  <div className="rounded-[18px] bg-slate-50 px-4 py-5 text-center">
                    <p className="text-sm font-black text-slate-800">Tidak ada notifikasi penting</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">Operasional aplikasi sedang aman.</p>
                  </div>
                ) : notifications.map(notification => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => handleNotificationClick(notification)}
                    className={`mb-2 w-full rounded-[18px] border px-4 py-3 text-left last:mb-0 ${notificationToneClass[notification.tone] || notificationToneClass.info}`}
                  >
                    <p className="text-sm font-black">{notification.title}</p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed opacity-85">{notification.message}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 text-blue-900 shadow-sm">
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
      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100/85">{currentPage.eyebrow}</p>
        <h2 className="mt-1 text-base font-bold text-white">{currentPage.title}</h2>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-blue-50/90">{currentPage.subtitle}</p>
      </div>
    </header>
  );
}
