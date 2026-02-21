import React, { useMemo } from 'react';
import { formatDateTime } from '../../utils/dateUtils.js';

export default function Timeline({
  items = [],
  maxHeight = null,
  emptyMessage = 'No timeline events available.'
}) {
  const sortedItems = useMemo(() => {
    return [...items]
      .filter(Boolean)
      .sort((a, b) => {
        const aTime = new Date(a.timestamp).getTime() || 0;
        const bTime = new Date(b.timestamp).getTime() || 0;
        return aTime - bTime;
      });
  }, [items]);

  if (!sortedItems.length) {
    return (
      <div className="text-xs text-slate-400">
        {emptyMessage}
      </div>
    );
  }

  const containerStyle = maxHeight
    ? { maxHeight, overflowY: 'auto' }
    : undefined;

  const getStatusColor = status => {
    if (!status) return 'bg-brand-500';

    const normalized = status.toLowerCase();

    if (normalized.includes('fail') || normalized === 'error') {
      return 'bg-red-500';
    }

    if (normalized.includes('pending') || normalized.includes('scheduled')) {
      return 'bg-amber-500';
    }

    if (normalized.includes('install') || normalized.includes('download')) {
      return 'bg-blue-500';
    }

    return 'bg-emerald-500';
  };

  return (
    <div style={containerStyle} role="list">
      <ol className="relative border-l border-slate-700 text-xs">
        {sortedItems.map(item => {
          const key =
            item.id ||
            `${item.timestamp}-${item.title || item.message}`;

          const dotColor = getStatusColor(item.status);

          return (
            <li
              key={key}
              className="relative mb-4 ml-4"
              role="listitem"
            >
              {/* Timeline Dot */}
              <div
                className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full border border-slate-900 ${dotColor}`}
                aria-hidden="true"
              />

              {/* Header Row */}
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-semibold text-slate-100">
                  {item.title || item.message || 'Event'}
                </p>
                <p className="text-[10px] text-slate-400 whitespace-nowrap">
                  {formatDateTime(item.timestamp)}
                </p>
              </div>

              {/* Description */}
              {item.description && (
                <p className="mt-1 text-[11px] text-slate-300">
                  {item.description}
                </p>
              )}

              {/* Metadata */}
              {item.meta &&
                typeof item.meta === 'object' && (
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-400">
                    {Object.entries(item.meta).map(
                      ([key, val]) => (
                        <span key={key}>
                          <span className="uppercase tracking-wide text-slate-500">
                            {key}:
                          </span>{' '}
                          {String(val)}
                        </span>
                      )
                    )}
                  </div>
                )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}