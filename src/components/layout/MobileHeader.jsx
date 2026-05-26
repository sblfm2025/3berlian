import { LogOut } from 'lucide-react';

export default function MobileHeader({ onLogout }) {
  return (
    <header className="md:hidden bg-[#0d47a1] text-white px-4 py-3 flex justify-between items-center shadow-[0_16px_36px_-28px_rgba(13,71,161,0.95)] sticky top-0 z-30">
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
    </header>
  );
}
