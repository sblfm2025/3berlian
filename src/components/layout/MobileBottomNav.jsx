export default function MobileBottomNav({ currentView, navItems, onNavigate }) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] z-40 pb-3 pt-2 px-1">
      <div className="flex w-full justify-between items-end">
        {navItems.map(item => (
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
        ))}
      </div>
    </nav>
  );
}
