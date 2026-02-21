import React, { memo, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import EmptyState from '../common/EmptyState.jsx';

function RegionVersionBarChart({
  data = [],
  versionKeys = [],
  selectedRegion,
  onRegionClick
}) {
  const colors = useMemo(() => {
    const palette = [
      '#3B82F6',
      '#22C55E',
      '#F97316',
      '#A855F7',
      '#EF4444',
      '#06B6D4',
      '#EAB308',
      '#6366F1',
      '#14B8A6'
    ];
    return versionKeys.map((_, i) => palette[i % palette.length]);
  }, [versionKeys]);

  if (!data.length) {
    return (
      <div className="h-72">
        <EmptyState
          title="No device data available"
          description="Version distribution will appear here once devices are loaded."
          compact
        />
      </div>
    );
  }

  const handleBarClick = entry => {
    if (!onRegionClick || !entry?.payload?.region) return;
    onRegionClick(entry.payload.region);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const total = payload.reduce((sum, p) => sum + (p.value || 0), 0);

    return (
      <div className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-lg">
        <div className="font-semibold text-slate-100">
          {label}
        </div>

        <div className="mt-1 space-y-0.5 text-slate-300">
          {payload.map(item => (
            <div
              key={item.dataKey}
              className="flex justify-between gap-3"
            >
              <span>{item.dataKey}</span>
              <span className="font-semibold">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-2 border-t border-slate-700 pt-1 text-[11px] text-slate-400">
          Total: <span className="font-semibold text-slate-200">{total}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="h-72 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between text-xs">
        <div className="font-semibold text-slate-100">
          Devices by Region &amp; Version
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>Click a region to filter</span>

          {selectedRegion && selectedRegion !== 'All' && (
            <>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px]">
                {selectedRegion}
              </span>
              <button
                onClick={() => onRegionClick?.('All')}
                className="text-brand-400 hover:text-brand-300"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1F2937"
          />
          <XAxis
            dataKey="region"
            stroke="#9CA3AF"
            fontSize={11}
          />
          <YAxis
            stroke="#9CA3AF"
            fontSize={11}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 10 }} />

          {versionKeys.map((version, idx) => (
            <Bar
              key={version}
              dataKey={version}
              stackId="versions"
              fill={colors[idx]}
              radius={[3, 3, 0, 0]}
              cursor="pointer"
              opacity={
                selectedRegion &&
                selectedRegion !== 'All'
                  ? undefined
                  : 1
              }
              onClick={handleBarClick}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default memo(RegionVersionBarChart);