import React, { useEffect, useRef } from 'react';

/* ── Tone config ──────────────────────────────────────── */
const TONE = {
  neutral: {
    container: 'border-slate-800/60 bg-slate-900/50',
    valueColor: 'text-slate-100',
    accent: 'from-slate-600 to-slate-500',
    glow: '',
    icon: '📊'
  },
  positive: {
    container: 'border-emerald-700/30 bg-emerald-950/30',
    valueColor: 'text-emerald-300',
    accent: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-900/20',
    icon: '✓'
  },
  warning: {
    container: 'border-amber-700/30 bg-amber-950/20',
    valueColor: 'text-amber-300',
    accent: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-900/20',
    icon: '⚠'
  },
  danger: {
    container: 'border-red-700/30 bg-red-950/20',
    valueColor: 'text-red-300',
    accent: 'from-red-500 to-rose-500',
    glow: 'shadow-red-900/20',
    icon: '✕'
  }
};

export default function KpiCard({
  label,
  value,
  helper,
  tone = 'neutral',
  icon = null,
  trend = null,
  loading = false
}) {
  const cfg = TONE[tone] || TONE.neutral;
  const prevValue = useRef(value);

  /* animate number change */
  const didChange = prevValue.current !== value;
  useEffect(() => { prevValue.current = value; }, [value]);

  const renderTrend = () => {
    if (!trend) return null;
    const isUp = trend.direction === 'up';
    return (
      <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${isUp ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'
        }`}>
        {isUp ? '↑' : '↓'} {trend.value}%
      </span>
    );
  };

  return (
    <div
      role="status"
      aria-label={label}
      className={`group relative flex flex-col overflow-hidden rounded-xl border px-5 py-4 shadow-lg transition-all duration-300 glass-card-hover animate-countUp ${cfg.container} ${cfg.glow} cursor-default`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 inset-y-0 w-0.5 bg-gradient-to-b ${cfg.accent} opacity-70`} />

      {/* Top-right icon */}
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </span>
        <span className="text-base opacity-40 transition-opacity group-hover:opacity-70" aria-hidden>
          {icon || cfg.icon}
        </span>
      </div>

      {/* Value */}
      <div className="mt-3 flex items-end justify-between gap-2">
        <div
          key={value}
          className={`text-3xl font-bold tabular-nums tracking-tight ${cfg.valueColor} ${didChange ? 'animate-countUp' : ''}`}
        >
          {loading ? '—' : (value ?? '—')}
        </div>
        {renderTrend()}
      </div>

      {/* Helper */}
      {helper && (
        <div className="mt-1.5 text-[11px] text-slate-500">{helper}</div>
      )}

      {/* Bottom gradient line */}
      <div className={`absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r ${cfg.accent} opacity-30 group-hover:opacity-60 transition-opacity duration-300`} />
    </div>
  );
}