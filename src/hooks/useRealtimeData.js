import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { listenToAppData, listenToAppUsers } from '../services/firestoreData';

export const useRealtimeData = ({
  firebaseUser,
  user,
  isDemoMode,
  setDataLoadError,
  setIsLoginDataLoaded
}) => {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [financialRecords, setFinancialRecords] = useState([]);
  const [appUsers, setAppUsers] = useState([]);
  const [isAppDataLoaded, setIsAppDataLoaded] = useState(false);
  const [appLoadingMessage, setAppLoadingMessage] = useState('Memuat data aplikasi...');
  const [appDataStatus, setAppDataStatus] = useState({
    products: false,
    customers: false,
    transactions: false,
    bookings: false,
    financialRecords: false,
    users: false
  });

  // Memuat data login (users) sebelum login berhasil
  useEffect(() => {
    if (!db) {
      window.setTimeout(() => {
        setDataLoadError('Database aplikasi belum siap. Muat ulang aplikasi lalu coba lagi.');
        setIsLoginDataLoaded(true);
      }, 0);
      return undefined;
    }

    if (!firebaseUser || user || isDemoMode) return undefined;

    setDataLoadError('');
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
  }, [firebaseUser, user, isDemoMode, setDataLoadError, setIsLoginDataLoaded]);

  // Memuat data operasional setelah login berhasil
  useEffect(() => {
    if (!db || !firebaseUser || !user || isDemoMode) return undefined;

    const startLoadingNotice = window.setTimeout(() => {
      setIsAppDataLoaded(false);
      setAppDataStatus({
        products: false,
        customers: false,
        transactions: false,
        bookings: false,
        financialRecords: false,
        users: false
      });
      setAppLoadingMessage('Memuat data produk, pelanggan, booking, transaksi, dan keuangan...');
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
      bookings: false,
      financialRecords: false,
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
      onBookings: (items) => {
        setBookings(items);
        markCollectionLoaded('bookings');
      },
      onUsers: (users) => {
        setAppUsers(users);
        markCollectionLoaded('users');
      },
      onFinancialRecords: (items) => {
        setFinancialRecords(items);
        markCollectionLoaded('financialRecords');
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
  }, [firebaseUser, user, isDemoMode, setDataLoadError]);

  return {
    products,
    setProducts,
    customers,
    setCustomers,
    transactions,
    setTransactions,
    bookings,
    setBookings,
    financialRecords,
    setFinancialRecords,
    appUsers,
    setAppUsers,
    isAppDataLoaded,
    setIsAppDataLoaded,
    appLoadingMessage,
    setAppLoadingMessage,
    appDataStatus,
    setAppDataStatus
  };
};
