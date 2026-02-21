import React, { useMemo, useState, useEffect } from 'react';
import EmptyState from '../common/EmptyState.jsx';
import RolloutHistoryCard from './RolloutHistoryCard.jsx';

const ITEMS_PER_PAGE = 5;

export default function RolloutHistorySection({
  rollouts = []
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  /* -----------------------------------
     Sort History (Newest First)
  ------------------------------------ */
  const sortedHistory = useMemo(() => {
    return [...rollouts].sort((a, b) => {
      const aTime =
        a.completedAt ||
        a.cancelledAt ||
        a.createdAt ||
        0;

      const bTime =
        b.completedAt ||
        b.cancelledAt ||
        b.createdAt ||
        0;

      return bTime - aTime;
    });
  }, [rollouts]);

  const totalPages = Math.ceil(
    sortedHistory.length / ITEMS_PER_PAGE
  );

  /* -----------------------------------
     Paginated Data
  ------------------------------------ */
  const paginatedHistory = useMemo(() => {
    const start =
      (currentPage - 1) * ITEMS_PER_PAGE;

    const end = start + ITEMS_PER_PAGE;

    return sortedHistory.slice(start, end);
  }, [sortedHistory, currentPage]);

  /* -----------------------------------
     Reset Page If Data Changes
  ------------------------------------ */
  useEffect(() => {
    setCurrentPage(1);
  }, [sortedHistory.length]);

  const hasHistory = sortedHistory.length > 0;

  const goToPage = page => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <section className="mt-6 border-t border-slate-800 pt-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-100">
          Rollout History
        </h2>

        {hasHistory && (
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              –
              {Math.min(
                currentPage * ITEMS_PER_PAGE,
                sortedHistory.length
              )}{' '}
              of {sortedHistory.length}
            </span>

            <button
              onClick={() =>
                setCollapsed(prev => !prev)
              }
              className="rounded-md bg-slate-800 px-2 py-1 hover:bg-slate-700"
            >
              {collapsed ? 'Expand' : 'Collapse'}
            </button>
          </div>
        )}
      </div>

      {/* Empty */}
      {!hasHistory ? (
        <EmptyState
          title="No rollout history yet"
          description="Completed or cancelled rollouts will appear here."
        />
      ) : collapsed ? null : (
        <>
          {/* Cards */}
          <div className="space-y-3">
            {paginatedHistory.map(rollout => (
              <RolloutHistoryCard
                key={rollout.id}
                rollout={rollout}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() =>
                  goToPage(currentPage - 1)
                }
                disabled={currentPage === 1}
                className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200 disabled:opacity-40"
              >
                Prev
              </button>

              {[...Array(totalPages)].map(
                (_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      key={page}
                      onClick={() =>
                        goToPage(page)
                      }
                      className={`rounded-md px-3 py-1 text-xs ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
              )}

              <button
                onClick={() =>
                  goToPage(currentPage + 1)
                }
                disabled={
                  currentPage === totalPages
                }
                className="rounded-md border border-slate-700 bg-slate-800 px-3 py-1 text-xs text-slate-200 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}