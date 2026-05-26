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
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Menyiapkan data aplikasi...');
  const [dataLoadError, setDataLoadError] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const appHistoryReady = useRef(false);

  // Menyiapkan sesi aplikasi
  useEffect(() => {
    if (!auth) {
      window.setTimeout(() => {
        setDataLoadError('Sesi masuk belum siap. Muat ulang aplikasi lalu coba lagi.');
        setIsDataLoaded(true);
      }, 0);
      return;
    }
    const authTimeout = window.setTimeout(() => {
      setDataLoadError('Koneksi masuk terlalu lama. Pastikan internet stabil, lalu coba lagi.');
      setIsDataLoaded(true);
    }, 12000);

    const initAuth = async () => {
      try {
        setLoadingMessage('Menyiapkan sesi kasir...');
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error", err);
        setDataLoadError('Gagal menyiapkan sesi masuk. Periksa koneksi internet lalu coba lagi.');
        setIsDataLoaded(true);
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

  // Memuat data operasional
  useEffect(() => {
    if (!db) {
      window.setTimeout(() => {
        setDataLoadError('Database aplikasi belum siap. Muat ulang aplikasi lalu coba lagi.');
        setIsDataLoaded(true);
      }, 0);
      return;
    }
    if (!firebaseUser) return;

    window.setTimeout(() => {
      setLoadingMessage('Memuat data produk, transaksi, dan pengguna...');
      setDataLoadError('');
    }, 0);
    const slowConnectionNotice = window.setTimeout(() => {
      setLoadingMessage('Data masih dimuat. Koneksi sedang lebih lambat dari biasanya...');
    }, 12000);
    const loadingTimeout = window.setTimeout(() => {
      setDataLoadError('Data belum berhasil dimuat. Periksa internet atau coba muat ulang aplikasi.');
      setIsDataLoaded(true);
    }, 45000);

    const markLoaded = () => {
      window.clearTimeout(slowConnectionNotice);
      window.clearTimeout(loadingTimeout);
      setIsDataLoaded(true);
    };

    const unsubscribeData = listenToAppData({
      onProducts: setProducts,
      onCustomers: setCustomers,
      onTransactions: setTransactions,
      onUsers: (users) => {
        setAppUsers(users);
        markLoaded();
      },
      onError: (collectionName, error) => {
        console.error(`Error fetching ${collectionName}:`, error);
        setDataLoadError(`Data ${collectionName} belum bisa dibaca. Periksa koneksi lalu coba lagi.`);
        markLoaded();
      }
    });

    return () => {
      window.clearTimeout(slowConnectionNotice);
      window.clearTimeout(loadingTimeout);
      unsubscribeData();
    };
  }, [firebaseUser]);

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
    setIsDataLoaded(true);
    setIsDemoMode(true);
  };

  const handleLoginSuccess = (foundUser) => {
    setUser(foundUser);
    setCurrentView('dashboard');
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
        isDataLoaded={isDataLoaded}
        isDemoMode={isDemoMode}
        loadingMessage={loadingMessage}
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
        onLogout={() => setUser(null)}
        onNavigate={navigateToView}
        user={user}
      >
          {currentView === 'dashboard' && <DashboardPage transactions={transactions} products={products} onNavigate={navigateToView} />}
          {currentView === 'rent' && <RentPage products={products} customers={customers} transactions={transactions} onCheckout={handleCheckoutDB} />}
          {currentView === 'return' && <ReturnPage transactions={transactions} onReturn={handleReturnDB} />}
          {currentView === 'products' && user.role === 'admin' && (
            <ProductsPage products={products} onSave={handleAddEditProductDB} onDelete={handleDeleteProductDB} />
          )}
          {currentView === 'customers' && (
            <CustomersPage customers={customers} transactions={transactions} onUpdateCustomer={handleUpdateCustomerDB} />
          )}
          {currentView === 'users' && user.role === 'admin' && (
            <UsersPage usersList={appUsers} onUpdateUser={handleUpdateAppUserDB} />
          )}
          {currentView === 'reports' && user.role === 'admin' && (
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
