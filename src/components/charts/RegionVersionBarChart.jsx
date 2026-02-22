import React, { memo, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  Cell
} from 'recharts';

/* ── Vibrant color palette for versions ────────────────── */
const PALETTE = [
  { solid: '#6366F1', light: 'rgba(99,102,241,0.15)' }, // indigo
  { solid: '#22D3EE', light: 'rgba(34,211,238,0.15)' }, // cyan
  { solid: '#F59E0B', light: 'rgba(245,158,11,0.15)' }, // amber
  { solid: '#34D399', light: 'rgba(52,211,153,0.15)' }, // emerald
  { solid: '#F87171', light: 'rgba(248,113,113,0.15)' }, // red
  { solid: '#A78BFA', light: 'rgba(167,139,250,0.15)' }, // violet
  { solid: '#FB923C', light: 'rgba(251,146,60,0.15)' }, // orange
  { solid: '#38BDF8', light: 'rgba(56,189,248,0.15)' }, // sky
  { solid: '#4ADE80', light: 'rgba(74,222,128,0.15)' }, // green
];

/* ── Gradient IDs ─────────────────────────────────────── */
function GradientDefs({ versionKeys }) {
  return (
    <defs>
      {versionKeys.map((v, i) => {
        const color = PALETTE[i % PALETTE.length].solid;
        return (
          <linearGradient
            key={v}
            id={`vgrad-${i}`}
            x1="0" y1="0" x2="0" y2="1"
          >
            <stop offset="5%" stopColor={color} stopOpacity={0.92} />
            <stop offset="95%" stopColor={color} stopOpacity={0.55} />
          </linearGradient>
        );
      })}
    </defs>
  );
}

