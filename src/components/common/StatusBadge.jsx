import React from 'react';

const STATUS_MAP = {
  updated: {
    label: 'Updated',
    classes: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50'
  },
  outdated: {
    label: 'Outdated',
    classes: 'bg-amber-900/30 text-amber-300 border-amber-700/50'
  },
  failed: {
    label: 'Failed',
    classes: 'bg-red-900/30 text-red-300 border-red-700/50'
  },
  inactive: {
    label: 'Inactive',
    classes: 'bg-slate-700/30 text-slate-300 border-slate-600/50'
  },
  installing: {
    label: 'Installing',
    classes: 'bg-blue-900/30 text-blue-300 border-blue-700/50'
  },
  pending: {
    label: 'Pending',
    classes: 'bg-indigo-900/30 text-indigo-300 border-indigo-700/50'
  },
  completed: {
    label: 'Completed',
    classes: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50'
  },
  cancelled: {
    label: 'Cancelled',
    classes: 'bg-slate-700/30 text-slate-400 border-slate-600/50'
  },
  in_progress: {
    label: 'In Progress',
    classes: 'bg-blue-900/30 text-blue-300 border-blue-700/50'
  }
};

export default function StatusBadge({
  status,
  size = 'md',
  showDot = false,
  uppercase = false
}) {
  const normalized = (status || '').toLowerCase();
  const config = STATUS_MAP[normalized] || {
    label: status || 'Unknown',
    classes: 'bg-slate-700/30 text-slate-200 border-slate-600/50'
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  return (
    <span
      role="status"
      aria-label={`Status: ${config.label}`}
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${
        sizeClasses[size] || sizeClasses.md
      } ${config.classes} ${uppercase ? 'uppercase tracking-wide' : ''}`}
    >
      {showDot && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {config.label}
    </span>
  );
}