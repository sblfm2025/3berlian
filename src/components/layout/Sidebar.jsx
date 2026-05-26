import { LogOut } from 'lucide-react';

export default function Sidebar({ currentView, firebaseUser, navItems, onLogout, onNavigate, user }) {
  const groupedNav = navItems.reduce((groups, item) => {
    const group = item.group || 'Menu';
    groups[group] = [...(groups[group] || []), item];
    return groups;
  }, {});

  return (
    <aside className="hidden md:flex w-72 bg-[linear-gradient(180deg,_#0d47a1_0%,_#0b3d91_54%,_#082f75_100%)] text-white flex-col shadow-[0_20px_60px_-35px_rgba(13,71,161,0.8)] z-20">
      <div className="p-5 border-b border-white/10 relative">
        <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${firebaseUser ? 'bg-emerald-300 shadow-[0_0_8px_#86efac]' : 'bg-slate-300'}`} title="Cloud Sync Status" />
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white/95 shadow-lg">
            <img src="/app-logo-192.png" alt="Logo 3 Berlian" className="h-9 w-9 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-amber-300">3 Berlian</h2>
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-blue-100/90">POS Rental Kostum</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {Object.entries(groupedNav).map(([group, items]) => (
          <div key={group} className="mb-5">
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-100/70">{group}</p>
            <div className="space-y-2">
              {items.map(item => (
                <button key={item.id} onClick={() => onNavigate(item.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-[20px] transition-all ${currentView === item.id ? 'bg-white text-blue-800 shadow-[0_18px_38px_-28px_rgba(255,255,255,0.9)]' : 'text-blue-50 hover:bg-white/10'}`}>
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[16px] ${currentView === item.id ? 'bg-blue-50 text-blue-700' : 'bg-white/10 text-blue-50'}`}>
                    <item.icon size={20} />
                  </span>
                  <span className="font-bold">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
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
