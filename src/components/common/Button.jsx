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
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500';

  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variants = {
    primary:
      'bg-brand-600 text-white hover:bg-brand-700',
    secondary:
      'bg-slate-700 text-slate-100 hover:bg-slate-600',
    danger:
      'bg-red-600 text-white hover:bg-red-700',
    ghost:
      'bg-transparent text-slate-200 hover:bg-slate-800'
  };

  const disabledClasses = isDisabled
    ? 'opacity-60 cursor-not-allowed hover:bg-inherit'
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
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}