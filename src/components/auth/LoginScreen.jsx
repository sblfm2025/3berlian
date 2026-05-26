import { useState } from 'react';
import { AlertCircle, BarChart3, Cloud, Key, Mail, PackageCheck, RotateCcw, Shirt, ShoppingBag, UserCog } from 'lucide-react';

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
    <div className="min-h-screen bg-[linear-gradient(135deg,_#e9f6fb_0%,_#d8edf4_45%,_#f8fafc_100%)] flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="grid w-full max-w-5xl items-center gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="overflow-hidden rounded-[30px] bg-white shadow-[0_30px_90px_-42px_rgba(13,71,161,0.65)]">
          <div className="relative bg-[#1688d8] px-6 pb-14 pt-7 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-white shadow-lg">
                  <img src="/app-logo-192.png" alt="Logo 3 Berlian" className="h-10 w-10 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <div>
                  <h1 className="text-xl font-black text-white">3 Berlian POS</h1>
                  <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-50">Rental Kostum</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${firebaseUser ? 'bg-white/15 text-white' : 'bg-white/10 text-blue-50'}`}>
                <Cloud size={14} /> {firebaseUser ? 'Online' : 'Sync'}
              </div>
            </div>

            <div className="mt-8 flex items-end justify-center gap-5">
              <div className="flex h-32 w-28 rotate-[-5deg] flex-col justify-end rounded-[28px] bg-blue-950/30 p-4 shadow-inner">
                <Shirt size={46} className="mx-auto text-amber-300" />
                <div className="mt-4 h-2 rounded-full bg-white/30" />
                <div className="mt-2 h-2 w-16 rounded-full bg-white/20" />
              </div>
              <div className="mb-3 flex h-24 w-24 rotate-[7deg] items-center justify-center rounded-full bg-amber-300 text-blue-900 shadow-xl">
                <PackageCheck size={48} strokeWidth={2.2} />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-[-1px] h-12 rounded-t-[50%] bg-white" />
          </div>

          <div className="px-6 pb-7 pt-2">
            <div className="mx-auto mb-5 grid max-w-sm grid-cols-4 gap-3 rounded-[24px] border border-slate-100 bg-white p-4 shadow-[0_20px_50px_-36px_rgba(15,23,42,0.45)]">
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
                  <input type="text" required value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-[16px] bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none text-sm" placeholder="Masukkan username" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Key size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-[16px] bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none text-sm" placeholder="Masukkan password" />
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
                  <input type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-[16px] bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-300 outline-none text-sm" placeholder="email@contoh.com" />
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
          <div className="mx-auto max-w-sm overflow-hidden rounded-[32px] bg-slate-50 shadow-[0_34px_100px_-48px_rgba(15,23,42,0.85)] ring-1 ring-white">
            <div className="bg-[#1688d8] px-6 pb-20 pt-7 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-50">Status Hari Ini</p>
                  <p className="mt-2 text-2xl font-black">POS Kostum Aktif</p>
                </div>
                <img src="/app-logo-192.png" alt="Logo" className="h-12 w-12 rounded-2xl bg-white p-2" />
              </div>
              <div className="mt-7 rounded-[20px] bg-blue-900/18 p-4 shadow-inner">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-blue-50/80">Transaksi</p>
                    <p className="mt-1 text-lg font-black">Cepat</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-50/80">Inventaris</p>
                    <p className="mt-1 text-lg font-black">Realtime</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="-mt-12 mx-5 rounded-[26px] bg-white p-5 shadow-[0_20px_55px_-32px_rgba(15,23,42,0.55)]">
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
            <div className="p-5">
              <p className="text-sm font-black text-blue-800">Prioritas Kerja</p>
              <div className="mt-3 space-y-3">
                {['Cek pengembalian hari ini', 'Pantau stok menipis', 'Cetak nota pelanggan'].map((item) => (
                  <div key={item} className="rounded-[20px] bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
