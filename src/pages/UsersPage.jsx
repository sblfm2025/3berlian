import { useState } from 'react';
import { ShieldCheck, UserCog, X } from 'lucide-react';

const roleLabel = {
  admin: 'Admin',
  cashier: 'Kasir'
};

const roleDescription = {
  admin: 'Akses penuh untuk produk, laporan, dan pengaturan pengguna.',
  cashier: 'Akses transaksi sewa, pengembalian, dan data pelanggan.'
};

export default function UsersPage({ usersList, onUpdateUser }) {
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
    <div className="max-w-5xl mx-auto space-y-5">
      <div className="brand-gradient hidden rounded-[24px] p-4 text-white shadow-soft md:block md:p-5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">Ringkasan akses</p>
        <p className="mt-2 max-w-2xl text-sm font-semibold text-white/90">
          {usersList.length} akun terdaftar. Pastikan setiap karyawan memakai akun sesuai tugas operasionalnya.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {usersList.map(user => (
          <div key={user.id} className="rounded-[18px] border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-blue-50 text-blue-800">
                  <UserCog size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 sm:text-base">{user.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{formData.username && editingUser?.id === user.id ? formData.username : user.username}</p>
                </div>
              </div>
              <span className={`rounded-full px-3 py-1 text-[11px] font-bold ${user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                {roleLabel[user.role] || user.role}
              </span>
            </div>

            <div className="mt-4 rounded-[18px] bg-slate-50 px-4 py-3">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="mt-0.5 text-emerald-600" />
                <p className="text-sm text-slate-600">{roleDescription[user.role] || 'Akses aplikasi operasional.'}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openEdit(user)}
              className="mt-4 w-full rounded-[16px] bg-blue-800 py-3 text-sm font-bold text-white shadow-sm active:scale-95 transition"
            >
              Ubah Akses Akun
            </button>
          </div>
        ))}
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-t-[22px] sm:rounded-[24px] w-full max-w-sm overflow-hidden shadow-xl">
            <div className="p-4 sm:p-5 bg-blue-900 text-white flex justify-between items-center border-b border-blue-800">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-100 sm:text-[11px] sm:tracking-[0.18em]">Akses akun</p>
                <h3 className="mt-1 text-base font-bold sm:text-lg">{editingUser.name}</h3>
              </div>
              <button type="button" onClick={() => setEditingUser(null)} className="p-2 bg-blue-800 rounded-full hover:bg-blue-700 transition-colors">
                <X size={18}/>
              </button>
            </div>
            <form onSubmit={handleSave} className="p-3 space-y-3 bg-slate-50 sm:p-5 sm:space-y-4">
              <div className="bg-white p-4 rounded-[18px] border border-slate-100 shadow-sm">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.18em] mb-2">Nama pengguna</label>
                <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full border border-slate-200 rounded-[14px] px-4 py-3 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-400" />
              </div>
              <div className="bg-white p-4 rounded-[18px] border border-slate-100 shadow-sm">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.18em] mb-2">Password baru</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border border-slate-200 rounded-[14px] px-4 py-3 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-400" />
              </div>
              <div className="bg-white p-4 rounded-[18px] border border-slate-100 shadow-sm">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.18em] mb-2">Email pemulihan</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border border-slate-200 rounded-[14px] px-4 py-3 text-sm font-bold bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-400" />
              </div>
              <button type="submit" className="w-full bg-blue-800 hover:bg-blue-900 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-[16px] font-semibold shadow-md active:scale-95 transition">
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
