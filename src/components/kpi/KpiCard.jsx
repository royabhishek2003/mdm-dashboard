import React from 'react';

const TONE_STYLES = {
  neutral: {
    container: 'border-slate-800 bg-slate-900/60',
    value: 'text-slate-50'
  },
  positive: {
    container: 'border-emerald-700/60 bg-emerald-900/20',
    value: 'text-emerald-300'
  },
  warning: {
    container: 'border-amber-700/60 bg-amber-900/20',
    value: 'text-amber-300'
  },
  danger: {
    container: 'border-red-700/60 bg-red-900/20',
    value: 'text-red-300'
  }
};

export default function KpiCard({
  label,
  value,
  helper,
  tone = 'neutral',
  icon = null,
  trend = null, // { value: 12, direction: 'up' | 'down' }
  loading = false
}) {
  const toneConfig = TONE_STYLES[tone] || TONE_STYLES.neutral;

  const renderTrend = () => {
    if (!trend) return null;

    const isUp = trend.direction === 'up';
    const trendColor = isUp
      ? 'text-emerald-400'
      : 'text-red-400';

    const arrow = isUp ? '▲' : '▼';

    return (
      <div className={`text-[11px] font-medium ${trendColor}`}>
        {arrow} {trend.value}%
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col justify-between rounded-lg border px-4 py-3 text-xs transition-colors duration-200 ${toneConfig.container}`}
      role="status"
      aria-label={label}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium text-slate-300">
          {label}
        </div>
        {icon && (
          <div className="text-slate-400">
            {icon}
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mt-2 flex items-end justify-between">
        <div
          className={`text-lg font-semibold ${toneConfig.value}`}
        >
          {loading ? '—' : value}
        </div>
        {renderTrend()}
      </div>

      {/* Helper */}
      {helper && (
        <div className="mt-1 text-[11px] text-slate-400">
          {helper}
        </div>
      )}
    </div>
  );
}