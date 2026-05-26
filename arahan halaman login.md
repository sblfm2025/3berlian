Berikut arahan khusus untuk VS/Codex agar **load Firebase di halaman login kembali cepat**.

````md
# ARAHAN FIX LOAD FIREBASE LOGIN — POS 3 BERLIAN

## MASALAH

Setelah update, halaman login terasa jauh lebih lama karena aplikasi langsung menjalankan `listenToAppData()` setelah Firebase auth siap.

Saat ini `listenToAppData()` membuka listener realtime untuk:

- products
- customers
- transactions
- users

Padahal saat berada di halaman login, aplikasi hanya membutuhkan data `users` untuk validasi login.

Akibatnya halaman login menunggu data operasional yang berat, terutama `products` dan `transactions`.

## TUJUAN FIX

Pisahkan loading menjadi 2 tahap:

1. **Login stage**
   - hanya load Firebase auth
   - hanya load users
   - form login tampil secepat mungkin

2. **App stage**
   - setelah login berhasil
   - baru load products, customers, transactions
   - dashboard/POS boleh tampil dengan skeleton loading sementara

## FILE YANG DIUBAH

- `src/services/firestoreData.js`
- `src/App.jsx`
- opsional: `src/components/auth/LoginScreen.jsx`

---

# 1. TAMBAHKAN LISTENER KHUSUS USERS

Di `src/services/firestoreData.js`, tambahkan fungsi baru:

```js
export const listenToAppUsers = ({ onUsers, onError }) => {
  const unsubUsers = onSnapshot(
    dataCollection('users'),
    (snap) => onUsers(snap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }))),
    (error) => onError?.('users', error)
  );

  return () => unsubUsers();
};
````

Jangan hapus `listenToAppData()` karena tetap dipakai setelah login.

---

# 2. PISAHKAN STATE LOADING DI APP.JSX

Di `src/App.jsx`, ubah state loading menjadi terpisah:

```js
const [isLoginDataLoaded, setIsLoginDataLoaded] = useState(false);
const [isAppDataLoaded, setIsAppDataLoaded] = useState(false);
const [loginLoadingMessage, setLoginLoadingMessage] = useState('Menyiapkan halaman login...');
const [appLoadingMessage, setAppLoadingMessage] = useState('Memuat data aplikasi...');
```

Jangan lagi memakai satu `isDataLoaded` untuk semua kebutuhan.

---

# 3. LOAD USERS SAJA SEBELUM LOGIN

Buat `useEffect` khusus untuk login data.

```js
useEffect(() => {
  if (!db || !firebaseUser || user) return;

  setLoginLoadingMessage('Memuat data pengguna...');

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
}, [firebaseUser, user]);
```

Catatan:

* listener users hanya aktif sebelum login
* setelah `user` terisi, listener ini berhenti

---

# 4. LOAD DATA APP SETELAH LOGIN

Buat `useEffect` kedua khusus data operasional.

```js
useEffect(() => {
  if (!db || !firebaseUser || !user) return;

  setIsAppDataLoaded(false);
  setAppLoadingMessage('Memuat data produk, pelanggan, dan transaksi...');

  const slowConnectionNotice = window.setTimeout(() => {
    setAppLoadingMessage('Data masih dimuat. Koneksi sedang lebih lambat dari biasanya...');
  }, 12000);

  const loadingTimeout = window.setTimeout(() => {
    setDataLoadError('Sebagian data aplikasi belum berhasil dimuat. Anda masih dapat mencoba memuat ulang aplikasi.');
    setIsAppDataLoaded(true);
  }, 45000);

  let loaded = {
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
    onUsers: (items) => {
      setAppUsers(items);
      markCollectionLoaded('users');
    },
    onError: (collectionName, error) => {
      console.error(`Error fetching ${collectionName}:`, error);
      setDataLoadError(`Data ${collectionName} belum bisa dibaca. Periksa koneksi lalu coba lagi.`);
      markCollectionLoaded(collectionName);
    }
  });

  return () => {
    window.clearTimeout(slowConnectionNotice);
    window.clearTimeout(loadingTimeout);
    unsubscribeData();
  };
}, [firebaseUser, user]);
```

---

# 5. UBAH RENDER LOGIN

Sebelum login, tampilkan `LoginScreen` secepat mungkin.

```jsx
if (!user) {
  return (
    <LoginScreen
      users={appUsers}
      isDataLoaded={isLoginDataLoaded}
      loadingMessage={loginLoadingMessage}
      dataLoadError={dataLoadError}
      onLoginSuccess={handleLoginSuccess}
      onSeedInit={handleSeedInit}
      onStartDemoMode={handleStartDemoMode}
      isDemoMode={isDemoMode}
    />
  );
}
```

Jangan tunggu `products`, `customers`, atau `transactions` untuk menampilkan login.

---

# 6. TAMPILKAN SKELETON SETELAH LOGIN

Setelah login, jika `isAppDataLoaded === false`, jangan tampilkan loading fullscreen lama.

Tetap tampilkan `AppShell`, lalu di area konten tampilkan skeleton.

Contoh:

```jsx
<AppShell ...>
  {!isAppDataLoaded && (
    <DashboardSkeleton message={appLoadingMessage} />
  )}

  {isAppDataLoaded && currentView === 'dashboard' && (
    <DashboardPage ... />
  )}
