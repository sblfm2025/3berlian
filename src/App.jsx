import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, ShoppingBag, ArrowLeftRight, Users, 
  Package, FileText, LogOut, Plus, Minus, 
  Search, CheckCircle, AlertCircle, TrendingUp, 
  Calendar, Settings, Cloud, Edit, Trash2, Key, Mail, UserCog, X,
  Printer, Download, MessageCircle, FileSpreadsheet, FileDown,
  Percent, CreditCard, Banknote, QrCode, ArrowLeft
} from 'lucide-react';

// --- MANGGIL FIREBASE (IMPOR FIREBASE) ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, updateDoc, deleteDoc, onSnapshot, increment } from 'firebase/firestore';

// --- PANGATURAN FIREBASE (FIREBASE SETUP) ---
let app, auth, db, appId;
try {
  const myFirebaseConfig = {
    apiKey: "AIzaSyDkZ60CHecXzKq6xViz1yjyojFULv7o6A4",
    authDomain: "berlian-bcd07.firebaseapp.com",
    projectId: "berlian-bcd07",
    storageBucket: "berlian-bcd07.firebasestorage.app",
    messagingSenderId: "756325845365",
    appId: "1:756325845365:web:eda0fc95dd878133412b3c"
  };

  const firebaseConfig = typeof __firebase_config !== 'undefined' && Object.keys(JSON.parse(__firebase_config)).length > 0 
    ? JSON.parse(__firebase_config) 
    : myFirebaseConfig;

  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = typeof __app_id !== 'undefined' ? __app_id : 'sanggar-seni-3-berlian';
} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

// --- DATA MIMITI (MOCK DATA FOR SEEDING) ---
const initialProducts = [
  { id: 'p1', name: 'Baju Bodo (Makassar) Dewasa', category: 'Makassar', size: 'L', stock: 5, rentPrice: 150000, status: 'tersedia', photo: 'https://images.unsplash.com/photo-1604005937803-fb64516d00e5?w=200&q=80', dailyLateFee: 20000 },
  { id: 'p2', name: 'Baju Bodo (Makassar) Anak', category: 'Makassar', size: 'S', stock: 3, rentPrice: 100000, status: 'tersedia', photo: '', dailyLateFee: 15000 },
];

const initialAppUsers = [
  { id: 'admin_user', username: 'admin', password: '12345', role: 'admin', email: 'admin@3berlian.com', name: 'Super Admin' },
  { id: 'kasir_user', username: 'kasir', password: '12345', role: 'cashier', email: 'kasir@3berlian.com', name: 'Kasir Utama' }
];

