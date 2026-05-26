import { lazy, Suspense, useMemo, useRef, useState, useEffect } from 'react';

import { normalizeProduct } from './utils/product';
import { isActiveTransaction } from './utils/transactionStatus';
import AppShell from './components/layout/AppShell';
import { getMobileNavItems, getRoleNavItems, pageMeta } from './config/navigation';
import { initialAppUsers, initialProducts } from './constants/seedData';
import LoginScreen from './components/auth/LoginScreen';
import ReceiptModal from './components/receipt/ReceiptModal';
import ConfirmDialog from './components/ui/ConfirmDialog';
import Toast from './components/ui/Toast';
import DashboardPage from './pages/DashboardPage';
import RentPage from './pages/RentPage';
import ReturnPage from './pages/ReturnPage';

// Import hooks
import { useAppAuth } from './hooks/useAppAuth';
import { useAppMonitoring } from './hooks/useAppMonitoring';
import { useRealtimeData } from './hooks/useRealtimeData';
import { usePwaInstall } from './hooks/usePwaInstall';

// Import repositories
import { saveProduct, deleteProduct, completeLaundry, completeMaintenance, retireCostume } from './repositories/productRepository';
import { updateCustomerProfile } from './repositories/customerRepository';
import { createRentalTransaction, completeReturnTransaction, voidTransaction, editTransaction } from './repositories/transactionRepository';
import { updateAppUser } from './repositories/userRepository';
import { BOOKING_STATUS, createBooking, cancelBooking, convertBookingStatus, expireStaleBookings } from './repositories/bookingRepository';
import { saveCashClosing } from './repositories/financeRepository';

// Import validators
import { validateProductPayload } from './validators/productValidator';
import { validateCustomerPayload } from './validators/customerValidator';

const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const MenuPage = lazy(() => import('./pages/MenuPage'));
const BookingPage = lazy(() => import('./pages/BookingPage'));
const StockOpnamePage = lazy(() => import('./pages/StockOpnamePage'));

const isKnownAppView = (view) => Object.prototype.hasOwnProperty.call(pageMeta, view);

function AppDataSkeleton({ message }) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border-4 border-blue-100 border-t-blue-700 animate-spin" />
          <div>
            <p className="text-sm font-black text-slate-900">Menyiapkan data aplikasi</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-3 w-24 rounded-full shimmer" />
            <div className="mt-5 h-7 w-32 rounded-full shimmer" />
          </div>
        ))}
      </div>
      <div className="h-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-4 w-40 rounded-full shimmer" />
        <div className="mt-6 grid gap-3">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="h-10 rounded-xl shimmer" />
          ))}
        </div>
      </div>
    </div>
  );
}

function PageFallback() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-4 w-40 rounded-full shimmer" />
      <div className="mt-5 grid gap-3">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-12 rounded-xl shimmer" />
        ))}
      </div>
    </div>
  );
}

