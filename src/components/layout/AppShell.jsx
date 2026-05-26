import MobileBottomNav from './MobileBottomNav';
import MobileHeader from './MobileHeader';
import MobileSearchProvider from './MobileSearchProvider';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({
  children,
  currentDateLabel,
  currentPage,
  currentView,
  desktopNavItems,
  firebaseUser,
  mobileNavItems,
  notifications,
  onLogout,
  onNavigate,
  user
}) {
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
        <MobileHeader currentPage={currentPage} notifications={notifications} onLogout={onLogout} onNavigate={onNavigate} />

        <main className="flex-1 min-h-0 flex flex-col overflow-hidden bg-transparent md:h-screen">
          <Topbar
            currentDateLabel={currentDateLabel}
            currentPage={currentPage}
            firebaseUser={firebaseUser}
            user={user}
          />
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8 relative">
            {children}
          </div>
        </main>

        <MobileBottomNav
          currentView={currentView}
          navItems={mobileNavItems}
          onNavigate={onNavigate}
        />
      </MobileSearchProvider>
    </div>
  );
}
