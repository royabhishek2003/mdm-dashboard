import React, { useEffect } from 'react';

export default function Modal({
  open,
  title,
  children,
  onClose,
  actions,
  closeOnBackdrop = true,
  closeOnEsc = true,
  size = 'md'
}) {
  useEffect(() => {
    if (!open) return;

    const handleEsc = e => {
      if (e.key === 'Escape' && closeOnEsc) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEsc);

    // Lock body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={closeOnBackdrop ? onClose : undefined}
    >
      <div
        className={`w-full rounded-lg border border-slate-700 bg-slate-900 shadow-xl transition-all ${sizeClasses[size] || sizeClasses.md}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <h2
            id="modal-title"
            className="text-sm font-semibold text-slate-100"
          >
            {title}
          </h2>
          <button
            className="text-slate-400 hover:text-slate-200"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-4 text-sm text-slate-100">
          {children}
        </div>

        {/* Footer */}
        {actions && (
          <div className="flex justify-end gap-2 border-t border-slate-700 px-4 py-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}