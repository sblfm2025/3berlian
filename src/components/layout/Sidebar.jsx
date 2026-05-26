import { LogOut } from 'lucide-react';

export default function Sidebar({ currentView, firebaseUser, navItems, onLogout, onNavigate, user }) {
  return (
    <aside className="hidden md:flex w-64 bg-[linear-gradient(180deg,_#0d47a1_0%,_#113d87_100%)] text-white flex-col shadow-[0_20px_60px_-35px_rgba(13,71,161,0.8)] z-20">
      <div className="p-6 text-center border-b border-white/10 relative">
        <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${firebaseUser ? 'bg-emerald-300 shadow-[0_0_8px_#86efac]' : 'bg-slate-300'}`} title="Cloud Sync Status" />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] bg-white/95 shadow-lg">
          <img src="/app-logo-192.png" alt="Logo 3 Berlian" className="h-10 w-10 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        </div>
        <h2 className="mt-3 text-lg font-black text-amber-300">3 Berlian</h2>
        <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-blue-100/90">POS Penyewaan Kostum</p>
      </div>

      <div className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(item => (
          <button key={item.id} onClick={() => onNavigate(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-[18px] transition-all ${currentView === item.id ? 'bg-amber-400 text-slate-900 shadow-lg' : 'text-blue-50 hover:bg-white/10'}`}>
            <item.icon size={20} /> <span className="font-semibold">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-bold shadow-inner">{user.username.charAt(0).toUpperCase()}</div>
          <div className="text-left w-full overflow-hidden">
            <p className="break-words text-sm font-semibold leading-snug">{user.name}</p>
            <p className="text-xs text-amber-200 capitalize">{user.role}</p>
          </div>
        </div>
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/10 text-blue-50 rounded-[16px] hover:bg-white/20 transition">
          <LogOut size={16} /> Keluar
        </button>
      </div>
    </aside>
  );
}
