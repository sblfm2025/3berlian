import { useRef, useState, useEffect } from 'react';

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
import DashboardPage from './pages/DashboardPage';
import RentPage from './pages/RentPage';
import ReturnPage from './pages/ReturnPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';

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
  const [loginLoadingMessage, setLoginLoadingMessage] = useState('Menyiapkan halaman login...');
  const [appLoadingMessage, setAppLoadingMessage] = useState('Memuat data aplikasi...');
  const [dataLoadError, setDataLoadError] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const appHistoryReady = useRef(false);

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
    const loginTimeout = window.setTimeout(() => {
      setDataLoadError('Data pengguna belum berhasil dimuat. Periksa koneksi lalu coba lagi.');
      setIsLoginDataLoaded(true);
    }, 15000);

    const unsubscribeUsers = listenToAppUsers({
      onUsers: (users) => {
        setAppUsers(users);
        setIsLoginDataLoaded(true);
        window.clearTimeout(loginTimeout);
      },
      onError: (collectionName, error) => {
        console.error(`Error fetching ${collectionName}:`, error);
        setDataLoadError('Data pengguna belum bisa dibaca. Periksa koneksi lalu coba lagi.');
        setIsLoginDataLoaded(true);
        window.clearTimeout(loginTimeout);
      }
    });

    return () => {
      window.clearTimeout(loginTimeout);
      unsubscribeUsers();
    };
  }, [firebaseUser, user, isDemoMode]);

  // Memuat data operasional setelah login
  useEffect(() => {
    if (!db || !firebaseUser || !user || isDemoMode) return;

    const startLoadingNotice = window.setTimeout(() => {
      setIsAppDataLoaded(false);
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

    const markCollectionLoaded = (name) => {
      loaded[name] = true;

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
      alert('Gagal memproses transaksi.');
    }
  };

  const handleUpdateCustomerDB = async (customer) => {
    try {
      await updateCustomerProfile(customer);
    } catch {
      alert('Gagal memperbarui data pelanggan.');
    }
  };

  const handleReturnDB = async (selectedTrx) => {
    try {
      await completeReturnTransaction(selectedTrx);
      alert('Barang berhasil dikembalikan!');
    } catch (error) {
      console.error(error);
      alert('Gagal memproses pengembalian.');
    }
  };

  const handleAddEditProductDB = async (productData, isEdit) => {
    try {
      await saveProduct(productData, isEdit);
      alert(isEdit ? 'Produk diperbarui!' : 'Produk ditambahkan!');
    } catch (err) { 
      console.error(err);
      alert('Proses penyimpanan dibatalkan karena terjadi kesalahan.'); 
    }
  };

  const handleDeleteProductDB = async (id) => {
    try {
      await deleteProduct(id);
      alert('Produk dihapus!');
    } catch {
      alert('Gagal menghapus produk.');
    }
  };

  const handleUpdateAppUserDB = async (userData) => {
    try {
      await updateAppUser(userData);
      alert('Data pengguna berhasil diperbarui!');
    } catch {
      alert('Gagal memperbarui pengguna.');
    }
  };

  const handleDeleteTransactionDB = async (trx) => {
    if (!window.confirm(`Yakin ingin menghapus transaksi ${trx.id}?\n\nJika nota masih aktif, stok barang akan otomatis dikembalikan ke rak.`)) return;
    try {
      await deleteTransaction(trx);
      alert('Transaksi berhasil dihapus!');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus transaksi.');
    }
  };

  const handleEditTransactionDB = async (updatedTrx) => {
    try {
      await editTransaction(updatedTrx);
      alert('Transaksi berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui transaksi.');
    }
  };

  const handleSeedInit = async () => {
    try {
      await seedInitialData({ users: initialAppUsers, products: initialProducts });
      alert('Sistem berhasil diinisialisasi!');
    } catch {
      alert('Gagal inisialisasi awal.');
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
        onSeedInit={handleSeedInit}
        onStartDemoMode={handleStartDemoMode}
      />
    );
  }

  const filteredNav = getRoleNavItems(user.role);
  const mobileNavItems = getMobileNavItems(user.role);
  const currentPage = pageMeta[currentView] || pageMeta.dashboard;
  const currentDateLabel = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

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
          {!isAppDataLoaded && <AppDataSkeleton message={appLoadingMessage} />}

          {isAppDataLoaded && currentView === 'dashboard' && <DashboardPage transactions={transactions} products={products} onNavigate={navigateToView} />}
          {isAppDataLoaded && currentView === 'rent' && <RentPage products={products} customers={customers} transactions={transactions} onCheckout={handleCheckoutDB} />}
          {isAppDataLoaded && currentView === 'return' && <ReturnPage transactions={transactions} onReturn={handleReturnDB} />}
          {isAppDataLoaded && currentView === 'products' && user.role === 'admin' && (
            <ProductsPage products={products} onSave={handleAddEditProductDB} onDelete={handleDeleteProductDB} />
          )}
          {isAppDataLoaded && currentView === 'customers' && (
            <CustomersPage customers={customers} transactions={transactions} onUpdateCustomer={handleUpdateCustomerDB} />
          )}
          {isAppDataLoaded && currentView === 'users' && user.role === 'admin' && (
            <UsersPage usersList={appUsers} onUpdateUser={handleUpdateAppUserDB} />
          )}
          {isAppDataLoaded && currentView === 'reports' && user.role === 'admin' && (
            <ReportsPage 
              transactions={transactions} 
              onViewReceipt={setReceiptData} 
              onDelete={handleDeleteTransactionDB}
              onEdit={handleEditTransactionDB}
            />
          )}
      </AppShell>

      {/* MODAL NOTA */}
      <ReceiptModal 
        receiptData={receiptData} 
        onClose={() => {
          setReceiptData(null);
          if (currentView === 'rent') navigateToView('dashboard');
        }} 
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
