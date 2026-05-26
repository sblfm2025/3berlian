import { useState } from 'react';
import { AlertCircle, BarChart3, Cloud, Key, Mail, RotateCcw, Shirt, ShoppingBag, UserCog } from 'lucide-react';

export default function LoginScreen({
  appUsers,
  dataLoadError,
  firebaseUser,
  isDataLoaded,
  isDemoMode,
  loadingMessage,
  onLoginSuccess,
  onNotify,
  onSeedInit,
  onStartDemoMode
}) {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!isDataLoaded) {
      onNotify?.({ title: 'Data akun masih dimuat', message: 'Tunggu sebentar lalu coba lagi.', type: 'info' });
      return;
    }

    const foundUser = appUsers.find(user => user.username === loginUsername && user.password === loginPassword);
    if (foundUser) {
      onLoginSuccess(foundUser);
      return;
    }

    onNotify?.({ title: 'Login gagal', message: 'Username atau password salah.', type: 'error' });
  };

  const quickMenus = [
    { label: 'Sewa', icon: ShoppingBag },
    { label: 'Kembali', icon: RotateCcw },
    { label: 'Produk', icon: Shirt },
    { label: 'Laporan', icon: BarChart3 }
  ];

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!isDataLoaded) {
      onNotify?.({ title: 'Data akun masih dimuat', message: 'Tunggu sebentar lalu coba lagi.', type: 'info' });
      return;
    }

    const foundUser = appUsers.find(user => user.email === forgotEmail);
    if (foundUser) {
      onNotify?.({ title: 'Pemulihan akun', message: `Instruksi pemulihan akun telah disiapkan untuk ${forgotEmail}.`, type: 'success' });
      setShowForgotPwd(false);
      return;
    }

    onNotify?.({ title: 'Email tidak ditemukan', message: 'Email tidak terdaftar di sistem.', type: 'error' });
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[linear-gradient(135deg,_#e9f6fb_0%,_#d8edf4_45%,_#f8fafc_100%)] p-3 font-sans sm:p-4 md:p-8">
      <div className="grid w-full max-w-[390px] items-center gap-6 lg:max-w-5xl lg:grid-cols-[0.95fr_1.05fr]">
        <section className="overflow-hidden rounded-[30px] bg-white shadow-[0_30px_90px_-42px_rgba(13,71,161,0.65)]">
          <div className="relative bg-[#1688d8] px-5 pb-5 pt-6 text-white sm:px-6 sm:pt-7">
            <div className="relative z-20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white shadow-lg sm:h-14 sm:w-14 sm:rounded-[20px]">
                  <img src="/app-logo-192.png" alt="Logo 3 Berlian" className="h-9 w-9 object-contain sm:h-10 sm:w-10" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <div>
                  <h1 className="text-lg font-black text-white sm:text-xl">3 Berlian POS</h1>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-50">Rental Kostum</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${firebaseUser ? 'bg-white/15 text-white' : 'bg-white/10 text-blue-50'}`}>
                <Cloud size={14} /> {firebaseUser ? 'Online' : 'Sync'}
              </div>
            </div>

            <div className="relative z-20 mx-auto mt-3 flex h-[142px] max-w-[300px] items-end justify-center sm:h-[164px] sm:max-w-[330px]">
              <img
                src="/kartun3berlian.png"
                alt="Ilustrasi 3 Berlian POS"
                className="h-full w-full object-contain drop-shadow-[0_22px_32px_rgba(8,47,111,0.3)]"
                decoding="async"
                loading="eager"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
            <div className="absolute inset-x-0 bottom-[-1px] z-10 h-14 rounded-t-[50%] bg-white sm:h-16" />
          </div>

          <div className="px-5 pb-6 pt-2 sm:px-6 sm:pb-7">
            <div className="mx-auto mb-5 grid max-w-sm grid-cols-4 gap-2 rounded-[24px] border border-slate-100 bg-white p-3 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.45)] sm:gap-3 sm:p-4">
              {quickMenus.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-700 sm:h-14 sm:w-14">
                      <Icon size={24} />
                    </div>
                    <p className="mt-2 text-[11px] font-bold text-slate-700">{item.label}</p>
                  </div>
                );
              })}
            </div>

            <div className="mx-auto max-w-sm text-center">
              <h2 className="text-2xl font-black text-slate-900">Masuk Sistem</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">Kelola penyewaan, pengembalian, dan stok kostum.</p>
            </div>

          {dataLoadError ? (
            <div className="bg-red-50 p-4 rounded-[20px] border border-red-200 mt-6 text-left">
              <AlertCircle className="mx-auto text-red-500 mb-2" />
              <p className="text-sm font-bold text-red-800">Sistem belum berhasil memuat data.</p>
              <p className="mt-2 text-sm text-red-700">{dataLoadError}</p>
              <p className="mt-2 text-xs text-red-700/80">Pastikan koneksi internet stabil, lalu coba lagi.</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-4 w-full rounded-[16px] bg-red-600 px-4 py-3 text-sm font-bold text-white"
              >
                Muat Ulang
              </button>
              <button
                type="button"
                onClick={onStartDemoMode}
                className="mt-3 w-full rounded-[16px] border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-700"
              >
                Gunakan Data Contoh
              </button>
            </div>
          ) : isDataLoaded && appUsers.length === 0 ? (
            <div className="bg-amber-50 p-4 rounded-[20px] border border-amber-200 mt-6 text-left">
              <AlertCircle className="mx-auto text-amber-500 mb-2" />
              <p className="text-sm text-amber-800 mb-3">Data akun masih kosong. Buat akun awal untuk Admin dan Kasir.</p>
              <button onClick={onSeedInit} className="bg-amber-600 text-white px-4 py-3 rounded-[18px] text-sm font-bold w-full">
                Siapkan Akun Awal
              </button>
            </div>
          ) : !showForgotPwd ? (
            <form onSubmit={handleLoginSubmit} className="mx-auto mt-6 max-w-sm space-y-4 text-left">
              {!isDataLoaded && (
                <div className="rounded-[18px] border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-blue-100 border-t-blue-700 animate-spin" />
                    <p className="font-bold">{loadingMessage}</p>
                  </div>
                </div>
              )}
              {isDemoMode && (
                <div className="rounded-[18px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  <p className="font-bold">Data contoh aktif</p>
                  <p className="mt-1 text-xs">Gunakan untuk mencoba tampilan saat data utama belum tersedia.</p>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                <div className="relative">
                  <UserCog size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" autoComplete="username" required value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-[16px] bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none text-sm" placeholder="Masukkan username" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="password" autoComplete="current-password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-[16px] bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none text-sm" placeholder="Masukkan password" />
                </div>
              </div>
              <button type="submit" disabled={!isDataLoaded} className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-[16px] font-bold transition shadow-[0_20px_40px_-24px_rgba(30,64,175,0.9)] disabled:cursor-not-allowed disabled:opacity-60">
                {isDataLoaded ? 'Masuk ke Sistem' : 'Menunggu Data Akun'}
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => setShowForgotPwd(true)} className="text-xs text-blue-600 hover:underline font-semibold">Lupa Password?</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit} className="mx-auto mt-6 max-w-sm space-y-4 text-left animate-in fade-in">
              <h3 className="font-bold text-slate-900 border-b pb-2">Reset Password</h3>
              <p className="text-xs text-slate-500">Masukkan email yang terdaftar pada akun Anda untuk menerima instruksi pemulihan.</p>
              <div>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" autoComplete="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-[16px] bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none text-sm" placeholder="email@contoh.com" />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForgotPwd(false)} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-[16px] font-bold">Batal</button>
                <button type="submit" className="flex-1 bg-amber-500 text-white py-3 rounded-[16px] font-bold">Kirim Link</button>
              </div>
            </form>
          )}
          </div>
        </section>

        <section className="hidden lg:block">
          <div className="mx-auto max-w-md overflow-hidden rounded-[34px] bg-white shadow-[0_34px_100px_-48px_rgba(15,23,42,0.85)] ring-1 ring-white">
            <div className="relative bg-[#1688d8] px-7 pb-8 pt-7 text-white">
              <div className="relative z-20 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-50">3 Berlian POS</p>
                  <p className="mt-2 text-2xl font-black">Rental kostum tertata</p>
                </div>
                <img src="/app-logo-192.png" alt="Logo" className="h-12 w-12 rounded-2xl bg-white p-2 shadow-lg" />
              </div>
              <div className="relative z-20 mx-auto mt-5 flex h-52 max-w-sm items-end justify-center">
                <img
                  src="/kartun3berlian.png"
                  alt="Ilustrasi 3 Berlian POS"
                  className="h-full w-full object-contain drop-shadow-[0_26px_38px_rgba(8,47,111,0.34)]"
                  decoding="async"
                  loading="eager"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="absolute inset-x-0 bottom-[-1px] z-10 h-16 rounded-t-[50%] bg-white" />
            </div>
            <div className="mx-6 -mt-1 rounded-[26px] border border-slate-100 bg-white p-5 shadow-[0_20px_55px_-36px_rgba(15,23,42,0.55)]">
              <p className="font-black text-blue-800">Menu Kilat</p>
              <div className="mt-4 grid grid-cols-4 gap-4">
                {quickMenus.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-700">
                        <Icon size={24} />
                      </div>
                      <p className="mt-2 text-[11px] font-bold text-slate-700">{item.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-3 p-6 pt-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[22px] bg-blue-50 px-4 py-3">
                  <p className="text-xs font-bold text-blue-700">Transaksi</p>
                  <p className="mt-1 text-lg font-black text-slate-900">Cepat</p>
                </div>
                <div className="rounded-[22px] bg-amber-50 px-4 py-3">
                  <p className="text-xs font-bold text-amber-700">Inventaris</p>
                  <p className="mt-1 text-lg font-black text-slate-900">Realtime</p>
                </div>
              </div>
              <div className="rounded-[24px] bg-slate-50 px-4 py-4">
                <p className="text-sm font-black text-blue-800">Prioritas kerja</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">Cek pengembalian, pantau stok, dan cetak nota dari satu alur kasir.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