// --- KOMPONEN UTAMA (MAIN APP COMPONENT) ---
export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [receiptData, setReceiptData] = useState(null);
  const [toast, setToast] = useState(null);
  const [voidTransactionDialog, setVoidTransactionDialog] = useState({ isOpen: false, transaction: null, isLoading: false });
  const appHistoryReady = useRef(false);
  useAppMonitoring();

  const notify = ({ message, title, type = 'info' }) => {
    setToast({ id: Date.now(), message, title, type });
  };

  const {
    firebaseUser,
    user,
    isLoginDataLoaded,
    setIsLoginDataLoaded,
    loginLoadingMessage,
    dataLoadError,
    setDataLoadError,
    isDemoMode,
    handleLoginSuccess,
    handleLogout: authLogout,
    handleStartDemoMode,
    handleSeedInit
  } = useAppAuth(notify);

  const {
    products,
    setProducts,
    customers,
    setCustomers,
    transactions,
    setTransactions,
    bookings,
    financialRecords,
    appUsers,
    setAppUsers,
    isAppDataLoaded,
    setIsAppDataLoaded,
    appLoadingMessage,
    appDataStatus
  } = useRealtimeData({
    firebaseUser,
    user,
    isDemoMode,
    setDataLoadError,
    setIsLoginDataLoaded
  });

  const {
    isAppInstalled,
    pwaPrompt,
    setPwaPrompt,
    notificationPermission,
    handleNotificationAction,
    handleInstallApp,
    handleEnableNotifications,
    getDevicePlatform
  } = usePwaInstall(user, notify);

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!user || isDemoMode || !appDataStatus.bookings || bookings.length === 0) return;

    expireStaleBookings(bookings, user?.id || user?.username || 'system').catch((err) => {
      console.error('Gagal memproses booking expired:', err);
    });
  }, [appDataStatus.bookings, bookings, isDemoMode, user]);

  // Menyimpan perubahan data
  const handleCheckoutDB = async (newTransaction, cart) => {
    try {
      const savedTransaction = await createRentalTransaction(newTransaction, cart);
      setReceiptData(savedTransaction);
    } catch (error) {
      notify({ title: 'Transaksi gagal', message: error.message || 'Gagal memproses transaksi. Periksa stok dan koneksi lalu coba lagi.', type: 'error' });
      throw error;
    }
  };

  const handleUpdateCustomerDB = async (customer) => {
    const validation = validateCustomerPayload(customer);
    if (!validation.isValid) {
      notify({ title: 'Pelanggan tidak valid', message: validation.errors[0], type: 'error' });
      return;
    }
    try {
      await updateCustomerProfile(customer);
    } catch {
      notify({ title: 'Pelanggan gagal diperbarui', message: 'Data pelanggan belum berhasil disimpan.', type: 'error' });
    }
  };

  const handleReturnDB = async (selectedTrx) => {
    try {
      await completeReturnTransaction(selectedTrx);
      notify({ title: 'Pengembalian selesai', message: 'Barang berhasil dikembalikan dan stok sudah diperbarui.', type: 'success' });
    } catch (error) {
      console.error(error);
      notify({ title: 'Pengembalian gagal', message: error.message || 'Gagal memproses pengembalian. Periksa koneksi atau data produk.', type: 'error' });
      throw error;
    }
  };

  const handleAddEditProductDB = async (productData, isEdit) => {
    const validation = validateProductPayload({ ...productData, isEdit });
    if (!validation.isValid) {
      notify({ title: 'Produk tidak valid', message: validation.errors[0], type: 'error' });
      return;
    }
    try {
      await saveProduct(productData, isEdit);
      notify({
        title: isEdit ? 'Produk diperbarui' : 'Produk ditambahkan',
        message: isEdit ? 'Data kostum berhasil diperbarui.' : 'Kostum baru berhasil masuk inventaris.',
        type: 'success'
      });
    } catch (err) {
      console.error(err);
      notify({ title: 'Produk gagal disimpan', message: err.message || 'Proses penyimpanan dibatalkan karena terjadi kesalahan.', type: 'error' });
    }
  };

  const handleDeleteProductDB = async (id) => {
    try {
      await deleteProduct(id);
      notify({ title: 'Produk dihapus', message: 'Data produk berhasil dihapus dari inventaris.', type: 'success' });
    } catch {
      notify({ title: 'Produk gagal dihapus', message: 'Gagal menghapus produk. Periksa koneksi atau izin database.', type: 'error' });
    }
  };

  const handleCompleteLaundryDB = async (productId, qty) => {
    try {
      await completeLaundry(productId, qty, user?.id || user?.username || 'system');
      notify({ title: 'Laundry selesai', message: `${qty} kostum telah dipindahkan kembali ke stok tersedia.`, type: 'success' });
    } catch (err) {
      notify({ title: 'Gagal memproses laundry', message: err.message || 'Terjadi kesalahan saat memindahkan stok laundry.', type: 'error' });
    }
  };

  const handleCompleteMaintenanceDB = async (productId, qty) => {
    try {
      await completeMaintenance(productId, qty, user?.id || user?.username || 'system');
      notify({ title: 'Perbaikan selesai', message: `${qty} kostum telah dipindahkan kembali ke stok tersedia.`, type: 'success' });
    } catch (err) {
      notify({ title: 'Gagal memproses perbaikan', message: err.message || 'Terjadi kesalahan saat memindahkan stok perbaikan.', type: 'error' });
    }
  };

  const handleRetireCostumeDB = async (productId, qty, fromBucket) => {
    try {
      await retireCostume(productId, qty, fromBucket, user?.id || user?.username || 'system');
      notify({ title: 'Kostum dipensiunkan', message: `${qty} kostum berhasil dipindahkan ke stok pensiun.`, type: 'success' });
    } catch (err) {
      notify({ title: 'Gagal mempensiunkan kostum', message: err.message || 'Terjadi kesalahan saat memindahkan stok pensiun.', type: 'error' });
    }
  };

  const handleCreateBookingDB = async (bookingData) => {
    try {
      const saved = await createBooking(bookingData);
      notify({ title: 'Booking terkonfirmasi', message: `Pemesanan ${saved.bookingNumber} berhasil disimpan.`, type: 'success' });
      return saved;
    } catch (err) {
      notify({ title: 'Gagal membuat booking', message: err.message || 'Terjadi kesalahan saat menyimpan booking.', type: 'error' });
      throw err;
    }
  };

  const handleCancelBookingDB = async (bookingId, reason) => {
    try {
      await cancelBooking(bookingId, reason, user?.id || user?.username || 'system');
      notify({ title: 'Booking dibatalkan', message: 'Pesanan booking berhasil dibatalkan dari kalender.', type: 'success' });
    } catch (err) {
      notify({ title: 'Gagal membatalkan booking', message: err.message || 'Terjadi kesalahan.', type: 'error' });
      throw err;
    }
  };

  const handleConvertBookingDB = async (bookingId) => {
    try {
      await convertBookingStatus(bookingId, user?.id || user?.username || 'system');
    } catch (err) {
      notify({ title: 'Gagal memproses sewa booking', message: err.message || 'Terjadi kesalahan.', type: 'error' });
    }
  };

  const handleSaveCashClosingDB = async (closingData) => {
    try {
      const saved = await saveCashClosing(closingData);
      notify({ title: 'Tutup kas berhasil', message: `Rekap kas ${saved.closingNumber} berhasil disimpan.`, type: 'success' });
      return saved;
    } catch (err) {
      notify({ title: 'Tutup kas gagal', message: err.message || 'Terjadi kesalahan saat menyimpan rekap kas.', type: 'error' });
      throw err;
    }
  };

  const handleUpdateAppUserDB = async (userData) => {
    try {
      await updateAppUser(userData);
      notify({ title: 'Pengguna diperbarui', message: 'Data pengguna berhasil disimpan.', type: 'success' });
    } catch {
      notify({ title: 'Pengguna gagal diperbarui', message: 'Gagal memperbarui pengguna.', type: 'error' });
    }
  };

  const handleDeleteTransactionDB = (trx) => {
    setVoidTransactionDialog({ isOpen: true, transaction: trx, isLoading: false });
  };

  const handleCancelDeleteTransaction = () => {
    setVoidTransactionDialog({ isOpen: false, transaction: null, isLoading: false });
  };

  const handleConfirmDeleteTransaction = async () => {
    const trx = voidTransactionDialog.transaction;
    if (!trx) return;

    setVoidTransactionDialog(prev => ({ ...prev, isLoading: true }));
    try {
      const result = await voidTransaction(trx, { operatorId: user?.id || user?.username || 'system' });
      setVoidTransactionDialog({ isOpen: false, transaction: null, isLoading: false });
      if (result?.stockRestoreWarnings?.length) {
        notify({
          title: 'Transaksi dibatalkan',
          message: 'Nota berhasil dibatalkan, tetapi sebagian stok produk lama perlu diperiksa manual.',
          type: 'warning'
        });
        return;
      }

      notify({
        title: 'Transaksi dibatalkan',
        message: `Nota ${trx.id} sudah void dan stok aktif sudah dikembalikan.`,
        type: 'success'
      });
    } catch (err) {
      console.error(err);
      setVoidTransactionDialog(prev => ({ ...prev, isLoading: false }));
      notify({
        title: 'Gagal membatalkan transaksi',
        message: err.message || 'Firebase menolak pembatalan nota. Periksa koneksi, izin database, atau coba muat ulang aplikasi.',
        type: 'error'
      });
    }
  };

  const handleEditTransactionDB = async (updatedTrx) => {
    try {
      await editTransaction(updatedTrx);
      notify({ title: 'Transaksi diperbarui', message: `Nota ${updatedTrx.id} berhasil diperbarui.`, type: 'success' });
    } catch (err) {
      console.error(err);
      notify({ title: 'Transaksi gagal diperbarui', message: 'Gagal memperbarui transaksi.', type: 'error' });
    }
  };

  const handleStartDemoModeWrapper = () => {
    handleStartDemoMode(() => {
      setProducts(initialProducts.map(normalizeProduct));
      setCustomers([]);
      setTransactions([]);
      setAppUsers(initialAppUsers);
      setIsAppDataLoaded(true);
    });
  };

  const handleLogout = () => {
    authLogout();
    setProducts([]);
    setCustomers([]);
    setTransactions([]);
    setIsAppDataLoaded(false);
  };

  const navigateToView = (view) => {
    if (!isKnownAppView(view) || view === currentView) return;
    if (appHistoryReady.current) {
      window.history.pushState({ appView: view }, '', window.location.pathname);
    }
    setCurrentView(view);
  };

  useEffect(() => {
    if (!user) {
      appHistoryReady.current = false;
      return undefined;
    }

    window.history.replaceState({ appView: 'dashboard' }, '', window.location.pathname);
    window.history.pushState({ appView: 'dashboard' }, '', window.location.pathname);
    appHistoryReady.current = true;

    const handleAppBack = (event) => {
      const nextView = event.state?.appView;
      if (isKnownAppView(nextView)) {
        setCurrentView(nextView);
        return;
      }

      window.history.pushState({ appView: 'dashboard' }, '', window.location.pathname);
      setCurrentView('dashboard');
    };

    window.addEventListener('popstate', handleAppBack);
    return () => window.removeEventListener('popstate', handleAppBack);
  }, [user]);

  const appNotifications = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const activeTransactions = transactions.filter(isActiveTransaction);
    const overdueTransactions = activeTransactions.filter(transaction => transaction.expectedReturnDate && transaction.expectedReturnDate < today);
    const dueTodayTransactions = activeTransactions.filter(transaction => transaction.expectedReturnDate === today);
    const lowStockProducts = products.filter(product => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 2);
    const outOfStockProducts = products.filter(product => Number(product.stock || 0) <= 0);
    const notices = [];
    const platform = getDevicePlatform();

    if (!isAppInstalled && (platform.isAndroid || platform.isIOS)) {
      notices.push({
        id: 'install-app',
        title: 'Instal aplikasi 3 Berlian POS',
        message: platform.isIOS
          ? 'Pasang ke layar utama agar akses kasir lebih cepat.'
          : 'Tekan untuk memasang aplikasi di HP Android.',
        tone: 'warning',
        action: 'install-app'
      });
    }

    if (notificationPermission === 'default') {
      notices.push({
        id: 'enable-notifications',
        title: 'Aktifkan notifikasi aplikasi',
        message: 'Izinkan pengingat penting seperti stok rendah dan nota jatuh tempo.',
        tone: 'info',
        action: 'enable-notifications'
      });
    }

    if (dataLoadError) {
      notices.push({
        id: 'data-error',
        title: 'Data perlu dicek',
        message: dataLoadError,
        tone: 'danger',
        target: currentView
      });
    }

    if (!isAppDataLoaded) {
      notices.push({
        id: 'data-loading',
        title: 'Data masih dimuat',
        message: appLoadingMessage,
        tone: 'info',
        target: currentView
      });
    }

    if (overdueTransactions.length > 0) {
      notices.push({
        id: 'overdue-return',
        title: `${overdueTransactions.length} nota terlambat`,
        message: 'Segera proses pengembalian agar stok dan denda tetap akurat.',
        tone: 'danger',
        target: 'return'
      });
    }

    if (dueTodayTransactions.length > 0) {
      notices.push({
        id: 'due-today',
        title: `${dueTodayTransactions.length} nota jatuh tempo hari ini`,
        message: 'Pantau pelanggan yang harus mengembalikan kostum hari ini.',
        tone: 'warning',
        target: 'return'
      });
    }

    if (lowStockProducts.length > 0) {
      notices.push({
        id: 'low-stock',
        title: `${lowStockProducts.length} produk stok rendah`,
        message: 'Cek item yang sisa stoknya tinggal sedikit sebelum transaksi berikutnya.',
        tone: 'warning',
        target: user?.role === 'admin' ? 'products' : 'rent'
      });
    }

    if (outOfStockProducts.length > 0) {
      notices.push({
        id: 'empty-stock',
        title: `${outOfStockProducts.length} produk habis`,
        message: 'Produk habis perlu ditinjau agar tidak mengganggu pemilihan kostum.',
        tone: 'info',
        target: user?.role === 'admin' ? 'products' : 'rent'
      });
    }

    const upcomingBookings = bookings.filter(booking => {
      if (![BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.PENDING].includes(booking.status)) return false;
      if (!booking.startDate) return false;
      const daysUntilStart = Math.ceil((new Date(booking.startDate) - new Date(today)) / (1000 * 60 * 60 * 24));
      return daysUntilStart >= 0 && daysUntilStart <= 2;
    });

    if (upcomingBookings.length > 0) {
      notices.push({
        id: 'upcoming-booking',
        title: `${upcomingBookings.length} booking segera diproses`,
        message: 'Cek kalender booking agar DP, stok, dan jadwal pengambilan siap.',
        tone: 'info',
        target: 'booking'
      });
    }

    return notices;
  }, [appLoadingMessage, bookings, currentView, dataLoadError, isAppDataLoaded, isAppInstalled, notificationPermission, products, transactions, user?.role, getDevicePlatform]);

  if (!user) {
    return (
      <LoginScreen
        appUsers={appUsers}
        dataLoadError={dataLoadError}
        firebaseUser={firebaseUser}
        isDataLoaded={isLoginDataLoaded}
        isDemoMode={isDemoMode}
        loadingMessage={loginLoadingMessage}
        onLoginSuccess={handleLoginSuccess}
        onNotify={notify}
        onSeedInit={handleSeedInit}
        onStartDemoMode={handleStartDemoModeWrapper}
      />
    );
  }

  const filteredNav = getRoleNavItems(user.role);
  const mobileNavItems = getMobileNavItems(user.role);
  const currentPage = pageMeta[currentView] || pageMeta.dashboard;
  const currentDateLabel = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const viewReady = {
    dashboard: appDataStatus.products || appDataStatus.transactions,
    rent: appDataStatus.products,
    return: appDataStatus.transactions,
    products: appDataStatus.products,
    opname: appDataStatus.products,
    customers: appDataStatus.customers,
    booking: appDataStatus.products && appDataStatus.bookings,
    users: appDataStatus.users,
    reports: appDataStatus.transactions,
    menu: true
  };
  const isCurrentViewReady = Boolean(viewReady[currentView]);

  // --- TAMPILAN UTAMA (VIEWS) ---
  return (
    <>
      <AppShell
        currentDateLabel={currentDateLabel}
        currentPage={currentPage}
        currentView={currentView}
        desktopNavItems={filteredNav}
        firebaseUser={firebaseUser}
        mobileNavItems={mobileNavItems}
        notifications={appNotifications}
        onNotificationAction={handleNotificationAction}
        onLogout={handleLogout}
        onNavigate={navigateToView}
        user={user}
      >
          {!isAppDataLoaded && (
            <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-800">
              {appLoadingMessage}
            </div>
          )}

          {!isCurrentViewReady && <AppDataSkeleton message={appLoadingMessage} />}

          {isCurrentViewReady && currentView === 'dashboard' && <DashboardPage transactions={transactions} products={products} user={user} onNavigate={navigateToView} />}
          {isCurrentViewReady && currentView === 'rent' && <RentPage products={products} customers={customers} transactions={transactions} onCheckout={handleCheckoutDB} onNotify={notify} />}
          {isCurrentViewReady && currentView === 'return' && <ReturnPage transactions={transactions} onReturn={handleReturnDB} />}
          {isCurrentViewReady && currentView === 'booking' && (
            <Suspense fallback={<PageFallback />}>
              <BookingPage
                products={products}
                customers={customers}
                transactions={transactions}
                bookings={bookings}
                onCreateBooking={handleCreateBookingDB}
                onCancelBooking={handleCancelBookingDB}
                onConvertBookingStatus={handleConvertBookingDB}
                onNavigate={navigateToView}
                operatorId={user?.id || user?.username || 'system'}
                onNotify={notify}
              />
            </Suspense>
          )}
          <Suspense fallback={<PageFallback />}>
            {isCurrentViewReady && currentView === 'products' && user.role === 'admin' && (
              <ProductsPage
                products={products}
                onSave={handleAddEditProductDB}
                onDelete={handleDeleteProductDB}
                onCompleteLaundry={handleCompleteLaundryDB}
                onCompleteMaintenance={handleCompleteMaintenanceDB}
                onRetireCostume={handleRetireCostumeDB}
                onNotify={notify}
                operatorId={user?.id || user?.username || 'system'}
              />
            )}
            {isCurrentViewReady && currentView === 'opname' && user.role === 'admin' && (
              <StockOpnamePage
                products={products}
                transactions={transactions}
                onNotify={notify}
                operatorId={user?.id || user?.username || 'system'}
              />
            )}
            {isCurrentViewReady && currentView === 'customers' && (
              <CustomersPage
                customers={customers}
                transactions={transactions}
                onUpdateCustomer={handleUpdateCustomerDB}
                onNotify={notify}
              />
            )}
            {isCurrentViewReady && currentView === 'users' && user.role === 'admin' && (
              <UsersPage usersList={appUsers} onUpdateUser={handleUpdateAppUserDB} />
            )}
            {isCurrentViewReady && currentView === 'reports' && user.role === 'admin' && (
              <ReportsPage
                transactions={transactions}
                products={products}
                financialRecords={financialRecords}
                customers={customers}
                appUsers={appUsers}
                onViewReceipt={setReceiptData}
                onDelete={handleDeleteTransactionDB}
                onEdit={handleEditTransactionDB}
                onSaveCashClosing={handleSaveCashClosingDB}
                onNotify={notify}
                operatorId={user?.id || user?.username || 'system'}
              />
            )}
            {isCurrentViewReady && currentView === 'menu' && (
              <MenuPage onNavigate={navigateToView} role={user.role} />
            )}
          </Suspense>
      </AppShell>

      {pwaPrompt && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-slate-950/55 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm md:items-center md:p-4">
          <div className="w-full max-w-md overflow-hidden rounded-t-[24px] bg-white shadow-2xl md:rounded-[28px]">
            <div className="bg-[#0d47a1] px-4 py-4 text-white sm:px-5 sm:py-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-100 sm:text-[11px] sm:tracking-[0.22em]">3 Berlian POS</p>
              <h2 className="mt-2 text-lg font-bold sm:text-xl sm:font-black">
                {pwaPrompt === 'notification' ? 'Izinkan notifikasi aplikasi' : 'Instal aplikasi di HP'}
              </h2>
              <p className="mt-2 text-xs font-semibold leading-relaxed text-blue-50 sm:text-sm">
                {pwaPrompt === 'notification'
                  ? 'Aktifkan pengingat agar informasi penting dari aplikasi tidak terlewat.'
                  : 'Akses kasir lebih cepat dari layar utama tanpa membuka browser manual.'}
              </p>
            </div>

            <div className="space-y-3 px-4 py-4 sm:space-y-4 sm:px-5 sm:py-5">
              {pwaPrompt === 'install' && (
                <>
                  <div className="rounded-2xl bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-900 sm:rounded-[22px] sm:px-4 sm:py-3 sm:text-sm">
                    Untuk operasional harian, sebaiknya aplikasi dipasang di HP agar lebih cepat dan terasa seperti aplikasi native.
                  </div>
                  <button
                    type="button"
                    onClick={handleInstallApp}
                    className="w-full rounded-2xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white shadow-sm sm:rounded-[18px] sm:py-3.5 sm:font-black"
                  >
                    Instal Sekarang
                  </button>
                </>
              )}

              {pwaPrompt === 'ios-install' && (
                <div className="rounded-2xl bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 sm:rounded-[22px] sm:px-4 sm:py-4 sm:text-sm">
                  <p className="font-bold text-slate-900 sm:font-black">Cara instal di iPhone/iPad:</p>
                  <p className="mt-2">1. Tekan tombol Share di Safari.</p>
                  <p className="mt-1">2. Pilih Add to Home Screen.</p>
                  <p className="mt-1">3. Tekan Add.</p>
                </div>
              )}

              {pwaPrompt === 'manual-install' && (
                <div className="rounded-2xl bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-700 sm:rounded-[22px] sm:px-4 sm:py-4 sm:text-sm">
                  <p className="font-bold text-slate-900 sm:font-black">Prompt install belum tersedia.</p>
                  <p className="mt-2">Buka menu browser lalu pilih Install app atau Add to Home screen. Jika belum muncul, refresh halaman setelah beberapa detik.</p>
                </div>
              )}

              {pwaPrompt === 'notification' && (
                <>
                  <div className="rounded-2xl bg-blue-50 px-3 py-2.5 text-xs font-semibold text-blue-900 sm:rounded-[22px] sm:px-4 sm:py-3 sm:text-sm">
                    Notifikasi browser dapat dipakai untuk pengingat penting seperti stok rendah, nota jatuh tempo, atau status aplikasi.
                  </div>
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    className="w-full rounded-2xl bg-blue-800 px-4 py-3 text-sm font-semibold text-white shadow-sm sm:rounded-[18px] sm:py-3.5 sm:font-black"
                  >
                    Izinkan Notifikasi
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setPwaPrompt(null)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-600 sm:rounded-[18px]"
              >
                Nanti
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOTA */}
      <ReceiptModal
        receiptData={receiptData}
        onClose={() => {
          setReceiptData(null);
          if (currentView === 'rent') navigateToView('dashboard');
        }}
      />

      <ConfirmDialog
        cancelLabel="Batal"
        confirmLabel="Void Nota"
        description={`Nota ${voidTransactionDialog.transaction?.id || ''} akan dibatalkan tanpa menghapus riwayat. Jika nota masih aktif, stok akan dikembalikan ke rak.`}
        isLoading={voidTransactionDialog.isLoading}
        onCancel={handleCancelDeleteTransaction}
        onConfirm={handleConfirmDeleteTransaction}
        open={voidTransactionDialog.isOpen}
        title="Void transaksi ini?"
        tone="danger"
      />

      <Toast
        key={toast?.id}
        message={toast?.message}
        onClose={() => setToast(null)}
        title={toast?.title}
        type={toast?.type}
      />
    </>
  );
}

// ==========================================
// TAMPILAN KASIR (RENT VIEW - SPESIALIS POS)

// ==========================================
// TAMPILAN PENGEMBALIAN (RETURN VIEW)

// ==========================================
// TAMPILAN PRODUK (PRODUCTS VIEW)

// ==========================================
// TAMPILAN PELANGGAN (CUSTOMERS VIEW)

// ==========================================
// TAMPILAN PENGGUNA (USERS VIEW)

// ==========================================
// TAMPILAN LAPORAN (REPORTS VIEW)

// ==========================================
// TAMPILAN NOTA STRUK (RECEIPT MODAL)
