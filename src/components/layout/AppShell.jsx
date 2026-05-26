import MobileBottomNav from './MobileBottomNav';
import MobileHeader from './MobileHeader';
import MobilePageHeader from './MobilePageHeader';
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

      <MobileHeader onLogout={onLogout} />

      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen overflow-hidden bg-transparent">
        <Topbar
          currentDateLabel={currentDateLabel}
          currentPage={currentPage}
          firebaseUser={firebaseUser}
          user={user}
        />
        <MobilePageHeader currentPage={currentPage} />
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8 relative">
          {children}
        </div>
      </main>

      <MobileBottomNav
        currentView={currentView}
        navItems={mobileNavItems}
        onNavigate={onNavigate}
      />
    </div>
  );
}