</AppShell>
```

Untuk halaman `rent`, boleh tampilkan skeleton katalog/keranjang.

---

# 7. CEGAH LISTENER DOBEL

Pastikan:

* `listenToAppUsers()` hanya berjalan sebelum login
* `listenToAppData()` hanya berjalan setelah login
* ketika logout, data app boleh dikosongkan

Tambahkan saat logout:

```js
const handleLogout = () => {
  setUser(null);
  setProducts([]);
  setCustomers([]);
  setTransactions([]);
  setIsAppDataLoaded(false);
};
```

Lalu gunakan:

```jsx
onLogout={handleLogout}
```

---

# 8. TARGET HASIL

Setelah fix:

* halaman login muncul lebih cepat
* form login tidak menunggu semua data aplikasi
* Firebase tetap realtime setelah login
* dashboard boleh loading dengan skeleton
* tidak ada listener dobel
* tidak ada data produk/transaksi dimuat sebelum login

## TARGET UX

Ideal:

* 0–1 detik: logo dan form login tampil
* 1–3 detik: data users siap
* setelah login: AppShell tampil
* data dashboard/POS dimuat bertahap dengan skeleton

```

Intinya: **jangan panggil `listenToAppData()` sebelum user benar-benar login**. Saat login cukup ambil `users`, setelah login baru ambil data operasional.
::contentReference[oaicite:0]{index=0}
```
Arahan lanjutan selain pemisahan login/app data:

````md
# ARAHAN LANJUTAN OPTIMASI LOAD FIREBASE — POS 3 BERLIAN

## 1. Jangan load semua koleksi sekaligus setelah login

Setelah login, prioritaskan:

1. users
2. products
3. customers
4. transactions

Dashboard tidak harus menunggu semua transaksi selesai dimuat.

---

## 2. Batasi transaksi awal

Jangan ambil semua `transactions` dari awal.

Ambil dulu transaksi terbaru saja:

```js
query(
  dataCollection('transactions'),
  orderBy('createdAt', 'desc'),
  limit(100)
)
````

Untuk laporan, baru ambil data berdasarkan filter tanggal.

---

## 3. Pisahkan listener realtime dan fetch biasa

Gunakan realtime listener hanya untuk data yang sering berubah:

Realtime:

* products
* active transactions
* users

Fetch biasa:

* reports
* historical transactions
* analytics lama

---

## 4. Jangan semua halaman menerima semua data

Saat ini kemungkinan banyak page menerima `products`, `customers`, dan `transactions` sekaligus.

Ubah agar page hanya menerima data yang dibutuhkan.

Contoh:

* Login: users
* Sewa: products + customers
* Dashboard: summary + recent transactions
* Laporan: transactions by date range

---

## 5. Tambahkan cache local

Simpan data ringan ke `localStorage` agar UI tidak kosong saat reload.

Contoh:

* last logged user
* product categories
* recent products
* app branding

Saat Firebase belum selesai, tampilkan cache dulu.

---

## 6. Gunakan skeleton, bukan blocking loading

Jangan tampilkan loading fullscreen lama.

Gunakan:

* skeleton dashboard
* skeleton product card
* skeleton table row
* skeleton cart

---

## 7. Tambahkan indikator koneksi lambat

Jika load > 8 detik:

```txt
Koneksi sedang lambat, data masih dimuat...
```

Jika > 20 detik:

```txt
Data belum berhasil dimuat. Coba muat ulang.
```

---

## 8. Tambahkan fallback demo/local mode

Jika Firebase gagal:

* login tetap bisa masuk demo mode
* tampilkan data sample lokal
* beri badge “Mode Demo / Offline”

---

## 9. Optimasi import Firebase

Pastikan hanya import modular Firebase yang dipakai.

Jangan import semua Firebase SDK.

---

## 10. Audit ukuran bundle

Jalankan:

```bash
npm run build
```

Cek apakah bundle terlalu besar.

Tambahkan lazy import untuk:

* reports
* charts
* export PDF/Excel
* receipt modal

---

## 11. Lazy load halaman berat

Gunakan:

```js
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
```

Halaman yang wajib lazy:

* ReportsPage
* ProductsPage
* CustomersPage
* UsersPage

---

## 12. Hindari kalkulasi berat di render

Gunakan `useMemo` untuk:

* total omzet
* produk terlaris
* transaksi terlambat
* filter produk
* pagination
* dashboard stats

---

## 13. Tambahkan profiler sederhana

Catat waktu load:

```js
console.time('load-users');
console.timeEnd('load-users');

console.time('load-products');
console.timeEnd('load-products');

console.time('load-transactions');
console.timeEnd('load-transactions');
```

Ini membantu tahu koleksi mana yang lambat.

---

## TARGET HASIL

* Login tampil cepat
* Data tidak dimuat berlebihan
* Dashboard tidak blocking
* POS tetap bisa dipakai walau data lain belum lengkap
* Firebase lebih ringan
* UX terasa seperti aplikasi profesional

```
```