// --- FUNGSI BANTUAN (UTILS) ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};
const formatNumberDot = (num) => {
  if (num === '' || num === null || num === undefined) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

// Fungsi pikeun memuat script library ti luar kalawan aman
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Fungsi pikeun ngecilan poto (Kompres Image)
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400; 
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

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

  // 1. Mimitian Firebase Auth
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setFirebaseUser);
    return () => unsubscribe();
  }, []);

  // 2. Nyokot Data (Data Fetching)
  useEffect(() => {
    if (!firebaseUser || !db) return;

    const unsubProducts = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'products'),
      (snap) => setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
      (error) => console.error("Error products:", error)
    );
    const unsubCustomers = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'customers'),
      (snap) => setCustomers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
      (error) => console.error("Error customers:", error)
    );
    const unsubTransactions = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'),
      (snap) => setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
      (error) => console.error("Error trx:", error)
    );
    const unsubUsers = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'),
      (snap) => {
        setAppUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setIsDataLoaded(true);
      },
      (error) => {
        console.error("Error fetching users:", error);
        alert("Gagal terhubung ke Database Firebase. Pastikan Anda sudah mengatur Firestore Rules dan Authentication.");
        setIsDataLoaded(true); 
      }
    );

    return () => { unsubProducts(); unsubCustomers(); unsubTransactions(); unsubUsers(); };
  }, [firebaseUser]);

  // --- NYIMPEN DATA FIREBASE (FIREBASE MUTATIONS) ---
  const handleCheckoutDB = async (newTransaction, cart) => {
    try {
      await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), newTransaction.id), newTransaction);
      for (const item of cart) {
        const pRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), item.product.id);
        await updateDoc(pRef, { stock: increment(-item.qty) });
      }
      
      // AUTO-SAVE CUSTOMER KE DATABASE CRM
      if (newTransaction.customerName) {
         const custId = newTransaction.customerPhone 
            ? `CUST-${newTransaction.customerPhone}` 
            : `CUST-${newTransaction.customerName.replace(/\s+/g, '-').toLowerCase()}`;
         
         await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'customers'), custId), {
           name: newTransaction.customerName,
           phone: newTransaction.customerPhone,
           address: newTransaction.customerAddress,
           lastRentDate: newTransaction.rentDate
         }, { merge: true });
      }

      setReceiptData(newTransaction);
    } catch (error) { alert('Gagal memproses transaksi.'); }
  };

  const handleReturnDB = async (selectedTrx) => {
    try {
      const trxRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), selectedTrx.id);
      await updateDoc(trxRef, { status: 'selesai', returnDate: new Date().toISOString().split('T')[0], lateFee: selectedTrx.calculatedFine });
      for (const item of selectedTrx.items) {
        const pRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), item.product.id);
        await updateDoc(pRef, { stock: increment(item.qty) });
      }
      alert('Barang berhasil dikembalikan!');
    } catch (error) { alert('Gagal memproses pengembalian.'); }
  };

  const handleAddEditProductDB = async (productData, isEdit) => {
    try {
      const id = isEdit ? productData.id : `P-${Date.now()}`;
      const finalData = { ...productData, id };
      const pRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), id);
      await setDoc(pRef, finalData, { merge: true });
      alert(isEdit ? 'Produk diperbarui!' : 'Produk ditambahkan!');
    } catch (err) { 
      console.error(err);
      alert('Proses penyimpanan dibatalkan karena terjadi kesalahan.'); 
    }
  };

  const handleDeleteProductDB = async (id) => {
    try {
      await deleteDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), id));
      alert('Produk dihapus!');
    } catch (err) { alert('Gagal menghapus produk.'); }
  };

  const handleUpdateAppUserDB = async (userData) => {
    try {
      await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'users'), userData.id), userData, { merge: true });
      alert('Data pengguna berhasil diperbarui!');
    } catch (err) { alert('Gagal memperbarui pengguna.'); }
  };

  const handleDeleteTransactionDB = async (trx) => {
    if (!window.confirm(`Yakin ingin menghapus transaksi ${trx.id}?\n\nPERINGATAN: Jika status nota masih 'disewa', stok barang akan otomatis dikembalikan ke rak.`)) return;
    try {
      if (trx.status === 'disewa') {
        for (const item of trx.items) {
          const pRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), item.product.id);
          await updateDoc(pRef, { stock: increment(item.qty) });
        }
      }
      await deleteDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), trx.id));
      alert('Transaksi berhasil dihapus!');
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus transaksi.');
    }
  };

  const handleEditTransactionDB = async (updatedTrx) => {
    try {
      const tRef = doc(collection(db, 'artifacts', appId, 'public', 'data', 'transactions'), updatedTrx.id);
      await updateDoc(tRef, updatedTrx);
      alert('Transaksi berhasil diperbarui!');
    } catch (err) {
      console.error(err);
      alert('Gagal memperbarui transaksi.');
    }
  };

  const handleSeedInit = async () => {
    try {
      for (const u of initialAppUsers) {
        await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'users'), u.id), u);
      }
      for (const p of initialProducts) {
        await setDoc(doc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), p.id), p);
      }
      alert('Sistem berhasil diinisialisasi!');
    } catch (err) { alert('Gagal inisialisasi awal.'); }
  };

  // --- LAYAR LOGIN (LOGIN SCREEN) ---
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const foundUser = appUsers.find(u => u.username === loginUsername && u.password === loginPassword);
    if (foundUser) {
      setUser(foundUser);
      setCurrentView('dashboard');
    } else {
      alert('Username atau password salah!');
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    const foundUser = appUsers.find(u => u.email === forgotEmail);
    if (foundUser) {
      alert(`Simulasi: Tautan reset password telah dikirim ke ${forgotEmail}. (Di lingkungan nyata, ini akan mengirim email beneran)`);
      setShowForgotPwd(false);
    } else {
      alert('Email tidak terdaftar di sistem!');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 font-sans relative">
        <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${firebaseUser ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
          <Cloud size={14} /> {firebaseUser ? 'Cloud Connected' : 'Connecting...'}
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center border-t-4 border-blue-800">
          <img 
            src="http://sbl.pinrangkab.go.id/wp-content/uploads/2026/04/Sanggar-Seni-3-Berlian.png" 
            alt="Logo" 
            className="w-32 h-32 mx-auto object-contain mb-4"
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Sanggar Seni 3 Berlian</h1>
          <p className="text-sm text-gray-500 mb-6">Sistem Manajemen Penyewaan</p>

          {!isDataLoaded ? (
            <div className="py-8 text-gray-400 animate-pulse">Memuat sistem...</div>
          ) : appUsers.length === 0 ? (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 mb-4">
              <AlertCircle className="mx-auto text-amber-500 mb-2" />
              <p className="text-sm text-amber-800 mb-3">Database kosong. Klik tombol di bawah untuk membuat akun default (Admin & Kasir).</p>
              <button onClick={handleSeedInit} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold w-full">
                Inisialisasi Sistem
              </button>
            </div>
          ) : !showForgotPwd ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Username</label>
                <div className="relative">
                  <UserCog size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" required value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Masukkan username" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-lg font-bold transition shadow-md">
                Masuk ke Sistem
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => setShowForgotPwd(true)} className="text-xs text-blue-600 hover:underline">Lupa Password?</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4 text-left animate-in fade-in">
              <h3 className="font-bold text-gray-800 border-b pb-2">Reset Password</h3>
              <p className="text-xs text-gray-500">Masukkan email yang terdaftar pada akun Anda untuk menerima instruksi pemulihan.</p>
              <div>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="email@contoh.com" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForgotPwd(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-amber-500 text-white py-2 rounded-lg font-bold">Kirim Link</button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --- MENU NAVIGASI (NAVIGATION CONFIG) ---
  const navItems = [
    { id: 'dashboard', label: 'Beranda', icon: Home, roles: ['admin', 'cashier'] },
    { id: 'rent', label: 'Sewa', icon: ShoppingBag, roles: ['admin', 'cashier'] },
    { id: 'return', label: 'Kembali', icon: ArrowLeftRight, roles: ['admin', 'cashier'] },
    { id: 'products', label: 'Produk', icon: Package, roles: ['admin'] },
    { id: 'users', label: 'Pengguna', icon: Users, roles: ['admin'] },
    { id: 'reports', label: 'Laporan', icon: FileText, roles: ['admin'] },
  ];

  const filteredNav = navItems.filter(item => item.roles.includes(user.role));

  // --- TAMPILAN UTAMA (VIEWS) ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-64 bg-blue-900 text-white flex-col shadow-xl z-20">
        <div className="p-6 text-center border-b border-blue-800 relative">
           <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${firebaseUser ? 'bg-green-400 shadow-[0_0_8px_#4ade80]' : 'bg-gray-400'}`} title="Cloud Sync Status" />
           <img src="http://sbl.pinrangkab.go.id/wp-content/uploads/2026/04/Sanggar-Seni-3-Berlian.png" alt="Logo" className="w-16 h-16 mx-auto object-contain mb-2 bg-white rounded-full p-1" onError={(e) => { e.target.style.display = 'none' }}/>
          <h2 className="text-lg font-bold text-amber-400">3 Berlian</h2>
        </div>
        <div className="flex-1 px-4 py-6 space-y-2">
          {filteredNav.map(item => (
            <button key={item.id} onClick={() => setCurrentView(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${currentView === item.id ? 'bg-amber-500 text-white shadow-md' : 'text-blue-100 hover:bg-blue-800'}`}>
              <item.icon size={20} /> <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center font-bold shadow-inner">{user.username.charAt(0).toUpperCase()}</div>
            <div className="text-left w-full overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-amber-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button onClick={() => setUser(null)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-950 text-blue-200 rounded-lg hover:text-white transition">
            <LogOut size={16} /> Keluar
          </button>
        </div>
      </aside>

      {/* HEADER MOBILE */}
      <header className="md:hidden bg-blue-900 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <img src="http://sbl.pinrangkab.go.id/wp-content/uploads/2026/04/Sanggar-Seni-3-Berlian.png" alt="Logo" className="w-8 h-8 bg-white rounded-full p-0.5" onError={(e) => { e.target.style.display = 'none' }}/>
          <h1 className="font-bold text-lg text-amber-400 tracking-wide">3 Berlian</h1>
        </div>
        <button onClick={() => setUser(null)} className="p-2 text-blue-200 hover:text-white active:scale-95 transition-transform"><LogOut size={20} /></button>
      </header>

      {/* KONTEN (MAIN CONTENT AREA) */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] md:h-screen overflow-hidden bg-gray-50">
        {/* Penambahan padding bawah (pb-32) di HP untuk menghindari konten tertutup navbar bawah */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-32 md:pb-8 relative">
          {currentView === 'dashboard' && <DashboardView transactions={transactions} products={products} />}
          {currentView === 'rent' && <RentView products={products} customers={customers} onCheckout={handleCheckoutDB} />}
          {currentView === 'return' && <ReturnView transactions={transactions} onReturn={handleReturnDB} />}
          {currentView === 'products' && user.role === 'admin' && (
            <ProductsView products={products} onSave={handleAddEditProductDB} onDelete={handleDeleteProductDB} />
          )}
          {currentView === 'users' && user.role === 'admin' && (
            <UsersView usersList={appUsers} onUpdateUser={handleUpdateAppUserDB} />
          )}
          {currentView === 'reports' && user.role === 'admin' && (
            <ReportsView 
              transactions={transactions} 
              onViewReceipt={setReceiptData} 
              onDelete={handleDeleteTransactionDB}
              onEdit={handleEditTransactionDB}
            />
          )}
        </div>
      </main>

      {/* NAVIGASI HANDPHONE (BOTTOM NAVIGATION) DENGAN SAFE AREA PADDING */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-[0_-8px_25px_rgba(0,0,0,0.05)] z-40 pb-3 pt-2 px-1">
        <div className="flex w-full justify-between items-end">
          {filteredNav.map(item => (
            <button 
              key={item.id} 
              onClick={() => setCurrentView(item.id)} 
              className={`flex flex-col items-center justify-center flex-1 transition-all px-0.5 ${currentView === item.id ? 'text-blue-700' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className={`p-1.5 rounded-full mb-0.5 transition-all ${currentView === item.id ? 'bg-blue-50 scale-110 shadow-sm' : 'bg-transparent'}`}>
                <item.icon size={22} className={currentView === item.id ? 'stroke-blue-700' : ''} />
              </div>
              <span className={`text-[10px] text-center leading-tight tracking-tight ${currentView === item.id ? 'font-bold text-blue-800' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* MODAL NOTA */}
      <ReceiptModal 
        receiptData={receiptData} 
        onClose={() => {
          setReceiptData(null);
          if (currentView === 'rent') setCurrentView('dashboard');
        }} 
      />
    </div>
  );
}

// ==========================================
// TAMPILAN BERANDA (DASHBOARD)
// ==========================================
function DashboardView({ transactions, products }) {
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.rentDate === today);
  const totalIncomeToday = todayTransactions.reduce((sum, t) => sum + t.totalAmount, 0);
  const activeRentals = transactions.filter(t => t.status === 'disewa').length;
  const needsReturnCount = transactions.filter(t => t.status === 'disewa' && t.expectedReturnDate <= today).length;

  const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', data: [] });
  const handleOpenModal = (title, data) => setModalConfig({ isOpen: true, title, data });
  const handleCloseModal = () => setModalConfig({ isOpen: false, title: '', data: [] });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Ringkasan Hari Ini</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div onClick={() => handleOpenModal('Transaksi Baru Hari Ini', todayTransactions)} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-amber-500 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all active:scale-95">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-gray-500 font-medium">Transaksi Baru</p><h3 className="text-3xl font-black text-gray-800 mt-1">{todayTransactions.length}</h3></div>
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600"><TrendingUp size={24} /></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pemasukan</span>
            <span className="font-bold text-green-600 text-lg">{formatCurrency(totalIncomeToday)}</span>
          </div>
        </div>
        <div onClick={() => handleOpenModal('Daftar Sedang Disewa', transactions.filter(t => t.status === 'disewa'))} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all active:scale-95">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-gray-500 font-medium">Sedang Disewa</p><h3 className="text-3xl font-black text-gray-800 mt-1">{activeRentals}</h3></div>
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600"><Package size={24} /></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50">
             <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Nota belum kembali</p>
          </div>
        </div>
        <div onClick={() => handleOpenModal('Perlu Dikembalikan / Terlambat', transactions.filter(t => t.status === 'disewa' && t.expectedReturnDate <= today))} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-red-500 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all active:scale-95">
          <div className="flex justify-between items-start">
            <div><p className="text-sm text-gray-500 font-medium">Perlu Dikembalikan</p><h3 className="text-3xl font-black text-red-600 mt-1">{needsReturnCount}</h3></div>
            <div className="p-3 bg-red-50 rounded-2xl text-red-600"><AlertCircle size={24} /></div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50">
             <p className="text-xs text-red-400 font-bold uppercase tracking-wider">Jatuh tempo / terlambat</p>
          </div>
        </div>
      </div>

      {modalConfig.isOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] shadow-2xl animate-in zoom-in-95">
            <div className="p-5 bg-blue-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">{modalConfig.title}</h3>
              <button onClick={handleCloseModal} className="p-1.5 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors"><X size={20}/></button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 bg-gray-50/50">
              {modalConfig.data.length === 0 ? (
                <div className="text-center text-gray-400 py-12 flex flex-col items-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4"><FileText size={32} className="text-gray-300" /></div>
                  <p className="font-medium text-gray-500">Tidak ada data untuk kategori ini.</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {modalConfig.data.slice().sort((a,b) => b.rentDate.localeCompare(a.rentDate)).map(t => (
                    <li key={t.id} className="border border-gray-200 rounded-2xl p-4 bg-white shadow-sm hover:border-blue-300 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-900">{t.id}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1"><Users size={14} className="text-gray-400"/> {t.customerName}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${t.status === 'selesai' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {t.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-end pt-3 border-t border-gray-100">
                        <div className="text-[11px] text-gray-500 space-y-1">
                          <p>Sewa: <span className="font-semibold text-gray-700">{formatDate(t.rentDate)}</span></p>
                          <p>Batas: <span className={`font-semibold ${t.expectedReturnDate <= today && t.status === 'disewa' ? 'text-red-500' : 'text-gray-700'}`}>{formatDate(t.expectedReturnDate)}</span></p>
                        </div>
                        <div className="font-black text-amber-600 text-lg">{formatCurrency(t.totalAmount)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// TAMPILAN KASIR (RENT VIEW - SPESIALIS POS)
// ==========================================
function RentView({ products, customers, onCheckout }) {
  const [cart, setCart] = useState([]);
  
  // State Pelanggan
  const [customerNameInput, setCustomerNameInput] = useState('');
  const [customerPhoneInput, setCustomerPhoneInput] = useState('');
  const [customerAddressInput, setCustomerAddressInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false); 

  // State Pengaturan Checkout
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];
  const [returnDateInput, setReturnDateInput] = useState(defaultDateStr);
  
  const [search, setSearch] = useState('');
  const [showMobileCheckout, setShowMobileCheckout] = useState(false); 

  // State Kasir Profesional (Pembayaran, Diskon)
  const [discountType, setDiscountType] = useState('nominal'); 
  const [discountValue, setDiscountValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Tunai'); 
  const [cashReceived, setCashReceived] = useState('');

  // 1. FILTER PRODUK
  const availableProducts = products.filter(p => p.stock > 0 && p.name.toLowerCase().includes(search.toLowerCase()));

  // 2. FILTER PELANGGAN (Auto-complete)
  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerNameInput.toLowerCase()) && customerNameInput.length > 0);

  // 3. KALKULASI KEUANGAN KASIR
  const subTotal = cart.reduce((sum, item) => sum + (item.product.rentPrice * item.qty), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);

  let discountAmount = 0;
  const rawDiscount = Number(discountValue) || 0;
  if (discountType === 'percent') {
     discountAmount = subTotal * (rawDiscount / 100);
  } else {
     discountAmount = rawDiscount;
  }
  
  const grandTotal = Math.max(0, subTotal - discountAmount);
  
  let changeAmount = 0;
  const finalCashReceived = Number(cashReceived) || 0;
  if (paymentMethod === 'Tunai') {
     changeAmount = Math.max(0, finalCashReceived - grandTotal);
  }

  // 4. HANDLER KERANJANG
  const updateCartQty = (product, delta) => {
    const existing = cart.find(item => item.product.id === product.id);
    if (!existing && delta > 0) {
      setCart([...cart, { product, qty: 1 }]);
    } else if (existing) {
      const newQty = existing.qty + delta;
      if (newQty <= 0) {
         setCart(cart.filter(item => item.product.id !== product.id));
         if (cart.length === 1 && newQty <= 0) setShowMobileCheckout(false); 
      }
      else if (newQty <= product.stock) setCart(cart.map(item => item.product.id === product.id ? { ...item, qty: newQty } : item));
    }
  };

  // 5. PROSES CHECKOUT FINAL
  const handleCheckoutClick = () => {
    if (cart.length === 0) return alert("Pilih barang terlebih dahulu");
    if (!customerNameInput.trim()) return alert("Masukkan nama pelanggan");
    if (!returnDateInput) return alert("Masukkan tanggal pengembalian");
    
    if (paymentMethod === 'Tunai' && finalCashReceived < grandTotal) {
      return alert("Transaksi Ditolak: Uang tunai yang diterima kurang dari total tagihan!");
    }

    const todayDate = new Date();

    onCheckout({
      id: `TRX-${Date.now().toString().slice(-6)}`,
      customerName: customerNameInput,
      customerPhone: customerPhoneInput,
      customerAddress: customerAddressInput,
      items: cart,
      rentDate: todayDate.toISOString().split('T')[0],
      expectedReturnDate: returnDateInput,
      
      subTotal: subTotal,
      discountAmount: discountAmount,
      totalAmount: grandTotal,
      paymentMethod: paymentMethod,
      cashReceived: paymentMethod === 'Tunai' ? finalCashReceived : 0,
      change: paymentMethod === 'Tunai' ? changeAmount : 0,
      
      status: 'disewa',
      lateFee: 0
    }, cart);
    
    setCart([]); 
    setCustomerNameInput('');
    setCustomerPhoneInput('');
    setCustomerAddressInput('');
    setReturnDateInput(defaultDateStr);
    setDiscountValue('');
    setCashReceived('');
    setPaymentMethod('Tunai');
    setShowMobileCheckout(false);
  };

  return (
    <div className="flex h-full max-w-7xl mx-auto relative gap-6">
      
      {/* BAGIAN KIRI: DAFTAR PRODUK */}
      <div className="flex-1 flex flex-col h-full bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden relative">
        
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm flex gap-2 items-center">
          <div className="relative flex-1">
             <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
             <input type="text" placeholder="Cari baju adat atau aksesori..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-2xl text-sm focus:outline-none focus:border-blue-200 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all" />
          </div>
        </div>
        
        {/* Grid Produk - Padding disesuaikan aman dari FAB */}
        <div className="flex-1 overflow-y-auto p-4 md:p-5 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 auto-rows-max bg-gray-50/50 pb-32">
          {availableProducts.length === 0 ? (
            <div className="col-span-full text-center py-16">
               <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Package size={32} className="text-gray-300"/></div>
               <p className="text-gray-500 font-medium">Barang tidak ditemukan</p>
            </div>
          ) : availableProducts.map(product => {
            const cartItem = cart.find(i => i.product.id === product.id);
            const isSelected = !!cartItem;

            return (
              <div key={product.id} className={`flex flex-col rounded-3xl overflow-hidden transition-all duration-300 bg-white border-2 ${isSelected ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-transparent shadow-sm hover:shadow-md hover:border-gray-200'}`}>
                {/* Area Foto */}
                <div className="h-36 md:h-40 bg-gray-100 relative group cursor-pointer" onClick={() => !isSelected && updateCartQty(product, 1)}>
                  {product.photo ? (
                    <img src={product.photo} alt={product.name} className="object-cover w-full h-full" onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5Y2EzYWYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48bGluZSB4MT0iMyIgeTE9IjMiIHgyPSIyMSIgeTI9IjIxIj48L2xpbmU+PHBhdGggZD0iTTEwLjUgMTAuNVYxMGg0djMuNW0tMiAyaC00djRMNSA4bDEuNS0xLjUiPjwvcGF0aD48L3N2Zz4=' }}/>
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-300"><Package size={40}/></div>
                  )}
                  {/* Badge Terpilih */}
                  {isSelected && (
                     <div className="absolute top-2 right-2 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-black shadow-lg animate-in zoom-in-50 border-2 border-white">
                       {cartItem.qty}
                     </div>
                  )}
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg">
                    Sisa: {product.stock}
                  </div>
                </div>

                {/* Area Info & Tombol */}
                <div className="p-3.5 flex flex-col flex-1">
                  <h4 className="font-bold text-[13px] md:text-sm text-gray-800 leading-snug mb-1 line-clamp-2">{product.name}</h4>
                  <div className="mt-auto pt-3">
                    <div className="font-black text-amber-600 text-sm md:text-base mb-2.5">{formatCurrency(product.rentPrice)}</div>
                    
                    {isSelected ? (
                       <div className="flex items-center justify-between bg-blue-50 rounded-2xl p-1 border border-blue-100">
                         <button onClick={(e) => { e.stopPropagation(); updateCartQty(product, -1); }} className="p-2.5 bg-white text-blue-700 rounded-xl shadow-sm hover:bg-blue-100 active:scale-95 transition-transform"><Minus size={16} strokeWidth={3}/></button>
                         <span className="font-black text-lg px-2 text-blue-900">{cartItem.qty}</span>
                         <button onClick={(e) => { e.stopPropagation(); updateCartQty(product, 1); }} className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 active:scale-95 transition-transform"><Plus size={16} strokeWidth={3}/></button>
                       </div>
                    ) : (
                       <button onClick={(e) => { e.stopPropagation(); updateCartQty(product, 1); }} className="w-full bg-gray-100 hover:bg-blue-600 text-gray-700 hover:text-white py-3 rounded-2xl text-[13px] font-bold transition-colors active:scale-95 flex items-center justify-center gap-1.5">
                         <Plus size={16} strokeWidth={3}/> Tambah
                       </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FLOATING ACTION BAR KERANJANG (KHUSUS HP) - AMAN DARI NAVIGASI BAWAH */}
      {totalItems > 0 && !showMobileCheckout && (
        <div className="md:hidden fixed bottom-24 left-0 right-0 px-4 z-20 animate-in slide-in-from-bottom-10 pointer-events-none">
           <div className="bg-blue-900 text-white p-3.5 rounded-3xl shadow-[0_10px_30px_rgba(30,58,138,0.5)] flex justify-between items-center pointer-events-auto border border-blue-800">
             <div className="flex flex-col px-2">
               <span className="text-[11px] text-blue-200 font-semibold mb-0.5">Total Keranjang ({totalItems} item)</span>
               <span className="font-black text-xl leading-none text-amber-400">{formatCurrency(grandTotal)}</span>
             </div>
             <button onClick={() => setShowMobileCheckout(true)} className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-transform active:scale-95 shadow-md">
               Lanjut <ArrowLeftRight size={18}/>
             </button>
           </div>
        </div>
      )}

      {/* BAGIAN KANAN: FORM IDENTITAS, DISKON, PEMBAYARAN (PANEL DESKTOP / BOTTOM SHEET HP) */}
      <div className={`${showMobileCheckout ? 'fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in' : 'hidden md:flex'} w-full md:w-[400px] shrink-0`}>
        
        <div className={`bg-white w-full h-[90vh] md:h-full flex flex-col md:rounded-3xl md:shadow-sm md:border md:border-gray-200 shadow-2xl ${showMobileCheckout ? 'rounded-t-[32px] animate-in slide-in-from-bottom-full' : ''}`}>
          
          <div className="p-5 border-b bg-blue-900 text-white md:rounded-t-3xl flex justify-between items-center shrink-0">
            <h3 className="font-bold text-lg flex items-center gap-2"><ShoppingBag size={20}/> Checkout</h3>
            {showMobileCheckout && (
              <button onClick={() => setShowMobileCheckout(false)} className="md:hidden p-2 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors"><X size={20}/></button>
            )}
          </div>

          <div className="p-4 md:p-5 flex-1 overflow-y-auto bg-gray-50 flex flex-col gap-4">
            
            {/* 1. Form Pelanggan */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4 relative overflow-visible">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5"><Users size={14}/> Identitas Pelanggan</h4>
              
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Ketik Nama Pelanggan *" 
                  value={customerNameInput} 
                  onChange={e => { setCustomerNameInput(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} 
                  className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl text-sm font-medium bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all" 
                />
                
                {/* Pop-up Saran Pelanggan */}
                {showSuggestions && customerNameInput && filteredCustomers.length > 0 && (
                  <ul className="absolute z-20 w-full bg-white border border-gray-200 shadow-2xl max-h-48 overflow-y-auto rounded-2xl mt-1.5 divide-y divide-gray-50 left-0 animate-in fade-in slide-in-from-top-2">
                    {filteredCustomers.map(c => (
                      <li 
                        key={c.id} 
                        className="p-3 hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => {
                          setCustomerNameInput(c.name);
                          setCustomerPhoneInput(c.phone || '');
                          setCustomerAddressInput(c.address || '');
                          setShowSuggestions(false);
                        }}
                      >
                        <p className="font-bold text-sm text-gray-800">{c.name}</p>
                        <p className="text-[11px] text-gray-500 mt-1 flex gap-2">
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium">{c.phone || '-'}</span> 
                          <span className="truncate flex-1">{c.address || ''}</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <input type="tel" placeholder="No. WA / Telepon (Opsional)" value={customerPhoneInput} onChange={e => setCustomerPhoneInput(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl text-sm font-medium bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none transition-all" />
              <textarea placeholder="Alamat Lengkap (Opsional)" value={customerAddressInput} onChange={e => setCustomerAddressInput(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-100 rounded-2xl text-sm font-medium bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-none resize-none transition-all" rows="2" />
            </div>

            {/* 2. Daftar Keranjang */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-1.5"><Package size={14}/> Rincian Sewa ({totalItems})</h4>
              {cart.length === 0 ? (
                <div className="text-center py-6 text-gray-300 text-sm font-medium border-2 border-dashed border-gray-100 rounded-2xl">Keranjang Kosong</div>
              ) : (
                <ul className="space-y-4">
                  {cart.map(item => (
                    <li key={item.product.id} className="flex justify-between items-center group">
                      <div className="flex-1 pr-3 min-w-0">
                        <p className="text-[13px] font-bold text-gray-800 leading-tight mb-1 truncate">{item.product.name}</p>
                        <p className="text-[11px] font-bold text-amber-600">{formatCurrency(item.product.rentPrice)}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 border border-gray-100 shrink-0">
                        <button onClick={() => updateCartQty(item.product, -1)} className="p-2 bg-white text-red-500 rounded-lg shadow-sm active:scale-95"><Minus size={14} strokeWidth={3}/></button>
                        <span className="w-6 text-center font-black text-sm text-gray-800">{item.qty}</span>
                        <button onClick={() => updateCartQty(item.product, 1)} className="p-2 bg-white text-green-600 rounded-lg shadow-sm active:scale-95"><Plus size={14} strokeWidth={3}/></button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 3. Diskon & Metode Pembayaran */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-5">
              
              <div>
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Percent size={14}/> Diskon</h4>
                <div className="flex gap-2">
                  <select value={discountType} onChange={(e) => {setDiscountType(e.target.value); setDiscountValue('');}} className="px-3 py-3 border-2 border-gray-100 rounded-2xl text-sm font-bold bg-gray-50 outline-none focus:border-amber-400 cursor-pointer">
                    <option value="nominal">Rp</option>
                    <option value="percent">%</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Nilai Diskon..." 
                    value={discountType === 'nominal' ? formatNumberDot(discountValue) : discountValue} 
                    onChange={e => {
                      const rawVal = e.target.value.replace(/[^0-9]/g, '');
                      if (discountType === 'percent' && Number(rawVal) > 100) return;
                      setDiscountValue(rawVal);
                    }} 
                    className="flex-1 px-4 py-3 border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-800 bg-gray-50 focus:bg-white focus:border-amber-400 focus:outline-none transition-all" 
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><CreditCard size={14}/> Pembayaran</h4>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <button onClick={() => setPaymentMethod('Tunai')} className={`py-3 rounded-2xl text-[11px] font-bold flex flex-col items-center gap-1.5 border-2 transition-all ${paymentMethod === 'Tunai' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-500'}`}><Banknote size={20}/> Tunai</button>
                  <button onClick={() => setPaymentMethod('Transfer')} className={`py-3 rounded-2xl text-[11px] font-bold flex flex-col items-center gap-1.5 border-2 transition-all ${paymentMethod === 'Transfer' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-500'}`}><CreditCard size={20}/> Transfer</button>
                  <button onClick={() => setPaymentMethod('QRIS')} className={`py-3 rounded-2xl text-[11px] font-bold flex flex-col items-center gap-1.5 border-2 transition-all ${paymentMethod === 'QRIS' ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200 hover:text-blue-500'}`}><QrCode size={20}/> QRIS</button>
                </div>

                {/* Input Khusus Pembayaran Tunai */}
                {paymentMethod === 'Tunai' && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200/60 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <label className="block text-[11px] font-black text-amber-800 uppercase tracking-widest mb-2">Uang Diterima</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Rp 0" 
                          value={formatNumberDot(cashReceived)} 
                          onChange={e => setCashReceived(e.target.value.replace(/[^0-9]/g, ''))} 
                          className="flex-1 px-4 py-3 border-2 border-white rounded-xl text-sm font-black bg-white focus:outline-none focus:border-amber-400 text-amber-900 shadow-sm" 
                        />
                        <button onClick={() => setCashReceived(grandTotal)} className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 whitespace-nowrap">Uang Pas</button>
                      </div>
                    </div>
                    {finalCashReceived >= grandTotal && finalCashReceived > 0 && (
                      <div className="flex justify-between items-center pt-3 border-t border-amber-200/50 mt-1">
                        <span className="text-[11px] font-black text-amber-800 uppercase tracking-widest">Kembalian</span>
                        <span className="text-lg font-black text-emerald-600 bg-emerald-100 px-3 py-1 rounded-lg">{formatCurrency(changeAmount)}</span>
                      </div>
                    )}
                    {finalCashReceived > 0 && finalCashReceived < grandTotal && (
                      <div className="text-[11px] text-red-600 font-bold flex gap-1.5 items-center bg-red-100 px-3 py-2 rounded-lg mt-2">
                         <AlertCircle size={14}/> Uang kurang {formatCurrency(grandTotal - finalCashReceived)}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>

          <div className="p-4 md:p-5 bg-white border-t shrink-0 md:rounded-b-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.03)] pb-6 md:pb-5">
            <div className="flex justify-between items-center mb-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest pl-1">Batas Kembali</span>
              <input type="date" value={returnDateInput} onChange={(e) => setReturnDateInput(e.target.value)} min={new Date().toISOString().split('T')[0]} className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:border-blue-400 cursor-pointer shadow-sm" />
            </div>
            
            <div className="space-y-1 mb-4 px-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">Subtotal</span>
                <span className="text-sm font-bold text-gray-700">{formatCurrency(subTotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-600">
                  <span className="text-xs font-bold">Diskon</span>
                  <span className="text-sm font-bold">-{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-3 border-t border-gray-100 mt-2">
                <span className="font-black text-gray-800 uppercase tracking-widest text-xs">Total Tagihan</span>
                <span className="text-3xl font-black text-blue-700 leading-none tracking-tight">{formatCurrency(grandTotal)}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckoutClick} 
              disabled={cart.length === 0 || (paymentMethod === 'Tunai' && finalCashReceived < grandTotal)} 
              className="w-full bg-blue-800 hover:bg-blue-900 text-white py-4 rounded-2xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle size={24}/> Proses Penyewaan
            </button>
          </div>
          
        </div>
      </div>

    </div>
  );
}

// ==========================================
// TAMPILAN PENGEMBALIAN (RETURN VIEW) - DRILL DOWN UI (MOBILE FRIENDLY)
// ==========================================
function ReturnView({ transactions, onReturn }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrx, setSelectedTrx] = useState(null);
  const activeTrx = transactions.filter(t => t.status === 'disewa' && (t.id.includes(searchTerm) || t.customerName.toLowerCase().includes(searchTerm.toLowerCase())));

  const handleSelect = (trx) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const expected = new Date(trx.expectedReturnDate); expected.setHours(0,0,0,0);
    const lateDays = today > expected ? Math.ceil(Math.abs(today - expected) / (1000 * 60 * 60 * 24)) : 0;
    
    let totalDailyFine = 0;
    trx.items.forEach(item => {
      const itemLateFee = item.product.dailyLateFee || 50000;
      totalDailyFine += (itemLateFee * item.qty);
    });
    const fine = lateDays * totalDailyFine;

    setSelectedTrx({ ...trx, calculatedLateDays: lateDays, calculatedFine: fine });
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-full relative">
      <h2 className={`text-2xl font-bold text-gray-800 mb-6 ${selectedTrx ? 'hidden md:block' : 'block'}`}>Pengembalian Barang</h2>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* PANEL KIRI: DAFTAR NOTA (Disembunyikan di HP jika ada nota dipilih) */}
        <div className={`w-full md:w-[40%] lg:w-1/3 border-r border-gray-100 flex-col bg-white ${selectedTrx ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
             <div className="relative">
               <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
               <input type="text" placeholder="Cari ID Nota / Nama..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-transparent focus:border-blue-200 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all" />
             </div>
          </div>
          <ul className="overflow-y-auto flex-1 p-2 space-y-1 bg-slate-50/30">
            {activeTrx.length === 0 ? (
               <li className="text-center py-10 text-gray-400 font-medium text-sm">Tidak ada barang disewa</li>
            ) : activeTrx.map(t => (
              <li key={t.id} onClick={() => handleSelect(t)} className={`p-4 rounded-2xl cursor-pointer transition-all border-2 ${selectedTrx?.id === t.id ? 'bg-blue-50/50 border-blue-500 shadow-sm' : 'border-transparent hover:bg-white hover:border-gray-200 hover:shadow-sm'}`}>
                <div className="flex justify-between items-center mb-1">
                   <p className="font-bold text-gray-900">{t.id}</p>
                   <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">{formatDate(t.rentDate)}</span>
                </div>
                <p className="text-sm text-gray-600 font-medium truncate">{t.customerName}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* PANEL KANAN: DETAIL PENGEMBALIAN */}
        <div className={`w-full md:w-[60%] lg:w-2/3 bg-gray-50 flex-col ${selectedTrx ? 'flex animate-in slide-in-from-right-8 md:slide-in-from-right-0' : 'hidden md:flex'}`}>
          {selectedTrx ? (
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
              
              {/* Tombol Back Mobile */}
              <button onClick={() => setSelectedTrx(null)} className="md:hidden mb-5 text-gray-500 hover:text-gray-800 font-bold flex items-center gap-2 transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm active:scale-95 w-max">
                 <ArrowLeft size={18}/> Daftar Nota
              </button>

              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-md relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                <h3 className="font-black text-xl text-gray-800 mb-6 flex items-center gap-2"><CheckCircle className="text-blue-600"/> Proses Pengembalian</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                   <div>
                     <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pelanggan</p>
                     <p className="font-bold text-gray-900 text-lg">{selectedTrx.customerName}</p>
                   </div>
                   <div>
                     <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">ID Nota</p>
                     <p className="font-bold text-gray-900 text-lg">{selectedTrx.id}</p>
                   </div>
                </div>

                <div className="mb-6 border border-gray-100 rounded-2xl p-4">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Item Dirental</h4>
                  <ul className="space-y-3">
                    {selectedTrx.items.map(item => (
                       <li key={item.product.id} className="flex justify-between items-center text-sm font-medium">
                         <span className="text-gray-800">{item.qty}x {item.product.name}</span>
                       </li>
                    ))}
                  </ul>
                </div>

                <div className={`p-5 rounded-2xl mb-8 border-2 ${selectedTrx.calculatedLateDays > 0 ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
                  {selectedTrx.calculatedLateDays > 0 ? (
                    <div className="flex items-start gap-4">
                       <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0"><AlertCircle className="text-red-600" size={24}/></div>
                       <div>
                         <h4 className="font-black text-red-800 text-lg mb-1">Terlambat {selectedTrx.calculatedLateDays} Hari!</h4>
                         <p className="text-sm text-red-600 font-medium mb-2">Pelanggan melewati batas waktu {formatDate(selectedTrx.expectedReturnDate)}</p>
                         <div className="bg-white px-4 py-3 rounded-xl border border-red-100 inline-block shadow-sm">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Total Denda</span>
                            <span className="text-2xl font-black text-red-700">{formatCurrency(selectedTrx.calculatedFine)}</span>
                         </div>
                       </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0"><CheckCircle className="text-emerald-600" size={20}/></div>
                       <div>
                         <h4 className="font-black text-emerald-800 text-lg">Tepat Waktu</h4>
                         <p className="text-xs font-bold text-emerald-600">Bebas denda keterlambatan.</p>
                       </div>
                    </div>
                  )}
                </div>

                <button onClick={() => { onReturn(selectedTrx); setSelectedTrx(null); }} className="w-full bg-blue-800 hover:bg-blue-900 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 flex justify-center items-center gap-2">
                  <Package size={22}/> Konfirmasi Barang Masuk
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
               <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm"><Package size={40} className="text-gray-300"/></div>
               <p className="font-medium text-lg text-gray-500">Pilih nota di sebelah kiri</p>
               <p className="text-sm">Untuk memproses pengembalian barang.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// TAMPILAN PRODUK (PRODUCTS VIEW)
// ==========================================
function ProductsView({ products, onSave, onDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); 
  
  const [formData, setFormData] = useState({ name: '', category: 'Bugis', size: 'All Size', rentPrice: '', stock: '', photo: '', dailyLateFee: '' });

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'All Size'];

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ name: product.name, category: product.category, size: product.size, rentPrice: product.rentPrice, stock: product.stock, photo: product.photo || '', dailyLateFee: product.dailyLateFee || '' });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: 'Bugis', size: 'All Size', rentPrice: '', stock: '', photo: '', dailyLateFee: '' });
    }
    setIsModalOpen(true);
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const base64Image = await compressImage(file);
      setFormData({ ...formData, photo: base64Image });
    } catch (err) {
      alert("Gagal memproses gambar. Coba gambar lain.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      const dataToSave = {
        ...formData,
        rentPrice: Number(formData.rentPrice),
        stock: Number(formData.stock),
        dailyLateFee: Number(formData.dailyLateFee),
        status: Number(formData.stock) > 0 ? 'tersedia' : 'habis'
      };

      if (editingProduct) dataToSave.id = editingProduct.id;
      
      await onSave(dataToSave, !!editingProduct);
      
      setIsModalOpen(false);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (id) => {
    if(window.confirm('Yakin ingin menghapus produk ini?')) onDelete(id);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Manajemen Produk</h2>
        <div className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari baju adat..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-300 shadow-sm transition-all"
            />
          </div>
          <button onClick={() => openModal()} className="bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shrink-0 shadow-sm transition-all active:scale-95">
            <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline">Tambah Produk</span><span className="sm:hidden">Tambah</span>
          </button>
        </div>
      </div>

      {/* Tampilan Tabel Desktop */}
      <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap text-sm">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Foto</th>
              <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Nama Produk</th>
              <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Kategori</th>
              <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Harga & Denda</th>
              <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Stok</th>
              <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredProducts.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-12 text-gray-400 font-medium bg-gray-50/50">Produk tidak ditemukan</td></tr>
            ) : filteredProducts.map(p => (
              <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-5">
                  {p.photo ? <img src={p.photo} alt="Foto" className="w-14 h-14 object-cover rounded-xl border border-gray-100 shadow-sm bg-white" /> : <div className="w-14 h-14 bg-gray-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400"><Package size={20}/></div>}
                </td>
                <td className="p-5 font-bold text-gray-800">{p.name}</td>
                <td className="p-5">
                  <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">{p.category}</span>
                </td>
                <td className="p-5 text-sm">
                  <div className="font-bold text-gray-800">Sewa: <span className="text-amber-600">{formatCurrency(p.rentPrice)}</span></div>
                  <div className="text-[11px] text-red-500 font-medium mt-0.5">Denda: {formatCurrency(p.dailyLateFee || 50000)}/hr</div>
                </td>
                <td className="p-5">
                   <span className={`px-3 py-1 rounded-lg text-xs font-bold ${p.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{p.stock} pcs</span>
                </td>
                <td className="p-5">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openModal(p)} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-colors"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors"><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tampilan Card Mobile */}
      <div className="md:hidden space-y-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-gray-400 font-medium bg-white rounded-3xl border border-dashed border-gray-200">Produk tidak ditemukan</div>
        ) : filteredProducts.map(p => (
          <div key={p.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex gap-4">
            <div className="shrink-0">
              {p.photo ? <img src={p.photo} alt="Foto" className="w-24 h-24 object-cover rounded-2xl border border-gray-100 bg-gray-50 shadow-sm" /> : <div className="w-24 h-24 bg-gray-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-center text-gray-400"><Package size={28}/></div>}
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-gray-800 text-sm leading-snug truncate mb-1">{p.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[10px] font-bold">{p.category}</span>
                  <span className="text-[11px] text-gray-500 font-medium">{p.size}</span>
                </div>
              </div>
              <div className="flex justify-between items-end mt-3">
                <div>
                  <p className="font-black text-amber-600 text-[15px]">{formatCurrency(p.rentPrice)}</p>
                  <p className="text-[10px] text-red-500 font-bold mt-0.5">Denda: {formatCurrency(p.dailyLateFee || 50000)}</p>
                </div>
                <div className="flex flex-col items-end gap-2.5">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${p.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    Sisa: {p.stock}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(p)} className="p-2 bg-blue-50 text-blue-600 rounded-lg active:scale-95 transition-transform"><Edit size={16}/></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg active:scale-95 transition-transform"><Trash2 size={16}/></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL TAMBAH/EDIT PRODUK */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 bg-blue-900 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} disabled={isUploading} className="p-1.5 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-5 max-h-[85vh] overflow-y-auto bg-gray-50/50">
              
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Nama Produk</label>
                <input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white transition-colors" disabled={isUploading}/>
              </div>
              
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-50 pb-2">Foto Produk (Opsional)</label>
                {formData.photo && (
                  <div className="flex justify-center mb-3">
                    <img src={formData.photo} alt="Preview" className="w-28 h-28 object-cover rounded-2xl border-4 border-white shadow-md bg-gray-50" />
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold mb-1.5 text-gray-500">Pilih dari Galeri (Otomatis Kompres)</label>
                  <input type="file" accept="image/*" disabled={isUploading} onChange={handleImageSelect} className="w-full border-2 border-dashed border-gray-200 p-3 rounded-xl text-xs font-medium text-gray-500 bg-gray-50 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                  {isUploading && <p className="text-xs text-amber-500 font-bold mt-2 animate-pulse flex items-center gap-1.5"><Cloud size={14}/> Memproses gambar...</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Kategori</label>
                  <input required value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white transition-colors" placeholder="Bugis/Aksesoris" disabled={isUploading}/>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Ukuran</label>
                  <input required value={formData.size} onChange={e=>setFormData({...formData, size: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white transition-colors" placeholder="Ketik..." disabled={isUploading}/>
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {sizeOptions.map(s => (
                      <button key={s} type="button" onClick={() => setFormData({...formData, size: s})} className={`px-2 py-1 text-[10px] font-bold border-2 rounded-lg transition-all active:scale-95 ${formData.size === s ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Sewa</label>
                  <input type="text" required value={formatNumberDot(formData.rentPrice)} onChange={e=>{
                    const rawVal = e.target.value.replace(/[^0-9]/g, ''); 
                    setFormData({...formData, rentPrice: rawVal});
                  }} className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-400 bg-gray-50 focus:bg-white transition-colors" disabled={isUploading}/>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Denda</label>
                  <input type="text" required value={formatNumberDot(formData.dailyLateFee)} onChange={e=>{
                    const rawVal = e.target.value.replace(/[^0-9]/g, ''); 
                    setFormData({...formData, dailyLateFee: rawVal});
                  }} className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:border-amber-400 bg-gray-50 focus:bg-white transition-colors" disabled={isUploading}/>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Stok</label>
                  <input type="number" required value={formData.stock} onChange={e=>setFormData({...formData, stock: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-bold text-gray-800 focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white transition-colors" disabled={isUploading}/>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} disabled={isUploading} className="flex-1 bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 py-3.5 rounded-2xl font-bold disabled:opacity-50 transition-colors">Batal</button>
                <button type="submit" disabled={isUploading} className="flex-1 bg-blue-800 hover:bg-blue-900 text-white py-3.5 rounded-2xl font-bold disabled:opacity-50 flex justify-center items-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95">
                  {isUploading ? <><Cloud size={18} className="animate-bounce" /> Proses...</> : 'Simpan Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// TAMPILAN PENGGUNA (USERS VIEW)
// ==========================================
function UsersView({ usersList, onUpdateUser }) {
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', password: '', email: '' });

  const openEdit = (user) => {
    setEditingUser(user);
    setFormData({ username: user.username, password: user.password, email: user.email });
  };

  const handleSave = (e) => {
    e.preventDefault();
    onUpdateUser({ ...editingUser, ...formData });
    setEditingUser(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Manajemen Pengguna</h2>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
        <p className="text-sm text-gray-500 mb-6 font-medium">Ubah kredensial (username/password) untuk akses Kasir atau Admin.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {usersList.map(u => (
            <div key={u.id} className="border-2 border-gray-100 p-5 rounded-3xl relative hover:border-blue-300 transition-colors bg-gray-50/50">
              <span className={`absolute top-5 right-5 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>{u.role}</span>
              <div className="w-14 h-14 bg-white shadow-sm rounded-2xl flex items-center justify-center mb-4 border border-gray-100"><UserCog className="text-blue-900" size={24}/></div>
              <h3 className="font-black text-xl text-gray-800 mb-1">{u.name}</h3>
              <div className="bg-white px-3 py-2 rounded-xl inline-block border border-gray-200 mb-5">
                 <p className="text-xs text-gray-500 font-bold flex gap-2 items-center">ID Login: <span className="font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[13px]">{u.username}</span></p>
              </div>
              <button onClick={() => openEdit(u)} className="w-full bg-white hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-200 text-blue-700 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 shadow-sm">Ubah Kredensial</button>
            </div>
          ))}
        </div>
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-5 bg-blue-900 text-white flex justify-between items-center border-b border-blue-800">
              <h3 className="font-bold text-lg">Edit Akun: {editingUser.name}</h3>
              <button onClick={()=>setEditingUser(null)} className="p-1.5 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-5 bg-gray-50/50">
               <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                 <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Username Login</label>
                 <input required value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 transition-colors" />
               </div>
               <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                 <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Password Baru</label>
                 <input required type="text" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 transition-colors" />
               </div>
               <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                 <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Pemulihan</label>
                 <input required type="email" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 transition-colors" />
               </div>
               <button type="submit" className="w-full bg-blue-800 hover:bg-blue-900 text-white py-4 rounded-2xl font-bold text-lg shadow-md transition-transform active:scale-95 mt-2">Simpan Perubahan</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// TAMPILAN LAPORAN (REPORTS VIEW)
// ==========================================
function ReportsView({ transactions, onViewReceipt, onDelete, onEdit }) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); 
  const [isExporting, setIsExporting] = useState(''); 
  
  const monthlyTrx = transactions.filter(t => t.rentDate.startsWith(selectedMonth));
  const sortedTransactions = monthlyTrx.slice().sort((a,b) => b.rentDate.localeCompare(a.rentDate));

  const totalSewa = monthlyTrx.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
  const totalDenda = monthlyTrx.reduce((sum, t) => sum + (t.lateFee || 0), 0);
  const totalRevenue = totalSewa + totalDenda;

  const [editingTrx, setEditingTrx] = useState(null);
  const [formData, setFormData] = useState({});

  const handleExportExcel = () => {
    setIsExporting('excel');
    const exportData = () => {
      try {
        const wsData = [
          ["SANGGAR SENI 3 BERLIAN"],
          ["Laporan Transaksi (Rekening Koran)"],
          [`Periode: ${selectedMonth}`],
          [],
          ["Tanggal", "No. Nota", "Pelanggan", "Status", "Sewa (Rp)", "Denda (Rp)", "Total (Rp)"]
        ];
        sortedTransactions.forEach(t => {
          wsData.push([ formatDate(t.rentDate), t.id, t.customerName, t.status.toUpperCase(), t.totalAmount || 0, t.lateFee || 0, (t.totalAmount || 0) + (t.lateFee || 0) ]);
        });
        wsData.push([]); 
        wsData.push(["", "", "", "TOTAL KESELURUHAN:", totalSewa, totalDenda, totalRevenue]);

        const ws = window.XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{wch: 15}, {wch: 15}, {wch: 25}, {wch: 12}, {wch: 15}, {wch: 15}, {wch: 15}];
        const wb = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(wb, ws, "Laporan");
        window.XLSX.writeFile(wb, `Rekening_Koran_${selectedMonth}.xlsx`);
      } catch (err) {
        console.error(err);
        alert("Gagal mengekspor file Excel.");
      } finally {
        setIsExporting('');
      }
    };

    if (!window.XLSX) {
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js')
        .then(exportData).catch(() => { setIsExporting(''); alert("Gagal memuat library Excel"); });
    } else {
      exportData();
    }
  };

  const handleExportPDF = async () => {
    setIsExporting('pdf');
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js');
      
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('l', 'mm', 'a4'); 
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("SANGGAR SENI 3 BERLIAN", 148, 15, { align: "center" });
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Laporan Transaksi (Rekening Koran)", 148, 22, { align: "center" });
      doc.setFontSize(10);
      doc.text(`Periode: ${selectedMonth}`, 148, 28, { align: "center" });

      const tableColumn = ["Tanggal", "No. Nota", "Pelanggan", "Status", "Sewa (Rp)", "Denda (Rp)", "Total (Rp)"];
      const tableRows = [];

      sortedTransactions.forEach(t => {
          const grandTotal = (t.totalAmount || 0) + (t.lateFee || 0);
          tableRows.push([
              formatDate(t.rentDate),
              t.id,
              t.customerName,
              t.status.toUpperCase(),
              formatNumberDot(t.totalAmount || 0),
              formatNumberDot(t.lateFee || 0),
              formatNumberDot(grandTotal)
          ]);
      });

      tableRows.push([
          { content: 'TOTAL KESELURUHAN:', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
          { content: formatNumberDot(totalSewa), styles: { fontStyle: 'bold' } },
          { content: formatNumberDot(totalDenda), styles: { fontStyle: 'bold', textColor: [220, 38, 38] } },
          { content: formatNumberDot(totalRevenue), styles: { fontStyle: 'bold' } }
      ]);

      doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 35,
          theme: 'grid',
          headStyles: { fillColor: [30, 58, 138] }, 
          styles: { fontSize: 9, cellPadding: 3 },
          columnStyles: {
              4: { halign: 'right' },
              5: { halign: 'right' },
              6: { halign: 'right' }
          }
      });

      doc.save(`Rekening_Koran_${selectedMonth}.pdf`);
    } catch (error) {
      console.error("PDF Data Render Error:", error);
      alert("Gagal memuat sistem PDF. Pastikan koneksi internet stabil.");
    } finally {
      setIsExporting('');
    }
  };

  const openEditModal = (trx) => {
    setEditingTrx(trx);
    setFormData({
      customerName: trx.customerName || '',
      customerPhone: trx.customerPhone || '',
      customerAddress: trx.customerAddress || '',
      rentDate: trx.rentDate || '',
      expectedReturnDate: trx.expectedReturnDate || '',
      status: trx.status || 'disewa',
      lateFee: trx.lateFee || 0
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updatedTrx = { ...editingTrx, ...formData, lateFee: Number(formData.lateFee) };
    onEdit(updatedTrx);
    setEditingTrx(null);
  };

  return (
    <div className="max-w-6xl mx-auto">
       <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
         <h2 className="text-2xl font-bold text-gray-800">Laporan Keuangan</h2>
         <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-gray-200">
           <Calendar size={18} className="text-gray-500" />
           <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border-none bg-transparent font-black text-gray-700 focus:outline-none cursor-pointer text-sm" />
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border p-6 rounded-3xl shadow-sm border-l-4 border-l-blue-500">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Pendapatan Sewa</p>
            <h3 className="text-3xl font-black text-gray-800">{formatCurrency(totalSewa)}</h3>
          </div>
          <div className="bg-white border p-6 rounded-3xl shadow-sm border-l-4 border-l-rose-500">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Pendapatan Denda</p>
            <h3 className="text-3xl font-black text-gray-800">{formatCurrency(totalDenda)}</h3>
          </div>
          <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-6 rounded-3xl text-white shadow-lg">
            <p className="text-xs font-black text-amber-50 uppercase tracking-widest mb-1">Total Keseluruhan</p>
            <h3 className="text-3xl font-black text-white">{formatCurrency(totalRevenue)}</h3>
          </div>
       </div>

       <div className="flex gap-3 mb-6">
         <button onClick={handleExportExcel} disabled={isExporting !== ''} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-5 py-3.5 rounded-2xl font-bold text-sm transition-transform active:scale-95 shadow-md">
           {isExporting === 'excel' ? <><Cloud size={18} className="animate-pulse"/> Proses...</> : <><FileSpreadsheet size={18} /> Export Excel (XLSX)</>}
         </button>
         <button onClick={handleExportPDF} disabled={isExporting !== ''} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 disabled:bg-gray-400 text-white px-5 py-3.5 rounded-2xl font-bold text-sm transition-transform active:scale-95 shadow-md">
           {isExporting === 'pdf' ? <><Cloud size={18} className="animate-pulse"/> Proses...</> : <><FileDown size={18} /> Export PDF</>}
         </button>
       </div>

       {/* Desktop View Table */}
       <div className="hidden md:block bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Tanggal</th>
                <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">No. Nota</th>
                <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Pelanggan</th>
                <th className="p-5 font-bold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                <th className="p-5 text-right font-bold text-gray-500 uppercase tracking-wider text-xs">Sewa</th>
                <th className="p-5 text-right font-bold text-gray-500 uppercase tracking-wider text-xs">Denda</th>
                <th className="p-5 text-right font-bold text-gray-500 uppercase tracking-wider text-xs">Total</th>
                <th className="p-5 text-center font-bold text-gray-500 uppercase tracking-wider text-xs">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedTransactions.length === 0 ? (
                <tr><td colSpan="8" className="py-12 text-center text-gray-400 font-medium">Tidak ada transaksi di bulan {selectedMonth}</td></tr>
              ) : sortedTransactions.map(t => {
                const grandTotal = (t.totalAmount || 0) + (t.lateFee || 0);
                return (
                <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-5 text-gray-600 font-medium">{formatDate(t.rentDate)}</td>
                  <td className="p-5 font-black text-gray-800">{t.id}</td>
                  <td className="p-5 font-bold text-gray-800">{t.customerName}</td>
                  <td className="p-5"><span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase ${t.status === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{t.status}</span></td>
                  <td className="p-5 text-right text-gray-700 font-medium">{formatCurrency(t.totalAmount || 0)}</td>
                  <td className="p-5 text-right text-red-600 font-medium">{formatCurrency(t.lateFee || 0)}</td>
                  <td className="p-5 text-right font-black text-gray-900">{formatCurrency(grandTotal)}</td>
                  <td className="p-5 text-center action-cell">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => onViewReceipt(t)} className="p-2.5 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-xl transition-colors" title="Cetak Nota"><Printer size={16}/></button>
                      <button onClick={() => openEditModal(t)} className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-colors" title="Edit Transaksi"><Edit size={16}/></button>
                      <button onClick={() => onDelete(t)} className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-colors" title="Hapus Transaksi"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
            <tfoot className="border-t-4 border-gray-100 font-black bg-gray-50/50">
              <tr>
                <td colSpan="4" className="p-5 text-right text-gray-500 uppercase tracking-widest text-xs">TOTAL KESELURUHAN:</td>
                <td className="p-5 text-right text-gray-800">{formatCurrency(totalSewa)}</td>
                <td className="p-5 text-right text-red-600">{formatCurrency(totalDenda)}</td>
                <td className="p-5 text-right text-blue-800 text-base">{formatCurrency(totalRevenue)}</td>
                <td className="action-cell"></td>
              </tr>
            </tfoot>
          </table>
       </div>

       <div className="md:hidden space-y-4 pb-20">
          <h3 className="font-bold text-gray-700 px-1">Riwayat Transaksi</h3>
          {sortedTransactions.length === 0 ? (
             <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-gray-200 text-gray-400 font-medium">Tidak ada transaksi</div>
          ) : sortedTransactions.map(t => (
            <div key={t.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{formatDate(t.rentDate)}</span>
                  <p className="font-black text-gray-900 text-lg leading-tight mt-1">{t.id}</p>
                  <p className="text-sm text-gray-600 font-bold flex items-center gap-1.5 mt-1.5"><Users size={14} className="text-gray-400"/> {t.customerName}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase ${t.status === 'selesai' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{t.status}</span>
              </div>
              <div className="flex justify-between items-end pt-1">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Sewa</p>
                  <p className="font-black text-gray-900 text-xl">{formatCurrency(t.totalAmount + (t.lateFee || 0))}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditModal(t)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl active:scale-95 transition-transform"><Edit size={16}/></button>
                  <button onClick={() => onDelete(t)} className="p-2.5 bg-red-50 text-red-600 rounded-xl active:scale-95 transition-transform"><Trash2 size={16}/></button>
                  <button onClick={() => onViewReceipt(t)} className="p-2.5 bg-amber-50 text-amber-600 rounded-xl active:scale-95 transition-transform"><Printer size={16}/></button>
                </div>
              </div>
            </div>
          ))}
       </div>

       {editingTrx && (
         <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
           <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95">
             <div className="p-5 bg-blue-900 text-white flex justify-between items-center border-b border-blue-800 shrink-0">
               <h3 className="font-bold text-lg flex items-center gap-2"><Edit size={18}/> Edit Transaksi</h3>
               <button onClick={() => setEditingTrx(null)} className="p-1.5 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors"><X size={20}/></button>
             </div>
             <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto bg-gray-50/50 space-y-5">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Identitas</label>
                  <input required value={formData.customerName} onChange={e=>setFormData({...formData, customerName: e.target.value})} placeholder="Nama Pelanggan" className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400" />
                  <input value={formData.customerPhone} onChange={e=>setFormData({...formData, customerPhone: e.target.value})} placeholder="No Telepon" className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400" />
                  <textarea value={formData.customerAddress} onChange={e=>setFormData({...formData, customerAddress: e.target.value})} placeholder="Alamat Lengkap" className="w-full border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 resize-none" rows="2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Tgl Sewa</label>
                    <input type="date" required value={formData.rentDate} onChange={e=>setFormData({...formData, rentDate: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 text-xs font-bold bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400" />
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Batas Kembali</label>
                    <input type="date" required value={formData.expectedReturnDate} onChange={e=>setFormData({...formData, expectedReturnDate: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl px-2 py-2 text-xs font-bold bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Status</label>
                    <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm font-bold bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400">
                      <option value="disewa">Disewa</option>
                      <option value="selesai">Selesai</option>
                    </select>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-2">Denda (Rp)</label>
                    <input type="text" value={formatNumberDot(formData.lateFee)} onChange={e=>{
                      const rawVal = e.target.value.replace(/[^0-9]/g, '');
                      setFormData({...formData, lateFee: rawVal});
                    }} className="w-full border-2 border-gray-100 rounded-xl px-3 py-2.5 text-sm font-bold bg-gray-50 focus:bg-white focus:outline-none focus:border-red-400 text-red-600" />
                  </div>
                </div>

                <div className="pt-2 bg-amber-50 p-4 rounded-2xl border border-amber-200/60 flex gap-3">
                  <AlertCircle size={24} className="text-amber-600 shrink-0"/>
                  <p className="text-[11px] text-amber-800 font-medium leading-relaxed">Mengedit rincian transaksi dari panel ini tidak mengubah stok barang. (Jika ingin merevisi item sewaan, harap Hapus nota ini dan buat pesanan baru di menu Kasir).</p>
                </div>
                
                <div className="pt-4 flex gap-3">
                   <button type="button" onClick={() => setEditingTrx(null)} className="flex-1 bg-white border-2 border-gray-200 text-gray-600 hover:bg-gray-50 py-3.5 rounded-2xl font-bold transition-colors">Batal</button>
                   <button type="submit" className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3.5 rounded-2xl font-bold shadow-md hover:shadow-lg transition-transform active:scale-95">Simpan Data</button>
                </div>
             </form>
           </div>
         </div>
       )}
    </div>
  );
}

// ==========================================
// TAMPILAN NOTA STRUK (RECEIPT MODAL)
// ==========================================
function ReceiptModal({ receiptData, onClose }) {
  const [isExporting, setIsExporting] = useState('');
  if (!receiptData) return null;

  const handlePrint = () => {
    let printContent = `
      <div class="text-center mb-4 border-b border-black pb-4 border-dashed">
        <h2 class="font-bold text-[18px] mb-1">3 BERLIAN</h2>
        <p class="text-[11px] font-semibold">SANGGAR SENI & RENTAL BAJU ADAT</p>
        <p class="text-[10px] mt-1">BTN Tiga Berlian, Watang Sawitto<br/>Kabupaten Pinrang</p>
        <p class="text-[10px] mt-1">Telp: 0813-4353-1375</p>
      </div>
      <div class="border-b border-black border-dashed mb-3 pb-3 text-[11px]">
        <div class="flex justify-between mb-1"><span class="text-gray-600">No. Nota:</span><span class="font-bold">${receiptData.id}</span></div>
        <div class="flex justify-between mb-1"><span class="text-gray-600">Tanggal:</span><span>${formatDate(receiptData.rentDate)}</span></div>
        <div class="flex justify-between items-start mb-1"><span class="text-gray-600">Pelanggan:</span><span class="font-bold uppercase text-right w-2/3">${receiptData.customerName}</span></div>
        ${receiptData.customerPhone ? `<div class="flex justify-between mb-1"><span class="text-gray-600">No. WA:</span><span>${receiptData.customerPhone}</span></div>` : ''}
        ${receiptData.customerAddress ? `<div class="flex justify-between items-start"><span class="text-gray-600">Alamat:</span><span class="text-right w-2/3 line-clamp-2">${receiptData.customerAddress}</span></div>` : ''}
      </div>
      <div class="border-b border-black border-dashed mb-3 pb-3 text-[11px]">
        <p class="font-bold mb-2">Item Disewa:</p>
    `;
    
    receiptData.items.forEach(item => {
      printContent += `
        <div class="mb-2">
          <div class="font-semibold leading-snug truncate">${item.product.name}</div>
          <div class="flex justify-between mt-1 text-gray-700">
            <span>${item.qty} x ${formatCurrency(item.product.rentPrice).replace('Rp', '')}</span>
            <span class="font-bold">${formatCurrency(item.qty * item.product.rentPrice).replace('Rp', '')}</span>
          </div>
        </div>
      `;
    });

    printContent += `</div><div class="border-b border-black border-dashed mb-4 pb-3 space-y-1">`;
    printContent += `<div class="flex justify-between text-[11px] text-gray-600"><span>Subtotal:</span><span>${formatCurrency(receiptData.subTotal || receiptData.totalAmount)}</span></div>`;
    
    if (receiptData.discountAmount > 0) {
      printContent += `<div class="flex justify-between text-[11px] text-gray-600"><span>Diskon:</span><span>-${formatCurrency(receiptData.discountAmount)}</span></div>`;
    }

    printContent += `
      <div class="flex justify-between font-bold text-[14px] mt-2 pt-2 border-t border-black">
        <span>TOTAL:</span><span>${formatCurrency(receiptData.totalAmount)}</span>
      </div>
    </div>`;

    printContent += `<div class="border-b border-black border-dashed mb-4 pb-3 space-y-1 text-[11px]">`;
    printContent += `<div class="flex justify-between text-gray-600"><span>Metode:</span><span class="font-bold">${receiptData.paymentMethod || 'Tunai'}</span></div>`;
    
    if (receiptData.paymentMethod === 'Tunai') {
       printContent += `<div class="flex justify-between text-gray-600"><span>Bayar:</span><span>${formatCurrency(receiptData.cashReceived || receiptData.totalAmount)}</span></div>`;
       printContent += `<div class="flex justify-between text-gray-600"><span>Kembali:</span><span>${formatCurrency(receiptData.change || 0)}</span></div>`;
    }
    printContent += `</div>`;

    printContent += `
      <div class="text-center text-[11px]">
        <p class="text-gray-600">Batas Pengembalian:</p>
        <p class="font-bold text-[13px] border border-black inline-block px-2 py-1 mt-1 mb-3">${formatDate(receiptData.expectedReturnDate)}</p>
        <p class="text-[9px] text-gray-500 italic mb-2">Note: Keterlambatan pengembalian<br/>akan dikenakan denda per hari.</p>
        <p class="font-bold text-[12px] mt-3">*** TERIMA KASIH ***</p>
      </div>
    `;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    
    iframe.contentWindow.document.open();
    iframe.contentWindow.document.write(`
      <html>
        <head>
          <title>Print Nota - 3 Berlian</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @page { margin: 0; }
            body { font-family: monospace; color: black; background: white; width: 80mm; padding: 10px; margin: 0 auto; }
          </style>
        </head>
        <body>
          ${printContent}
          <script>setTimeout(function() { window.print(); }, 800);</script>
        </body>
      </html>
    `);
    iframe.contentWindow.document.close();
    setTimeout(() => { if(document.body.contains(iframe)) document.body.removeChild(iframe); }, 15000);
  };

  const handleDownloadPDF = async () => {
    setIsExporting('pdf');
    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      
      let pdfHeight = 115 + (receiptData.items.length * 12);
      if (receiptData.customerPhone) pdfHeight += 4;
      if (receiptData.customerAddress) pdfHeight += 8;
      if (receiptData.discountAmount > 0) pdfHeight += 8;
      if (receiptData.paymentMethod === 'Tunai') pdfHeight += 8;

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, Math.max(150, pdfHeight)] });
      
      let y = 10;
      const left = 5;
      const right = 75;
      const center = 40;

      doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.text("3 BERLIAN", center, y, { align: "center" }); y += 4;
      doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text("SANGGAR SENI & RENTAL BAJU ADAT", center, y, { align: "center" }); y += 4;
      doc.setFontSize(7); doc.text("BTN Tiga Berlian, Watang Sawitto", center, y, { align: "center" }); y += 3;
      doc.text("Kabupaten Pinrang - Telp: 0813-4353-1375", center, y, { align: "center" }); y += 5;

      const drawDashedLine = (yPos) => {
        doc.setLineDashPattern([1, 1], 0); doc.line(left, yPos, right, yPos); doc.setLineDashPattern([], 0); 
      };

      drawDashedLine(y); y += 4;

      doc.text(`No. Nota : ${receiptData.id}`, left, y); y += 4;
      doc.text(`Tanggal  : ${formatDate(receiptData.rentDate)}`, left, y); y += 4;
      doc.text(`Pelanggan: ${receiptData.customerName}`, left, y); y += 4;
      if(receiptData.customerPhone) { doc.text(`No. WA   : ${receiptData.customerPhone}`, left, y); y += 4; }
      if(receiptData.customerAddress) { 
        const splitAlamat = doc.splitTextToSize(`Alamat   : ${receiptData.customerAddress}`, right - left);
        doc.text(splitAlamat, left, y); y += (splitAlamat.length * 3) + 1;
      }
      
      drawDashedLine(y); y += 4;
      doc.setFont("helvetica", "bold"); doc.text("Item Disewa:", left, y); y += 4; doc.setFont("helvetica", "normal");
      
      receiptData.items.forEach(item => {
          const splitName = doc.splitTextToSize(item.product.name, right - left);
          doc.text(splitName, left, y); y += (splitName.length * 3) + 1;
          const qtyPrice = `${item.qty} x ${formatNumberDot(item.product.rentPrice)}`;
          const total = formatNumberDot(item.qty * item.product.rentPrice);
          doc.text(qtyPrice, left + 2, y); doc.text(total, right, y, { align: "right" }); y += 4;
      });

      drawDashedLine(y); y += 4;
      
      doc.text("Subtotal:", left, y); doc.text(formatCurrency(receiptData.subTotal || receiptData.totalAmount), right, y, { align: "right" }); y += 4;
      
      if (receiptData.discountAmount > 0) {
        doc.text("Diskon:", left, y); doc.text(`-${formatCurrency(receiptData.discountAmount)}`, right, y, { align: "right" }); y += 4;
      }

      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      doc.text("TOTAL:", left, y); doc.text(formatCurrency(receiptData.totalAmount), right, y, { align: "right" }); y += 5;
      doc.setFont("helvetica", "normal"); doc.setFontSize(7);

      drawDashedLine(y); y += 4;
      
      doc.text(`Metode: ${receiptData.paymentMethod || 'Tunai'}`, left, y); y += 4;
      if (receiptData.paymentMethod === 'Tunai') {
         doc.text("Bayar:", left, y); doc.text(formatCurrency(receiptData.cashReceived || receiptData.totalAmount), right, y, { align: "right" }); y += 4;
         doc.text("Kembali:", left, y); doc.text(formatCurrency(receiptData.change || 0), right, y, { align: "right" }); y += 4;
      }
      
      drawDashedLine(y); y += 4;

      doc.text("Batas Pengembalian:", center, y, { align: "center" }); y += 4;
      doc.setFont("helvetica", "bold"); doc.setFontSize(9);
      const returnDateText = formatDate(receiptData.expectedReturnDate);
      const textWidth = doc.getTextWidth(returnDateText);
      doc.rect(center - (textWidth/2) - 2, y - 3.5, textWidth + 4, 5);
      doc.text(returnDateText, center, y, { align: "center" }); y += 6;
      
      doc.setFont("helvetica", "italic"); doc.setFontSize(6);
      doc.text("Note: Keterlambatan pengembalian", center, y, { align: "center" }); y += 3;
      doc.text("akan dikenakan denda per hari.", center, y, { align: "center" }); y += 5;
      
      doc.setFont("helvetica", "bold"); doc.setFontSize(8);
      doc.text("*** TERIMA KASIH ***", center, y, { align: "center" });

      doc.save(`Nota-${receiptData.id}.pdf`);
    } catch (error) {
      console.error(error);
      alert("Gagal memuat sistem PDF. Pastikan koneksi internet stabil.");
    } finally {
      setIsExporting('');
    }
  };

  const handleSendWA = () => {
    let phoneNo = receiptData.customerPhone || '';
    if (phoneNo.startsWith('0')) { phoneNo = '62' + phoneNo.substring(1); }
    const phoneQuery = phoneNo ? `phone=${phoneNo}&` : '';

    let text = `*NOTA PENYEWAAN - SANGGAR SENI 3 BERLIAN*\n------------------------------------------\n`;
    text += `ID Nota: ${receiptData.id}\nTanggal: ${formatDate(receiptData.rentDate)}\nPelanggan: ${receiptData.customerName}\n`;
    if (receiptData.customerAddress) text += `Alamat: ${receiptData.customerAddress}\n`;
    text += `\n*Daftar Item:*\n`;
    receiptData.items.forEach(item => { text += `- ${item.qty}x ${item.product.name}\n  (${formatCurrency(item.product.rentPrice)} / item)\n`; });
    
    if (receiptData.discountAmount > 0) text += `\n*Diskon: -${formatCurrency(receiptData.discountAmount)}*`;
    
    text += `\n*Total Tagihan: ${formatCurrency(receiptData.totalAmount)}*\n------------------------------------------\n`;
    text += `Harap dikembalikan sebelum: ${formatDate(receiptData.expectedReturnDate)}\n(Denda keterlambatan berlaku)\nTerima kasih!`;
    window.open(`https://api.whatsapp.com/send?${phoneQuery}text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-gray-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95">
        <div className="p-4 bg-gray-50 flex justify-between items-center border-b border-gray-100">
          <h3 className="font-bold text-gray-800 flex items-center gap-2"><Printer size={18}/> Bagikan Nota</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 bg-white shadow-sm p-1.5 rounded-full transition-colors active:scale-95"><X size={18}/></button>
        </div>
        
        {/* Tampilan Visual (Preview) Nota UI Saja */}
        <div className="overflow-y-auto p-6 bg-gray-200 flex justify-center w-full shadow-inner">
          <div className="bg-white p-6 w-full max-w-[300px] shadow-sm text-black font-mono leading-tight">
            <div className="text-center mb-4 border-b border-black pb-4 border-dashed">
              <h2 className="font-bold text-[18px] mb-1">3 BERLIAN</h2>
              <p className="text-[11px] font-semibold">SANGGAR SENI & RENTAL BAJU ADAT</p>
              <p className="text-[10px] mt-1">BTN Tiga Berlian, Watang Sawitto<br/>Kabupaten Pinrang</p>
              <p className="text-[10px] mt-1">Telp: 0813-4353-1375</p>
            </div>
            <div className="border-b border-black border-dashed mb-3 pb-3 text-[11px] space-y-1">
              <div className="flex justify-between"><span className="text-gray-600">No. Nota:</span><span className="font-bold">{receiptData.id}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Tanggal:</span><span>{formatDate(receiptData.rentDate)}</span></div>
              <div className="flex justify-between items-start"><span className="text-gray-600">Pelanggan:</span><span className="font-bold uppercase text-right w-2/3">{receiptData.customerName}</span></div>
              {receiptData.customerPhone && <div className="flex justify-between"><span className="text-gray-600">No. WA:</span><span>{receiptData.customerPhone}</span></div>}
            </div>
            <div className="border-b border-black border-dashed mb-3 pb-3 text-[11px]">
              <p className="font-bold mb-2">Item Disewa:</p>
              {receiptData.items.map((item, idx) => (
                <div key={idx} className="mb-2">
                  <div className="font-semibold leading-snug truncate">{item.product.name}</div>
                  <div className="flex justify-between mt-1 text-gray-700">
                    <span>{item.qty} x {formatCurrency(item.product.rentPrice).replace('Rp', '')}</span>
                    <span className="font-bold">{formatCurrency(item.qty * item.product.rentPrice).replace('Rp', '')}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-b border-black border-dashed mb-3 pb-3 text-[11px] space-y-1">
              <div className="flex justify-between text-gray-600"><span>Subtotal:</span><span>{formatCurrency(receiptData.subTotal || receiptData.totalAmount)}</span></div>
              {receiptData.discountAmount > 0 && <div className="flex justify-between text-green-700 font-bold"><span>Diskon:</span><span>-{formatCurrency(receiptData.discountAmount)}</span></div>}
              <div className="flex justify-between font-black text-[14px] pt-2 mt-2 border-t border-gray-200">
                <span>TOTAL:</span><span>{formatCurrency(receiptData.totalAmount)}</span>
              </div>
            </div>
            <div className="border-b border-black border-dashed mb-4 pb-3 text-[11px] space-y-1">
              <div className="flex justify-between text-gray-600"><span>Metode:</span><span className="font-bold text-gray-800">{receiptData.paymentMethod || 'Tunai'}</span></div>
              {receiptData.paymentMethod === 'Tunai' && (
                <>
                  <div className="flex justify-between text-gray-600"><span>Bayar:</span><span>{formatCurrency(receiptData.cashReceived || receiptData.totalAmount)}</span></div>
                  <div className="flex justify-between text-gray-600"><span>Kembali:</span><span className="font-bold">{formatCurrency(receiptData.change || 0)}</span></div>
                </>
              )}
            </div>
            <div className="text-center text-[11px]">
              <p className="text-gray-600">Batas Pengembalian:</p>
              <p className="font-bold text-[13px] border border-black inline-block px-2 py-1 mt-1 mb-3">{formatDate(receiptData.expectedReturnDate)}</p>
              <p className="text-[9px] text-gray-500 italic mb-2">Note: Keterlambatan pengembalian<br/>akan dikenakan denda per hari.</p>
              <p className="font-bold text-[12px] mt-3">*** TERIMA KASIH ***</p>
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border-t flex flex-wrap gap-2.5 justify-center">
           <button onClick={handlePrint} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-gray-800 text-white text-sm font-bold rounded-2xl hover:bg-gray-900 transition-transform active:scale-95 shadow-md"><Printer size={16}/> Print</button>
           <button onClick={handleDownloadPDF} disabled={isExporting !== ''} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-red-600 disabled:bg-gray-400 text-white text-sm font-bold rounded-2xl hover:bg-red-700 transition-transform active:scale-95 shadow-md">
              {isExporting === 'pdf' ? <Cloud size={16} className="animate-pulse" /> : <Download size={16}/>} PDF
           </button>
           <button onClick={handleSendWA} className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-emerald-600 text-white text-sm font-bold rounded-2xl hover:bg-emerald-700 transition-transform active:scale-95 shadow-md w-full"><MessageCircle size={18}/> Kirim ke WhatsApp</button>
        </div>
      </div>
    </div>
  );
}