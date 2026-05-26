import { CalendarDays, FileText, Mic2, Music2, Package, Sparkles, UserCog, Users } from 'lucide-react';

const futureModules = [
  {
    title: 'Services',
    description: 'MC, tari, penyanyi, musik tradisional, dan jasa pendukung acara.',
    icon: Mic2
  },
  {
    title: 'Events',
    description: 'Inquiry, quotation, booking, jadwal tampil, dan laporan acara.',
    icon: CalendarDays
  },
  {
    title: 'Talents',
    description: 'Data dancer, MC, singer, musician, crew, rate, dan availability.',
    icon: Users
  },
  {
    title: 'Packages',
    description: 'Paket wedding, welcoming, cultural performance, dan paket custom.',
    icon: Package
  },
  {
    title: 'Finance',
    description: 'DP, pelunasan, biaya talent, dan laporan keuangan multi-layanan.',
    icon: Music2
  }
];

export default function MenuPage({ onNavigate, role }) {
  const activeModules = [
    { title: 'Produk', description: 'Kelola inventaris kostum, stok, harga sewa, dan denda.', icon: Package, target: 'products', roles: ['admin'] },
    { title: 'Pelanggan', description: 'Lihat data pelanggan, riwayat kunjungan, deposit, dan identitas.', icon: Users, target: 'customers', roles: ['admin', 'cashier'] },
    { title: 'Laporan', description: 'Rekap transaksi, omzet, pembayaran, dan export laporan.', icon: FileText, target: 'reports', roles: ['admin'] },
    { title: 'Pengguna', description: 'Kelola akses admin dan kasir.', icon: UserCog, target: 'users', roles: ['admin'] }
  ].filter(item => item.roles.includes(role));

  return (
    <div className="mx-auto max-w-7xl space-y-3 sm:space-y-4">
      <div className="hidden rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm md:block md:p-5">
        <p className="text-sm font-semibold text-slate-500">Pusat modul</p>
        <h2 className="mt-1 text-lg font-bold text-slate-900 sm:text-2xl sm:font-black">Menu operasional dan roadmap sanggar</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Modul aktif tetap fokus pada rental, sementara slot layanan sanggar disiapkan agar ekspansi tidak mengganggu transaksi lama.
        </p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Modul aktif</p>
            <h3 className="mt-1 text-base font-bold text-slate-900">Operasional saat ini</h3>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">{activeModules.length} modul</span>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {activeModules.map(module => {
            const Icon = module.icon;
            return (
              <button
                key={module.target}
                type="button"
                onClick={() => onNavigate(module.target)}
                className="rounded-2xl border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50 sm:p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                    <Icon size={20} />
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">Aktif</span>
                </div>
                <p className="mt-3 text-sm font-bold text-slate-900">{module.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{module.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Roadmap multi-service</p>
          <h3 className="mt-1 text-base font-bold text-slate-900">Slot ekspansi berikutnya</h3>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
          {futureModules.map(module => {
            const Icon = module.icon;
            return (
              <div key={module.title} className="rounded-2xl border border-dashed border-slate-200 bg-white/80 p-3 shadow-sm sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Icon size={20} />
                  </span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">Disiapkan</span>
                </div>
                <p className="mt-3 text-sm font-bold text-slate-900">{module.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{module.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900 sm:p-4">
        <div className="flex gap-3">
          <Sparkles size={18} className="mt-0.5 shrink-0 text-blue-700" />
          <div>
            <p className="font-bold">Belum ada schema produksi baru.</p>
            <p className="mt-1 text-xs leading-relaxed sm:text-sm">
              Slot ini hanya menyiapkan navigasi dan arah produk. Implementasi order/service/talent tetap perlu migrasi data dan desain collection terpisah.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
