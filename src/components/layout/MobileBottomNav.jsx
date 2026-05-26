export default function MobileBottomNav({ currentView, navItems, onNavigate }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] z-40 pb-3 pt-2 px-1">
      <div className="flex w-full justify-between items-end">
        {navItems.map(item => (
          item.id === 'rent' ? (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-label={`Buka ${item.label}`}
            aria-current={currentView === item.id ? 'page' : undefined}
            className="relative -mt-8 flex flex-1 flex-col items-center justify-center text-blue-700"
          >
            <div className={`flex h-16 w-16 items-center justify-center rounded-[22px] bg-blue-700 text-white shadow-[0_18px_36px_-20px_rgba(13,71,161,0.95)] transition-all ${currentView === item.id ? 'scale-105 bg-blue-800' : ''}`}>
              <item.icon size={30} strokeWidth={2.5} />
            </div>
            <span className="mt-1 text-[10px] font-black leading-tight text-blue-800">{item.label}</span>
          </button>
          ) : (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            aria-label={`Buka ${item.label}`}
            aria-current={currentView === item.id ? 'page' : undefined}
            className={`flex flex-col items-center justify-center flex-1 transition-all px-0.5 ${currentView === item.id ? 'text-blue-700' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <div className={`p-1.5 rounded-full mb-0.5 transition-all ${currentView === item.id ? 'bg-blue-50 scale-110 shadow-sm' : 'bg-transparent'}`}>
              <item.icon size={22} className={currentView === item.id ? 'stroke-blue-700' : ''} />
            </div>
            <span className={`text-[10px] text-center leading-tight tracking-tight ${currentView === item.id ? 'font-bold text-blue-800' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
          )
        ))}
      </div>
    </nav>
  );
}
