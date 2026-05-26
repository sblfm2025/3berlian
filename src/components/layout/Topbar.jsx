export default function Topbar({ currentDateLabel, currentPage, firebaseUser, user }) {
  return (
    <div className="hidden md:flex items-center justify-between gap-4 px-8 pt-6 pb-2">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{currentPage.eyebrow}</p>
        <h1 className="mt-2 text-2xl font-black text-slate-900">{currentPage.title}</h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl">{currentPage.subtitle}</p>
      </div>
      <div className="flex flex-wrap justify-end gap-3">
        <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Hari ini</p>
          <p className="mt-1 text-sm font-black text-slate-900">{currentDateLabel}</p>
        </div>
        <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">Kasir aktif</p>
          <p className="mt-1 text-sm font-black text-slate-900">{user.name}</p>
        </div>
        <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">Status sinkron</p>
          <p className="mt-1 text-sm font-black text-emerald-900">{firebaseUser ? 'Tersinkron' : 'Menunggu'}</p>
        </div>
      </div>
    </div>
  );
}
