/**
 * Komponen LoadingSkeleton premium untuk memberikan feedback visual berkilau (shimmer)
 * yang responsif selama data dimuat dari Firestore.
 */
export default function LoadingSkeleton({ type = 'card', count = 4 }) {
  const items = Array.from({ length: count });

  if (type === 'kpi') {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 w-full">
        {items.map((_, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
            <div className="h-3 w-1/3 rounded-full skeleton" />
            <div className="h-6 w-2/3 rounded-md skeleton" />
            <div className="h-3 w-1/2 rounded-full skeleton" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="w-full bg-white rounded-[28px] border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 flex-1 rounded skeleton" />
          ))}
        </div>
        <div className="divide-y divide-slate-100 p-4 space-y-4">
          {items.map((_, idx) => (
            <div key={idx} className="flex gap-4 items-center">
              <div className="h-12 w-12 rounded-xl skeleton shrink-0" />
              <div className="h-4 flex-1 rounded skeleton" />
              <div className="h-4 w-24 rounded skeleton" />
              <div className="h-4 w-16 rounded skeleton" />
              <div className="h-4 w-28 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3 w-full">
        {items.map((_, idx) => (
          <div key={idx} className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-150 shadow-sm gap-3">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="h-3 w-1/3 rounded-full skeleton" />
              <div className="h-3.5 w-1/2 rounded-full skeleton" />
            </div>
            <div className="h-6 w-16 rounded-full skeleton shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  // Default: type === 'card'
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
      {items.map((_, idx) => (
        <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="h-40 w-full rounded-xl skeleton" />
          <div className="space-y-2 mt-2">
            <div className="h-4 w-2/3 rounded-full skeleton" />
            <div className="h-3 w-1/2 rounded-full skeleton" />
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
            <div className="h-5 w-20 rounded skeleton" />
            <div className="h-8 w-12 rounded-lg skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
}
