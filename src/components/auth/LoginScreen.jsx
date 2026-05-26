import { useState } from 'react';
import { AlertCircle, Cloud, Key, Mail, UserCog } from 'lucide-react';

export default function LoginScreen({
  appUsers,
  dataLoadError,
  firebaseUser,
  isDataLoaded,
  isDemoMode,
  loadingMessage,
  onLoginSuccess,
  onSeedInit,
  onStartDemoMode
}) {
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const foundUser = appUsers.find(user => user.username === loginUsername && user.password === loginPassword);
    if (foundUser) {
      onLoginSuccess(foundUser);
      return;
    }

    alert('Username atau password salah!');
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    const foundUser = appUsers.find(user => user.email === forgotEmail);
    if (foundUser) {
      alert(`Instruksi pemulihan akun telah disiapkan untuk ${forgotEmail}.`);
      setShowForgotPwd(false);
      return;
    }

    alert('Email tidak terdaftar di sistem!');
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#eef5ff_0%,_#f8fafc_54%,_#fff9e8_100%)] flex items-center justify-center p-4 md:p-8 font-sans relative">
      <div className={`absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${firebaseUser ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
        <Cloud size={14} /> {firebaseUser ? 'Terhubung' : 'Menghubungkan'}
      </div>

      <div className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr] items-center">
        <div className="order-2 lg:order-1 rounded-[24px] bg-white border border-slate-200 p-5 md:p-8 shadow-[0_26px_70px_-38px_rgba(15,23,42,0.35)]">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.22em] text-blue-700">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> 3 Berlian POS
          </div>
          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-white shadow-lg border border-slate-100">
              <img src="/app-logo-192.png" alt="Logo 3 Berlian" className="h-10 w-10 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }}/>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">Sanggar Seni 3 Berlian</h1>
              <p className="text-sm font-semibold text-slate-500 mt-1">POS penyewaan kostum adat</p>
            </div>
          </div>
          <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed">
            Sistem kasir modern untuk penyewaan kostum adat, dengan ringkasan bisnis, pengembalian terstruktur, dan alur kerja cepat untuk karyawan.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[20px] bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Branding</p>
              <p className="mt-2 text-lg font-black text-slate-900">Biru & Emas</p>
            </div>
            <div className="rounded-[20px] bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Operasi</p>
              <p className="mt-2 text-lg font-black text-slate-900">POS cepat</p>
            </div>
            <div className="rounded-[20px] bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Alur kerja</p>
              <p className="mt-2 text-lg font-black text-slate-900">Pengembalian siap</p>
            </div>
          </div>

          <div className="mt-6 rounded-[20px] border border-amber-100 bg-amber-50/80 p-4 text-sm text-amber-900">
            <p className="font-bold">POS profesional untuk kasir & admin</p>
            <p className="mt-1 text-amber-900/80">Kelola penyewaan, inventaris, dan pengembalian dari satu aplikasi dengan identitas visual yang lebih premium.</p>
          </div>
        </div>

        <div className="order-1 lg:order-2 bg-white p-6 md:p-8 rounded-[24px] shadow-[0_30px_80px_-38px_rgba(15,23,42,0.35)] border border-slate-100 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[22px] bg-gradient-to-br from-blue-700 to-amber-400 text-white shadow-xl">
            <img
              src="/app-logo-192.png"
              alt="Logo"
              className="h-12 w-12 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900">Masuk ke Sistem</h2>
          <p className="mt-2 text-sm text-slate-500">Masuk untuk mengelola transaksi sewa dan pengembalian hari ini.</p>

          {!isDataLoaded ? (
            <div className="py-10 text-center">
              <div className="mx-auto h-10 w-10 rounded-full border-4 border-blue-100 border-t-blue-700 animate-spin" />
              <p className="mt-4 text-sm font-semibold text-slate-500">{loadingMessage}</p>
              <p className="mt-2 text-xs text-slate-400">Jika terlalu lama, periksa koneksi internet lalu muat ulang aplikasi.</p>
            </div>
          ) : dataLoadError ? (
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
          ) : appUsers.length === 0 ? (
            <div className="bg-amber-50 p-4 rounded-[20px] border border-amber-200 mt-6 text-left">
              <AlertCircle className="mx-auto text-amber-500 mb-2" />
              <p className="text-sm text-amber-800 mb-3">Data akun masih kosong. Buat akun awal untuk Admin dan Kasir.</p>
              <button onClick={onSeedInit} className="bg-amber-600 text-white px-4 py-3 rounded-[18px] text-sm font-bold w-full">
                Siapkan Akun Awal
              </button>
            </div>
          ) : !showForgotPwd ? (
            <form onSubmit={handleLoginSubmit} className="mt-6 space-y-4 text-left">
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
              <button type="submit" className="w-full bg-blue-800 hover:bg-blue-900 text-white py-3 rounded-[16px] font-bold transition shadow-[0_20px_40px_-24px_rgba(30,64,175,0.9)]">
                Masuk ke Sistem
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => setShowForgotPwd(true)} className="text-xs text-blue-600 hover:underline font-semibold">Lupa Password?</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleForgotSubmit} className="mt-6 space-y-4 text-left animate-in fade-in">
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
      </div>
    </div>
  );
}
