import { lazy, Suspense, useRef, useState, useEffect } from 'react';

import { signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { normalizeProduct } from './utils/product';
import { auth, db } from './services/firebase';
import {
  completeReturnTransaction,
  deleteProduct,
  deleteTransaction,
  editTransaction,
  listenToAppData,
  listenToAppUsers,
  saveCheckoutTransaction,
  saveProduct,
  seedInitialData,
  updateAppUser,
  updateCustomerProfile
} from './services/firestoreData';
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
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

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
            <div className="h-3 w-24 rounded-full bg-slate-200 animate-pulse" />
            <div className="mt-5 h-7 w-32 rounded-full bg-slate-200 animate-pulse" />
          </div>
        ))}
      </div>
      <div className="h-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="h-4 w-40 rounded-full bg-slate-200 animate-pulse" />
        <div className="mt-6 grid gap-3">
          {[0, 1, 2, 3, 4].map((item) => (
            <div key={item} className="h-10 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

function PageFallback() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="h-4 w-40 rounded-full bg-slate-200 animate-pulse" />
      <div className="mt-5 grid gap-3">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// --- KOMPONEN UTAMA (MAIN APP COMPONENT) ---
export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [user, setUser] = useState(null); 
  const [currentView, setCurrentView] = useState('dashboard');
  const [receiptData, setReceiptData] = useState(null); 
  
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [appUsers, setAppUsers] = useState([]); 
  const [isLoginDataLoaded, setIsLoginDataLoaded] = useState(false);
  const [isAppDataLoaded, setIsAppDataLoaded] = useState(false);
  const [appDataStatus, setAppDataStatus] = useState({
    products: false,
    customers: false,
    transactions: false,
    users: false
  });
  const [loginLoadingMessage, setLoginLoadingMessage] = useState('Menyiapkan halaman login...');
  const [appLoadingMessage, setAppLoadingMessage] = useState('Memuat data aplikasi...');
  const [dataLoadError, setDataLoadError] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [toast, setToast] = useState(null);
  const [deleteTransactionDialog, setDeleteTransactionDialog] = useState({ isOpen: false, transaction: null, isLoading: false });
  const appHistoryReady = useRef(false);

  const notify = ({ message, title, type = 'info' }) => {
    setToast({ id: Date.now(), message, title, type });
  };

  // Menyiapkan sesi aplikasi
  useEffect(() => {
    if (!auth) {
      window.setTimeout(() => {
        setDataLoadError('Sesi masuk belum siap. Muat ulang aplikasi lalu coba lagi.');
        setIsLoginDataLoaded(true);
      }, 0);
      return;
    }
    const authTimeout = window.setTimeout(() => {
      setDataLoadError('Koneksi masuk terlalu lama. Pastikan internet stabil, lalu coba lagi.');
      setIsLoginDataLoaded(true);
    }, 12000);

    const initAuth = async () => {
      try {
        setLoginLoadingMessage('Menyiapkan sesi kasir...');
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error", err);
        setDataLoadError('Gagal menyiapkan sesi masuk. Periksa koneksi internet lalu coba lagi.');
        setIsLoginDataLoaded(true);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (nextUser) window.clearTimeout(authTimeout);
      setFirebaseUser(nextUser);
    });
    return () => {
      window.clearTimeout(authTimeout);
      unsubscribe();
    };
  }, []);

  // Memuat data login
  useEffect(() => {
    if (!db) {
      window.setTimeout(() => {
        setDataLoadError('Database aplikasi belum siap. Muat ulang aplikasi lalu coba lagi.');
        setIsLoginDataLoaded(true);
      }, 0);
      return;
    }
    if (!firebaseUser || user || isDemoMode) return;

    window.setTimeout(() => {
      setLoginLoadingMessage('Memuat data pengguna...');
      setDataLoadError('');
    }, 0);
    let loginProfilerActive = true;
    console.time('load-login-users');
    const endLoginProfiler = () => {
      if (!loginProfilerActive) return;
      console.timeEnd('load-login-users');
      loginProfilerActive = false;
    };
    const loginTimeout = window.setTimeout(() => {
      setDataLoadError('Data pengguna belum berhasil dimuat. Periksa koneksi lalu coba lagi.');
      setIsLoginDataLoaded(true);
    }, 15000);

    const unsubscribeUsers = listenToAppUsers({
      onUsers: (users) => {
        setAppUsers(users);
        setIsLoginDataLoaded(true);
        endLoginProfiler();
        window.clearTimeout(loginTimeout);
      },
      onError: (collectionName, error) => {
        console.error(`Error fetching ${collectionName}:`, error);
        setDataLoadError('Data pengguna belum bisa dibaca. Periksa koneksi lalu coba lagi.');
        setIsLoginDataLoaded(true);
        endLoginProfiler();
        window.clearTimeout(loginTimeout);
      }
    });

    return () => {
      endLoginProfiler();
      window.clearTimeout(loginTimeout);
      unsubscribeUsers();
    };
  }, [firebaseUser, user, isDemoMode]);

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  // Memuat data operasional setelah login
  useEffect(() => {
    if (!db || !firebaseUser || !user || isDemoMode) return;

    const startLoadingNotice = window.setTimeout(() => {
      setIsAppDataLoaded(false);
      setAppDataStatus({
        products: false,
        customers: false,
        transactions: false,
        users: false
      });
      setAppLoadingMessage('Memuat data produk, pelanggan, dan transaksi...');
      setDataLoadError('');
    }, 0);
    const slowConnectionNotice = window.setTimeout(() => {
      setAppLoadingMessage('Data masih dimuat. Koneksi sedang lebih lambat dari biasanya...');
    }, 12000);
    const loadingTimeout = window.setTimeout(() => {
      setDataLoadError('Sebagian data aplikasi belum berhasil dimuat. Anda masih dapat mencoba memuat ulang aplikasi.');
      setIsAppDataLoaded(true);
    }, 45000);

    const loaded = {
      products: false,
      customers: false,
      transactions: false,
      users: false
    };
    Object.keys(loaded).forEach(name => console.time(`load-${name}`));

    const markCollectionLoaded = (name) => {
      if (!loaded[name]) console.timeEnd(`load-${name}`);
      loaded[name] = true;
      setAppDataStatus(prev => ({ ...prev, [name]: true }));

      if (Object.values(loaded).every(Boolean)) {
        window.clearTimeout(slowConnectionNotice);
        window.clearTimeout(loadingTimeout);
        setIsAppDataLoaded(true);
      }
    };

    const unsubscribeData = listenToAppData({
      onProducts: (items) => {
        setProducts(items);
        markCollectionLoaded('products');
      },
      onCustomers: (items) => {
        setCustomers(items);
        markCollectionLoaded('customers');
      },
      onTransactions: (items) => {
        setTransactions(items);
        markCollectionLoaded('transactions');
      },
      onUsers: (users) => {
        setAppUsers(users);
        markCollectionLoaded('users');
      },
      onError: (collectionName, error) => {
        console.error(`Error fetching ${collectionName}:`, error);
        setDataLoadError(`Data ${collectionName} belum bisa dibaca. Periksa koneksi lalu coba lagi.`);
        markCollectionLoaded(collectionName);
      }
    });

    return () => {
      Object.keys(loaded).forEach((name) => {
        if (!loaded[name]) console.timeEnd(`load-${name}`);
      });
      window.clearTimeout(startLoadingNotice);
      window.clearTimeout(slowConnectionNotice);
      window.clearTimeout(loadingTimeout);
      unsubscribeData();
    };
  }, [firebaseUser, user, isDemoMode]);

  // Menyimpan perubahan data
  const handleCheckoutDB = async (newTransaction, cart) => {
    try {
      await saveCheckoutTransaction(newTransaction, cart);
      setReceiptData(newTransaction);
    } catch {
      notify({ title: 'Transaksi gagal', message: 'Gagal memproses transaksi. Periksa stok dan koneksi lalu coba lagi.', type: 'error' });
    }
  };

  const handleUpdateCustomerDB = async (customer) => {
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
      notify({ title: 'Pengembalian gagal', message: 'Gagal memproses pengembalian. Periksa koneksi atau data produk.', type: 'error' });
    }
  };

  const handleAddEditProductDB = async (productData, isEdit) => {
    try {
      await saveProduct(productData, isEdit);
      notify({
        title: isEdit ? 'Produk diperbarui' : 'Produk ditambahkan',
        message: isEdit ? 'Data kostum berhasil diperbarui.' : 'Kostum baru berhasil masuk inventaris.',
        type: 'success'
      });
    } catch (err) { 
      console.error(err);
      notify({ title: 'Produk gagal disimpan', message: 'Proses penyimpanan dibatalkan karena terjadi kesalahan.', type: 'error' });
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

  const handleUpdateAppUserDB = async (userData) => {
    try {
      await updateAppUser(userData);
      notify({ title: 'Pengguna diperbarui', message: 'Data pengguna berhasil disimpan.', type: 'success' });
    } catch {
      notify({ title: 'Pengguna gagal diperbarui', message: 'Gagal memperbarui pengguna.', type: 'error' });
    }
  };

  const handleDeleteTransactionDB = (trx) => {
    setDeleteTransactionDialog({ isOpen: true, transaction: trx, isLoading: false });
  };

  const handleCancelDeleteTransaction = () => {
    setDeleteTransactionDialog({ isOpen: false, transaction: null, isLoading: false });
  };

  const handleConfirmDeleteTransaction = async () => {
    const trx = deleteTransactionDialog.transaction;
    if (!trx) return;

    setDeleteTransactionDialog(prev => ({ ...prev, isLoading: true }));
    try {
      const result = await deleteTransaction(trx);
      setDeleteTransactionDialog({ isOpen: false, transaction: null, isLoading: false });
      if (result?.stockRestoreWarnings?.length) {
        notify({
          title: 'Transaksi dihapus',
          message: 'Nota berhasil dihapus, tetapi sebagian stok produk lama tidak bisa dikembalikan otomatis. Periksa stok produk secara manual.',
          type: 'warning'
        });
        return;
      }

      notify({
        title: 'Transaksi dihapus',
        message: `Nota ${trx.id} berhasil dihapus dan stok aktif sudah dikembalikan.`,
        type: 'success'
      });
    } catch (err) {
      console.error(err);
      setDeleteTransactionDialog(prev => ({ ...prev, isLoading: false }));
      notify({
        title: 'Gagal menghapus transaksi',
        message: 'Firebase menolak penghapusan nota. Periksa koneksi, izin database, atau coba muat ulang aplikasi.',
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

  const handleSeedInit = async () => {
    try {
      await seedInitialData({ users: initialAppUsers, products: initialProducts });
      notify({ title: 'Sistem siap', message: 'Akun awal dan data produk berhasil diinisialisasi.', type: 'success' });
    } catch {
      notify({ title: 'Inisialisasi gagal', message: 'Gagal menyiapkan data awal.', type: 'error' });
    }
  };

  const handleStartDemoMode = () => {
    setProducts(initialProducts.map(normalizeProduct));
    setCustomers([]);
    setTransactions([]);
    setAppUsers(initialAppUsers);
    setDataLoadError('');
    setIsLoginDataLoaded(true);
    setIsAppDataLoaded(true);
    setAppDataStatus({
      products: true,
      customers: true,
      transactions: true,
      users: true
    });
    setIsDemoMode(true);
  };

  const handleLoginSuccess = (foundUser) => {
    setUser(foundUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setProducts([]);
    setCustomers([]);
    setTransactions([]);
    setIsAppDataLoaded(false);
    setAppDataStatus({
      products: false,
      customers: false,
      transactions: false,
      users: false
    });
    setDataLoadError('');
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
        onStartDemoMode={handleStartDemoMode}
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
    customers: appDataStatus.customers,
    users: appDataStatus.users,
    reports: appDataStatus.transactions
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

          {isCurrentViewReady && currentView === 'dashboard' && <DashboardPage transactions={transactions} products={products} onNavigate={navigateToView} />}
          {isCurrentViewReady && currentView === 'rent' && <RentPage products={products} customers={customers} transactions={transactions} onCheckout={handleCheckoutDB} />}
          {isCurrentViewReady && currentView === 'return' && <ReturnPage transactions={transactions} onReturn={handleReturnDB} />}
          <Suspense fallback={<PageFallback />}>
            {isCurrentViewReady && currentView === 'products' && user.role === 'admin' && (
              <ProductsPage products={products} onSave={handleAddEditProductDB} onDelete={handleDeleteProductDB} />
            )}
            {isCurrentViewReady && currentView === 'customers' && (
              <CustomersPage customers={customers} transactions={transactions} onUpdateCustomer={handleUpdateCustomerDB} />
            )}
            {isCurrentViewReady && currentView === 'users' && user.role === 'admin' && (
              <UsersPage usersList={appUsers} onUpdateUser={handleUpdateAppUserDB} />
            )}
            {isCurrentViewReady && currentView === 'reports' && user.role === 'admin' && (
              <ReportsPage
                transactions={transactions}
                onViewReceipt={setReceiptData}
                onDelete={handleDeleteTransactionDB}
                onEdit={handleEditTransactionDB}
              />
            )}
          </Suspense>
      </AppShell>

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
        confirmLabel="Hapus Nota"
        description={`Nota ${deleteTransactionDialog.transaction?.id || ''} akan dihapus. Jika nota masih aktif, sistem akan mencoba mengembalikan stok barang ke rak terlebih dahulu.`}
        isLoading={deleteTransactionDialog.isLoading}
        onCancel={handleCancelDeleteTransaction}
        onConfirm={handleConfirmDeleteTransaction}
        open={deleteTransactionDialog.isOpen}
        title="Hapus transaksi ini?"
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
