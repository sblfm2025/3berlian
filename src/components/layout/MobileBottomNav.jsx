export default function MobileBottomNav({ currentView, isKeyboardVisible = false, navItems, onNavigate }) {
  const primaryItem = navItems.find(item => item.id === 'rent');
  const sideItems = navItems.filter(item => item.id !== 'rent');
  const leftItems = sideItems.slice(0, 2);
  const rightItems = sideItems.slice(2, 4);
  const paddedLeftItems = [...leftItems, ...Array.from({ length: Math.max(0, 2 - leftItems.length) }, (_, index) => ({ id: `left-spacer-${index}`, isSpacer: true }))];
  const paddedRightItems = [...rightItems, ...Array.from({ length: Math.max(0, 2 - rightItems.length) }, (_, index) => ({ id: `right-spacer-${index}`, isSpacer: true }))];

  const renderSideItem = (item) => (
    item.isSpacer ? <div key={item.id} aria-hidden="true" /> :
    <button
      key={item.id}
      onClick={() => onNavigate(item.id)}
      aria-label={`Buka ${item.label}`}
      aria-current={currentView === item.id ? 'page' : undefined}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center transition-all px-0.5 ${currentView === item.id ? 'text-blue-700' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <div className={`mb-0.5 flex h-8 w-8 items-center justify-center rounded-full transition-all ${currentView === item.id ? 'bg-blue-50 scale-105 shadow-sm' : 'bg-transparent'}`}>
        <item.icon size={20} className={currentView === item.id ? 'stroke-blue-700' : ''} />
      </div>
      <span className={`max-w-full truncate text-[10px] text-center leading-tight ${currentView === item.id ? 'font-bold text-blue-800' : 'font-medium'}`}>
        {item.label}
      </span>
    </button>
  );

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-12px_30px_rgba(15,23,42,0.08)] z-40 pb-[calc(0.55rem+env(safe-area-inset-bottom))] pt-1.5 px-2 transition-transform duration-200 ${isKeyboardVisible ? 'translate-y-full' : 'translate-y-0'}`}>
      <div className="grid w-full grid-cols-[1fr_1fr_72px_1fr_1fr] items-end gap-1">
        {paddedLeftItems.map(renderSideItem)}

        {primaryItem && (
          <button
            key={primaryItem.id}
            onClick={() => onNavigate(primaryItem.id)}
            aria-label={`Buka ${primaryItem.label}`}
            aria-current={currentView === primaryItem.id ? 'page' : undefined}
            className="relative -mt-7 flex flex-col items-center justify-center text-blue-700"
          >
            <div className={`flex h-14 w-14 items-center justify-center rounded-[20px] bg-blue-700 text-white shadow-[0_16px_30px_-20px_rgba(13,71,161,0.95)] ring-[3px] ring-white transition-all ${currentView === primaryItem.id ? 'scale-105 bg-blue-800' : ''}`}>
              <primaryItem.icon size={25} strokeWidth={2.5} />
            </div>
            <span className="mt-0.5 text-[10px] font-bold leading-tight text-blue-800">{primaryItem.label}</span>
          </button>
        )}

        {paddedRightItems.map(renderSideItem)}
      </div>
    </nav>
  );
}
