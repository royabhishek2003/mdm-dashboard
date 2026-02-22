import React from 'react';

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className,
  type = 'button',
  ...rest
}) {
  const isDisabled = disabled || loading;

  const base =
    'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-slate-900 relative overflow-hidden';

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2   text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2'
  };

  const variants = {
    primary:
      'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-900/40 hover:from-indigo-500 hover:to-blue-500 hover:shadow-indigo-900/60 hover:-translate-y-0.5 active:translate-y-0',
    secondary:
      'bg-slate-800 border border-slate-700/60 text-slate-200 hover:bg-slate-700 hover:border-slate-600 hover:-translate-y-0.5 active:translate-y-0',
    danger:
      'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-900/30 hover:from-red-500 hover:to-rose-500 hover:-translate-y-0.5 active:translate-y-0',
    ghost:
      'bg-transparent text-slate-300 hover:bg-slate-800/70 hover:text-slate-100 hover:-translate-y-0.5 active:translate-y-0'
  };

  const disabledClasses = isDisabled
    ? 'opacity-50 cursor-not-allowed !transform-none hover:!translate-y-0'
    : '';

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={cn(
        base,
        sizes[size] || sizes.md,
        variants[variant] || variants.primary,
        disabledClasses,
        fullWidth && 'w-full',
        className
      )}
      {...rest}
    >
      {/* Shine overlay on primary */}
      {variant === 'primary' && !isDisabled && (
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 to-transparent" />
      )}

      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          Loading…
        </span>
      ) : (
        children
      )}
    </button>
  );
}