import React from 'react';

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-sm font-semibold text-slate-100">
          {title}
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          {description}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-md bg-slate-800 px-3 py-1 text-xs"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-3 py-1 text-xs text-white"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}