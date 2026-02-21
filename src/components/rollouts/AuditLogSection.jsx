import React from 'react';

export default function AuditLogSection({ logs = [] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-500">
        No audit activity recorded.
      </div>
    );
  }

  // Newest first
  const sortedLogs = [...logs].sort(
    (a, b) => b.timestamp - a.timestamp
  );

  return (
    <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/60 p-4">
      <h4 className="mb-3 text-sm font-semibold text-slate-100">
        Audit Log (Admin Only)
      </h4>

      <div className="space-y-3 text-xs max-h-60 overflow-y-auto">
        {sortedLogs.map(log => (
          <div
            key={log.id}
            className="flex items-center justify-between border-b border-slate-800 pb-2"
          >
            <div>
              <span className="font-medium text-slate-200">
                {log.action}
              </span>{' '}
              <span className="text-slate-400">
                by {log.performedBy}
              </span>
            </div>

            <span className="text-slate-500">
              {new Date(log.timestamp).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}