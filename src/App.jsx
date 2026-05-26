import { lazy, Suspense, useMemo, useRef, useState, useEffect } from 'react';

import { signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { normalizeProduct } from './utils/product';
import { isActiveTransaction } from './utils/transactionStatus';
import { auth, db } from './services/firebase';
import {
  deleteProduct,
  editTransaction,
  listenToAppData,
  listenToAppUsers,
  saveProduct,
  seedInitialData,
  updateAppUser,
  updateCustomerProfile
} from './services/firestoreData';
import { completeReturnTransaction, createRentalTransaction, voidTransaction } from './services/transactionService';
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
const MenuPage = lazy(() => import('./pages/MenuPage'));

const isKnownAppView = (view) => Object.prototype.hasOwnProperty.call(pageMeta, view);
const APP_SESSION_KEY = 'pos-3berlian-session';
const PWA_INSTALLED_KEY = 'pos-3berlian-pwa-installed';

const getStoredUserSession = () => {
  try {
    const stored = window.localStorage.getItem(APP_SESSION_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    if (!parsed?.username || !parsed?.role) return null;
    return parsed;
  } catch {
    window.localStorage.removeItem(APP_SESSION_KEY);
    return null;
  }
};

const saveUserSession = (nextUser) => {
  const sessionUser = {
    id: nextUser.id,
    name: nextUser.name,
    username: nextUser.username,
    role: nextUser.role,
    email: nextUser.email
  };
  window.localStorage.setItem(APP_SESSION_KEY, JSON.stringify(sessionUser));
};

const getDevicePlatform = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(userAgent) || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  const isAndroid = /android/.test(userAgent);
  return { isAndroid, isIOS };
};

const isPwaStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
};

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
  const [user, setUser] = useState(() => getStoredUserSession()); 
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
  const [voidTransactionDialog, setVoidTransactionDialog] = useState({ isOpen: false, transaction: null, isLoading: false });
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(() => isPwaStandalone() || window.localStorage.getItem(PWA_INSTALLED_KEY) === 'true');
  const [pwaPrompt, setPwaPrompt] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(() => (
    'Notification' in window ? window.Notification.permission : 'unsupported'
  ));
  const appHistoryReady = useRef(false);
  const notificationPromptShownRef = useRef(false);

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

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event);
      setIsAppInstalled(isPwaStandalone());
    };

    const handleAppInstalled = () => {
      window.localStorage.setItem(PWA_INSTALLED_KEY, 'true');
      setDeferredInstallPrompt(null);
      setIsAppInstalled(true);
      setPwaPrompt(null);
      notify({ title: 'Aplikasi terpasang', message: '3 Berlian POS sudah siap dibuka dari layar utama.', type: 'success' });
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const updateDisplayMode = () => {
      if (isPwaStandalone()) {
        window.localStorage.setItem(PWA_INSTALLED_KEY, 'true');
        setIsAppInstalled(true);
      }
    };

    updateDisplayMode();
    mediaQuery.addEventListener?.('change', updateDisplayMode);
    return () => mediaQuery.removeEventListener?.('change', updateDisplayMode);
  }, []);

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
      const savedTransaction = await createRentalTransaction(newTransaction, cart);
      setReceiptData(savedTransaction);
    } catch (error) {
      notify({ title: 'Transaksi gagal', message: 'Gagal memproses transaksi. Periksa stok dan koneksi lalu coba lagi.', type: 'error' });
      throw error;
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
      throw error;
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
        message: 'Firebase menolak pembatalan nota. Periksa koneksi, izin database, atau coba muat ulang aplikasi.',
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
    saveUserSession(foundUser);
    setUser(foundUser);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    window.localStorage.removeItem(APP_SESSION_KEY);
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

  const showInstallPrompt = () => {
    setPwaPrompt('install');
  };

  const showNotificationPermissionPrompt = () => {
    setPwaPrompt('notification');
  };

  const handleNotificationAction = (action) => {
    if (action === 'install-app') {
      showInstallPrompt();
      return;
    }

    if (action === 'enable-notifications') {
      showNotificationPermissionPrompt();
    }
  };

  const handleInstallApp = async () => {
    const platform = getDevicePlatform();

    if (isPwaStandalone()) {
      window.localStorage.setItem(PWA_INSTALLED_KEY, 'true');
      setIsAppInstalled(true);
      setPwaPrompt(null);
      return;
    }

    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choiceResult = await deferredInstallPrompt.userChoice;
      setDeferredInstallPrompt(null);
      if (choiceResult?.outcome === 'accepted') {
        window.localStorage.setItem(PWA_INSTALLED_KEY, 'true');
        setIsAppInstalled(true);
        setPwaPrompt(null);
      }
      return;
    }

    if (platform.isIOS) {
      setPwaPrompt('ios-install');
      return;
    }

    setPwaPrompt('manual-install');
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      notify({ title: 'Notifikasi tidak didukung', message: 'Browser ini belum mendukung notifikasi aplikasi.', type: 'warning' });
      return;
    }

    const permission = await window.Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission !== 'granted') return;

    try {
      const registration = await window.navigator.serviceWorker?.ready;
      await registration?.showNotification('Notifikasi 3 Berlian aktif', {
        body: 'Anda akan melihat pengingat penting dari aplikasi saat browser mengizinkan.',
        icon: '/app-logo-192.png',
        badge: '/app-logo-32.png',
        tag: '3berlian-notification-ready'
      });
    } catch {
      notify({ title: 'Notifikasi aktif', message: 'Izin notifikasi sudah diberikan.', type: 'success' });
    }

    setPwaPrompt(null);
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

    if (!isAppInstalled && (platform.isAndroid || platform.isIOS || deferredInstallPrompt)) {
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

    return notices;
  }, [appLoadingMessage, currentView, dataLoadError, deferredInstallPrompt, isAppDataLoaded, isAppInstalled, notificationPermission, products, transactions, user?.role]);

  useEffect(() => {
    if (!user || notificationPromptShownRef.current || notificationPermission !== 'default') return;

    notificationPromptShownRef.current = true;
    const timeout = window.setTimeout(() => setPwaPrompt('notification'), 1800);
    return () => window.clearTimeout(timeout);
  }, [notificationPermission, user]);

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

          {isCurrentViewReady && currentView === 'dashboard' && <DashboardPage transactions={transactions} products={products} onNavigate={navigateToView} />}
          {isCurrentViewReady && currentView === 'rent' && <RentPage products={products} customers={customers} transactions={transactions} onCheckout={handleCheckoutDB} onNotify={notify} />}
          {isCurrentViewReady && currentView === 'return' && <ReturnPage transactions={transactions} onReturn={handleReturnDB} />}
          <Suspense fallback={<PageFallback />}>
            {isCurrentViewReady && currentView === 'products' && user.role === 'admin' && (
              <ProductsPage products={products} onSave={handleAddEditProductDB} onDelete={handleDeleteProductDB} onNotify={notify} />
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
                onNotify={notify}
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
