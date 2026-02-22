import React from 'react';

const STATUS_CONFIG = {
  updated: {
    label: 'Updated',
    dot: 'bg-emerald-400',
    classes: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25 shadow-emerald-900/20'
  },
  outdated: {
    label: 'Outdated',
    dot: 'bg-amber-400',
    classes: 'bg-amber-500/10 text-amber-300 border-amber-500/25 shadow-amber-900/20'
  },
  failed: {
    label: 'Failed',
    dot: 'bg-red-400',
    classes: 'bg-red-500/10 text-red-300 border-red-500/25 shadow-red-900/20'
  },
  inactive: {
    label: 'Inactive',
    dot: 'bg-slate-500',
    classes: 'bg-slate-700/20 text-slate-400 border-slate-600/30'
  },
  installing: {
    label: 'Installing',
    dot: 'bg-blue-400 animate-pulseSoft',
    classes: 'bg-blue-500/10 text-blue-300 border-blue-500/25'
  },
  pending: {
    label: 'Pending',
    dot: 'bg-indigo-400',
    classes: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/25'
  },
  completed: {
    label: 'Completed',
    dot: 'bg-emerald-400',
    classes: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25'
  },
  cancelled: {
    label: 'Cancelled',
    dot: 'bg-slate-500',
    classes: 'bg-slate-700/20 text-slate-400 border-slate-600/30'
  },
  in_progress: {
    label: 'In Progress',
    dot: 'bg-blue-400 animate-pulseSoft',
    classes: 'bg-blue-500/10 text-blue-300 border-blue-500/25'
  },
  scheduled: {
    label: 'Scheduled',
    dot: 'bg-purple-400',
    classes: 'bg-purple-500/10 text-purple-300 border-purple-500/25'
  },
  pending_approval: {
    label: 'Pending Approval',
    dot: 'bg-yellow-400 animate-pulseSoft',
    classes: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/25'
  }
};

export default function StatusBadge({ status, size = 'md', showDot = true, uppercase = false }) {
  const normalized = (status || '').toLowerCase();
  const config = STATUS_CONFIG[normalized] || {
    label: status || 'Unknown',
    dot: 'bg-slate-400',
    classes: 'bg-slate-700/20 text-slate-300 border-slate-600/30'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-0.5 text-[11px] gap-1.5',
    lg: 'px-3 py-1 text-xs gap-2'
  };

  return (
    <span
      role="status"
      aria-label={`Status: ${config.label}`}
      className={`inline-flex items-center rounded-full border font-medium shadow-sm ${sizeClasses[size] || sizeClasses.md
        } ${config.classes} ${uppercase ? 'uppercase tracking-wide' : ''}`}
    >
      {showDot && (
        <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${config.dot}`} />
      )}
      {config.label}
    </span>
  );
}