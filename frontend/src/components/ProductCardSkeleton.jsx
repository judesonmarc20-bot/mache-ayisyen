// Yon "eskèlèt" ki montre fòm kat pwodwi a pandan done a ap chaje --
// pi bon eksperyans pase yon senp tèks "Ap chaje..." ki fè ekran an vid.
export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-pulse">
      <div className="aspect-square bg-slate-200" />
      <div className="p-3.5 space-y-2">
        <div className="h-2.5 bg-slate-200 rounded w-1/3" />
        <div className="h-3.5 bg-slate-200 rounded w-4/5" />
        <div className="h-3.5 bg-slate-200 rounded w-2/3" />
        <div className="h-4 bg-slate-200 rounded w-1/2 mt-3" />
      </div>
    </div>
  );
}
