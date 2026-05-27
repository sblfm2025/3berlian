import MobileBottomNav from './MobileBottomNav';
import MobileHeader from './MobileHeader';
import MobileSearchProvider from './MobileSearchProvider';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import useKeyboardVisible from './useKeyboardVisible';

export default function AppShell({
  children,
  currentDateLabel,
  currentPage,
  currentView,
  desktopNavItems,
  firebaseUser,
  mobileNavItems,
  notifications,
  onNotificationAction,
  onLogout,
  onNavigate,
  user
}) {
  const isKeyboardVisible = useKeyboardVisible();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f3f7fd_0%,_#f8fafc_54%,_#eef3f8_100%)] flex flex-col md:flex-row font-sans">
      <Sidebar
        currentView={currentView}
        firebaseUser={firebaseUser}
        navItems={desktopNavItems}
        onLogout={onLogout}
        onNavigate={onNavigate}
        user={user}
      />

      <MobileSearchProvider>
        <MobileHeader currentPage={currentPage} notifications={notifications} onNotificationAction={onNotificationAction} onLogout={onLogout} onNavigate={onNavigate} />

        <main className="flex-1 min-h-0 flex flex-col overflow-hidden bg-transparent md:h-screen">
          <Topbar
            currentDateLabel={currentDateLabel}
            currentPage={currentPage}
            firebaseUser={firebaseUser}
            user={user}
          />
          <div className={`flex-1 overflow-y-auto p-4 md:p-8 md:pb-8 relative ${isKeyboardVisible ? 'pb-4' : 'pb-28'}`}>
            <div className="min-h-full flex flex-col justify-between">
              <div className="flex-grow">
                {children}
              </div>
              <footer className="mt-8 text-center text-xs font-bold text-slate-400 pb-2">
                Developed by MAROA Project
              </footer>
            </div>
          </div>
        </main>

        <MobileBottomNav
          currentView={currentView}
          isKeyboardVisible={isKeyboardVisible}
          navItems={mobileNavItems}
          onNavigate={onNavigate}
        />
      </MobileSearchProvider>
    </div>
  );
}
