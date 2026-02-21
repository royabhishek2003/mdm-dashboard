export default function KpiSkeleton() {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 animate-pulse">
      <div className="h-4 w-24 bg-slate-700 rounded mb-3"></div>
      <div className="h-6 w-16 bg-slate-600 rounded"></div>
      <div className="h-3 w-20 bg-slate-700 rounded mt-2"></div>
    </div>
  );
}