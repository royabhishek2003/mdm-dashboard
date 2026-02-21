import React from 'react';
import Button from './Button.jsx';

export default function EmptyState({
  title,
  description,
  icon = null,
  actionLabel,
  onAction,
  compact = false
}) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/60 text-center ${
        compact ? 'px-4 py-6' : 'px-6 py-10'
      }`}
    >
      {icon && (
        <div className="mb-3 text-slate-500">
          {icon}
        </div>
      )}

      <h3 className="text-sm font-semibold text-slate-100">
        {title}
      </h3>

      {description && (
        <p className="mt-1 max-w-sm text-xs text-slate-400">
          {description}
        </p>
      )}

      {actionLabel && onAction && (
        <div className="mt-4">
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}