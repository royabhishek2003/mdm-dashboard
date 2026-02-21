import React, { useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectRollouts } from '../features/rollouts/rolloutsSlice.js';
import RolloutHistoryCard from '../components/rollouts/RolloutHistoryCard.jsx';

const ITEMS_PER_PAGE = 5;

export default function RolloutHistory() {
  const rollouts = useSelector(selectRollouts);
  const [currentPage, setCurrentPage] = useState(1);

  /* ===============================
     Filter History Only
  ================================ */

  const historyRollouts = useMemo(() => {
    return rollouts
      .filter(r =>
        r.status === 'completed' || r.status === 'cancelled'
      )
      .sort((a, b) => {
        const aTime =
          a.completedAt || a.cancelledAt || a.createdAt || 0;

        const bTime =
          b.completedAt || b.cancelledAt || b.createdAt || 0;

        return bTime - aTime;
      });
  }, [rollouts]);

  const totalPages = Math.ceil(
    historyRollouts.length / ITEMS_PER_PAGE
  );

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return historyRollouts.slice(start, end);
  }, [historyRollouts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [historyRollouts.length]);

  const goToPage = page => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">
          Rollout History
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Completed and cancelled deployments
        </p>
      </div>

      {/* Empty State */}
      {historyRollouts.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-400">
          No rollout history available yet.
        </div>
      ) : (
        <>
          {/* Animated Cards */}
          <div className="space-y-4">
            {paginatedItems.map((rollout, index) => (
              <div
                key={rollout.id}
                className="animate-fadeInUp"
                style={{
                  animationDelay: `${index * 80}ms`,
                  animationFillMode: 'both'
                }}
              >
                <RolloutHistoryCard rollout={rollout} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200 disabled:opacity-40 hover:bg-slate-700 transition"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`rounded-md px-3 py-1 text-xs transition ${
                      page === currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200 disabled:opacity-40 hover:bg-slate-700 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}