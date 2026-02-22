import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectRollouts } from '../features/rollouts/rolloutsSlice.js';
import RolloutHistoryCard from '../components/rollouts/RolloutHistoryCard.jsx';

const ITEMS_PER_PAGE = 5;

export default function RolloutHistory() {
  const rollouts = useSelector(selectRollouts);
  const [currentPage, setCurrentPage] = useState(1);

  const historyRollouts = useMemo(() =>
    rollouts
      .filter(r => r.status === 'completed' || r.status === 'cancelled')
      .sort((a, b) => {
        const aTime = a.completedAt || a.cancelledAt || a.createdAt || 0;
        const bTime = b.completedAt || b.cancelledAt || b.createdAt || 0;
        return bTime - aTime;
      }),
    [rollouts]
  );

  const totalPages = Math.ceil(historyRollouts.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return historyRollouts.slice(start, start + ITEMS_PER_PAGE);
  }, [historyRollouts, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [historyRollouts.length]);

  const goToPage = page => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-7 animate-fadeIn">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="animate-fadeInDown">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600/25 to-teal-600/15 text-emerald-400 border border-emerald-500/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">Rollout History</h1>
            <p className="mt-0.5 text-xs text-slate-500">Completed and cancelled deployments</p>
          </div>
        </div>
      </div>

      {/* ── Stat strip ─────────────────────────────────── */}
      {historyRollouts.length > 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-slate-800/60 bg-slate-900/50 px-5 py-3 animate-fadeInUp stagger-1">
          {[
            { label: 'Total', value: historyRollouts.length, color: 'text-slate-200' },
            { label: 'Completed', value: historyRollouts.filter(r => r.status === 'completed').length, color: 'text-emerald-300' },
            { label: 'Cancelled', value: historyRollouts.filter(r => r.status === 'cancelled').length, color: 'text-slate-400' }
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-2">
              <span className={`text-lg font-bold tabular-nums ${stat.color}`}>{stat.value}</span>
              <span className="text-xs text-slate-600">{stat.label}</span>
              <span className="text-slate-800">·</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty State ─────────────────────────────────── */}
      {historyRollouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/50 p-16 text-center animate-scaleIn">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-3xl">🕐</div>
          <p className="text-sm font-medium text-slate-300">No rollout history yet</p>
          <p className="mt-1 text-xs text-slate-600">Completed or cancelled rollouts will appear here</p>
        </div>
      ) : (
        <>
          {/* Cards */}
          <div className="space-y-4">
            {paginatedItems.map((rollout, index) => (
              <div
                key={rollout.id}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
              >
                <RolloutHistoryCard rollout={rollout} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2 animate-fadeIn">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg border border-slate-700/60 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-600/10 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >← Prev</button>

              {[...Array(totalPages)].map((_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => goToPage(pg)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${pg === currentPage
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                        : 'border border-slate-700/60 bg-slate-800/70 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300'
                      }`}
                  >{pg}</button>
                );
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg border border-slate-700/60 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-600/10 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}