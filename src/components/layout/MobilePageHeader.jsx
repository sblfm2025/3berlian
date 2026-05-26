export default function MobilePageHeader({ currentPage }) {
  return (
    <div className="md:hidden px-4 pt-3 pb-2">
      <div className="rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">{currentPage.eyebrow}</p>
        <h1 className="mt-1.5 text-lg font-black text-slate-950">{currentPage.title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{currentPage.subtitle}</p>
      </div>
    </div>
  );
}
