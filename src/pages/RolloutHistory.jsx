import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectRollouts } from '../features/rollouts/rolloutsSlice.js';
import RolloutHistoryCard from '../components/rollouts/RolloutHistoryCard.jsx';

const ITEMS_PER_PAGE = 5;
const FILTER_TABS = [
  { key: 'all', label: 'All', color: 'text-slate-300' },
  { key: 'completed', label: 'Completed', color: 'text-emerald-400' },
  { key: 'cancelled', label: 'Cancelled', color: 'text-slate-500' },
];

/* ── Animated stat card ─────────────────────────────── */
function StatCard({ value, label, color, icon, delay = 0 }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShown(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className="flex flex-1 items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-900/60 px-5 py-4 transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-900/80 hover:-translate-y-0.5 animate-fadeInUp"
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'both' }}
    >
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-slate-700/40 bg-slate-800/60 text-lg">
        {icon}
      </div>
      <div>
        <div className={`text-2xl font-bold tabular-nums transition-all duration-700 ${color} ${shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          {value}
        </div>
        <div className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold">{label}</div>
      </div>
    </div>
  );
}

export default function RolloutHistory() {
  const rollouts = useSelector(selectRollouts);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  /* Base history (completed + cancelled) */
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

  const completedCount = useMemo(() => historyRollouts.filter(r => r.status === 'completed').length, [historyRollouts]);
  const cancelledCount = useMemo(() => historyRollouts.filter(r => r.status === 'cancelled').length, [historyRollouts]);
  const successfulCount = useMemo(() =>
    historyRollouts.filter(r => {
      const done = r.stages?.completed ?? 0;
      return r.status === 'completed' && done === r.totalDevices;
    }).length,
    [historyRollouts]
  );

  /* Filter + search */
  const filteredRollouts = useMemo(() => {
    let list = historyRollouts;
    if (activeFilter !== 'all') list = list.filter(r => r.status === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        r.fromVersion?.toLowerCase().includes(q) ||
        r.toVersion?.toLowerCase().includes(q) ||
        r.region?.toLowerCase().includes(q) ||
        r.deviceGroup?.toLowerCase().includes(q) ||
        r.name?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [historyRollouts, activeFilter, searchQuery]);

  const totalPages = Math.ceil(filteredRollouts.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRollouts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRollouts, currentPage]);

  /* Reset page when filters change */
  useEffect(() => { setCurrentPage(1); }, [activeFilter, searchQuery, historyRollouts.length]);

  const goToPage = page => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Header ─────────────────────────────────── */}
      <div className="animate-fadeInDown">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-600/25 to-teal-600/15">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulseSoft" />
              </span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100">Rollout History</h1>
              <p className="mt-0.5 text-xs text-slate-500">Completed and cancelled deployments</p>
            </div>
          </div>

          {/* Live badge */}
          {historyRollouts.length > 0 && (
            <div className="rounded-full border border-slate-700/50 bg-slate-800/60 px-3 py-1.5 text-[11px] font-medium text-slate-400">
              {filteredRollouts.length} {activeFilter === 'all' ? 'total' : activeFilter}
            </div>
          )}
        </div>
      </div>

      {/* ── Stat cards ─────────────────────────────── */}
      {historyRollouts.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          <StatCard value={historyRollouts.length} label="Total" icon="📦" color="text-slate-200" delay={0} />
          <StatCard value={completedCount} label="Completed" icon="✅" color="text-emerald-300" delay={60} />
          <StatCard value={successfulCount} label="Successful" icon="🎯" color="text-teal-300" delay={120} />
          <StatCard value={cancelledCount} label="Cancelled" icon="🚫" color="text-slate-400" delay={180} />
        </div>
      )}

      {/* ── Filter tabs + Search ────────────────────── */}
      {historyRollouts.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 animate-fadeInUp stagger-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-800/60 bg-slate-900/60 p-1">
            {FILTER_TABS.map(tab => {
              const count = tab.key === 'all' ? historyRollouts.length
                : tab.key === 'completed' ? completedCount
                  : cancelledCount;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveFilter(tab.key)}
                  className={`relative flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${activeFilter === tab.key
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                >
                  <span>{tab.label}</span>
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${activeFilter === tab.key ? 'bg-indigo-500/50 text-indigo-100' : 'bg-slate-800 text-slate-500'
                    }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search version, region…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="h-9 w-52 rounded-xl border border-slate-700/60 bg-slate-800/60 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 12 12" strokeLinecap="round">
                  <path d="M9 3L3 9M3 3l6 6" />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Empty State ─────────────────────────────── */}
      {historyRollouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/50 p-16 text-center animate-scaleIn">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-3xl">📭</div>
          <p className="text-sm font-semibold text-slate-300">No rollout history yet</p>
          <p className="mt-1.5 text-xs text-slate-600 leading-relaxed max-w-xs">
            Once rollouts complete or are cancelled, they'll appear here with full analytics.
          </p>
        </div>
      ) : filteredRollouts.length === 0 ? (
        /* Search no results */
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-800/60 bg-slate-900/50 py-12 text-center animate-scaleIn">
          <div className="mb-3 text-3xl">🔍</div>
          <p className="text-sm font-semibold text-slate-400">No matches found</p>
          <p className="mt-1 text-xs text-slate-600">Try adjusting your search or filter</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
            className="mt-3 rounded-lg border border-slate-700/60 bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* ── Cards ─────────────────────────────── */}
          <div className="space-y-3">
            {paginatedItems.map((rollout, index) => (
              <div
                key={rollout.id}
                className="animate-fadeInUp"
                style={{ animationDelay: `${index * 70}ms`, animationFillMode: 'both' }}
              >
                <RolloutHistoryCard rollout={rollout} />
              </div>
            ))}
          </div>

          {/* ── Pagination ────────────────────────── */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-slate-800/60 bg-slate-900/40 px-5 py-3 animate-fadeIn">
              <p className="text-[11px] text-slate-600">
                Page <span className="font-semibold text-slate-400">{currentPage}</span> of <span className="font-semibold text-slate-400">{totalPages}</span>
                <span className="ml-2">({filteredRollouts.length} items)</span>
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700/60 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-600/10 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 hover:-translate-y-0.5 disabled:hover:translate-y-0"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                  Prev
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pg = i + 1;
                  return (
                    <button
                      key={pg}
                      onClick={() => goToPage(pg)}
                      className={`h-8 min-w-[32px] rounded-lg px-2.5 text-xs font-medium transition-all duration-150 ${pg === currentPage
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40 scale-105'
                          : 'border border-slate-700/60 bg-slate-800/70 text-slate-400 hover:border-indigo-500/40 hover:text-indigo-300 hover:-translate-y-0.5'
                        }`}
                    >
                      {pg}
                    </button>
                  );
                })}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-700/60 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-600/10 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150 hover:-translate-y-0.5 disabled:hover:translate-y-0"
                >
                  Next
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}