/* ── Custom Tooltip ───────────────────────────────────── */
function CustomTooltip({ active, payload, label, versionKeys, colors }) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);

  return (
    <div className="min-w-[180px] overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
      {/* Region header */}
      <div className="border-b border-slate-700/40 bg-gradient-to-r from-indigo-600/20 to-transparent px-4 py-2.5">
        <div className="text-xs font-bold text-slate-100">{label}</div>
        <div className="text-[10px] text-slate-500">{total} total devices</div>
      </div>

      {/* Version rows */}
      <div className="space-y-1 px-4 py-2.5">
        {payload.map((item, i) => {
          const pct = total ? Math.round((item.value / total) * 100) : 0;
          const color = colors[versionKeys.indexOf(item.dataKey)] || '#6366F1';
          return (
            <div key={item.dataKey} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-slate-300">{item.dataKey}</span>
              </div>
              <div className="flex items-center gap-2 tabular-nums">
                <span className="text-xs font-bold text-slate-100">{item.value}</span>
                <span className="text-[10px] text-slate-600">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress bars */}
      <div className="px-4 pb-3">
        {payload.map((item, i) => {
          const pct = total ? (item.value / total) * 100 : 0;
          const color = colors[versionKeys.indexOf(item.dataKey)] || '#6366F1';
          return (
            <div key={item.dataKey} className="mt-1">
              <div className="h-1 w-full rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Custom Legend ─────────────────────────────────────── */
function CustomLegend({ versionKeys, colors }) {
  return (
    <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
      {versionKeys.map((v, i) => (
        <span
          key={v}
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium"
          style={{
            borderColor: `${colors[i]}40`,
            color: colors[i],
            backgroundColor: `${colors[i]}12`
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors[i] }} />
          v{v}
        </span>
      ))}
    </div>
  );
}

/* ── Custom X-Axis Tick ───────────────────────────────── */
function CustomXTick({ x, y, payload, selectedRegion, onRegionClick }) {
  const isSelected = selectedRegion === payload.value;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0} y={0} dy={14}
        textAnchor="middle"
        fontSize={10}
        fontWeight={isSelected ? 700 : 400}
        fill={isSelected ? '#818CF8' : '#64748B'}
        className="cursor-pointer transition-colors duration-150"
        onClick={() => onRegionClick?.(payload.value)}
      >
        {payload.value}
      </text>
      {isSelected && (
        <line
          x1={-20} y1={18} x2={20} y2={18}
          stroke="#6366F1" strokeWidth={2} strokeLinecap="round"
        />
      )}
    </g>
  );
}

/* ── Main Component ───────────────────────────────────── */
function RegionVersionBarChart({ data = [], versionKeys = [], selectedRegion, onRegionClick }) {
  const [hoveredRegion, setHoveredRegion] = useState(null);

  const colors = useMemo(
    () => versionKeys.map((_, i) => PALETTE[i % PALETTE.length].solid),
    [versionKeys]
  );

  if (!data.length) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/50 text-sm text-slate-500">
        No device data available
      </div>
    );
  }

  const handleBarClick = entry => {
    if (!onRegionClick || !entry?.activePayload?.[0]?.payload?.region) return;
    const region = entry.activePayload[0].payload.region;
    onRegionClick(region === selectedRegion ? 'All' : region);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/50 shadow-xl">
      {/* ── Card header ─────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-slate-800/40 bg-gradient-to-r from-indigo-600/10 via-transparent to-transparent px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-100">Devices by Region &amp; Version</div>
            <div className="text-[10px] text-slate-500">Click a bar to filter the device table</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedRegion && selectedRegion !== 'All' && (
            <div className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 pl-2.5 pr-1.5 py-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              <span className="text-[11px] font-medium text-indigo-300">{selectedRegion}</span>
              <button
                onClick={() => onRegionClick?.('All')}
                className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/40 transition-colors"
              >
                <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 3L3 9M3 3l6 6" />
                </svg>
              </button>
            </div>
          )}
          <span className="text-[10px] text-slate-600 tabular-nums">{data.length} regions</span>
        </div>
      </div>

      {/* ── Chart ─────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-2" style={{ height: '320px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 12, left: -12, bottom: 8 }}
            barCategoryGap="28%"
            onClick={handleBarClick}
            onMouseMove={e => setHoveredRegion(e?.activeLabel)}
            onMouseLeave={() => setHoveredRegion(null)}
            style={{ cursor: 'pointer' }}
          >
            <defs>
              {versionKeys.map((v, i) => {
                const color = PALETTE[i % PALETTE.length].solid;
                return (
                  <linearGradient key={v} id={`vgrad-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.45} />
                  </linearGradient>
                );
              })}
            </defs>

            <CartesianGrid
              strokeDasharray="3 6"
              vertical={false}
              stroke="rgba(51,65,85,0.5)"
            />

            <XAxis
              dataKey="region"
              axisLine={false}
              tickLine={false}
              tick={props => (
                <CustomXTick
                  {...props}
                  selectedRegion={selectedRegion}
                  onRegionClick={onRegionClick}
                />
              )}
              interval={0}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              fontSize={10}
              tick={{ fill: '#475569' }}
              allowDecimals={false}
              width={36}
            />

            <Tooltip
              content={
                <CustomTooltip
                  versionKeys={versionKeys}
                  colors={colors}
                />
              }
              cursor={{ fill: 'rgba(99,102,241,0.06)', radius: 6 }}
            />

            {versionKeys.map((version, idx) => {
              const isLast = idx === versionKeys.length - 1;
              return (
                <Bar
                  key={version}
                  dataKey={version}
                  stackId="versions"
                  fill={`url(#vgrad-${idx})`}
                  radius={isLast ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                  isAnimationActive={true}
                  animationBegin={idx * 80}
                  animationDuration={900}
                  animationEasing="ease-out"
                  maxBarSize={52}
                  opacity={
                    selectedRegion && selectedRegion !== 'All' ? 0.85 : 1
                  }
                />
              );
            })}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Legend ─────────────────────────────────────── */}
      <div className="border-t border-slate-800/40 px-5 py-3">
        <CustomLegend versionKeys={versionKeys} colors={colors} />
      </div>
    </div>
  );
}

export default memo(RegionVersionBarChart);