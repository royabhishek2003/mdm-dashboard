import React, { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import {
  loadDevices,
  setSelectedRegion
} from '../features/devices/devicesSlice.js';

import {
  selectDeviceKpis,
  selectRegionVersionChartData,
  selectDevices,
  selectDevicesLoading,
  selectSelectedRegion
} from '../features/devices/selectors.js';

import KpiCard from '../components/kpi/KpiCard.jsx';
import RegionVersionBarChart from '../components/charts/RegionVersionBarChart.jsx';
import DeviceTable from '../components/tables/DeviceTable.jsx';
import KpiSkeleton from '../components/common/KpiSkeleton.jsx';
import ChartSkeleton from '../components/common/ChartSkeleton.jsx';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const kpis = useSelector(selectDeviceKpis);
  const chartData = useSelector(selectRegionVersionChartData);
  const devices = useSelector(selectDevices);
  const loading = useSelector(selectDevicesLoading);
  const selectedRegion = useSelector(selectSelectedRegion);

  useEffect(() => {
    if (!devices.length) dispatch(loadDevices());
  }, [dispatch, devices.length]);

  const handleRegionClick = useCallback(
    region => dispatch(setSelectedRegion(region === selectedRegion ? null : region)),
    [dispatch, selectedRegion]
  );

  const handleRowClick = useCallback(
    device => navigate(`/devices/${device.id}`),
    [navigate]
  );

  return (
    <div className="space-y-7">

      {/* ── Page Header ──────────────────────────────────── */}
      <div className="animate-fadeInDown">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/30 to-blue-600/20 text-indigo-400 border border-indigo-500/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              Device Inventory Dashboard
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Monitor device status, versions &amp; compliance across your fleet
            </p>
          </div>
        </div>
      </div>

      {/* ── KPI Grid ─────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <KpiSkeleton key={i} />)
        ) : (
          <>
            <div className="animate-fadeInUp stagger-1">
              <KpiCard label="Total Devices" value={kpis.totalDevices} tone="neutral" />
            </div>
            <div className="animate-fadeInUp stagger-2">
              <KpiCard label="On Latest" value={kpis.onLatest} helper={`${kpis.onLatestPct}% of fleet`} tone="positive" />
            </div>
            <div className="animate-fadeInUp stagger-3">
              <KpiCard label="Outdated" value={kpis.outdated} helper={`${kpis.outdatedPct}% of fleet`} tone="warning" />
            </div>
            <div className="animate-fadeInUp stagger-4">
              <KpiCard label="Inactive (>7d)" value={kpis.inactive} helper={`${kpis.inactivePct}% of fleet`} tone="warning" />
            </div>
            <div className="animate-fadeInUp stagger-5">
              <KpiCard label="Failed Updates" value={kpis.failed} helper={`${kpis.failedPct}% of fleet`} tone="danger" />
            </div>
          </>
        )}
      </div>

      {/* ── Chart ────────────────────────────────────────── */}
      <div className="animate-fadeInUp" style={{ animationDelay: '220ms', animationFillMode: 'both' }}>
        {loading ? (
          <ChartSkeleton />
        ) : chartData?.data?.length > 0 ? (
          <RegionVersionBarChart
            data={chartData.data}
            versionKeys={chartData.versionKeys}
            selectedRegion={selectedRegion}
            onRegionClick={handleRegionClick}
          />
        ) : (
          <div className="flex items-center justify-center h-48 text-slate-500 border border-slate-800/60 rounded-xl bg-slate-900/50">
            No data available
          </div>
        )}
      </div>

      {/* ── Device Table ─────────────────────────────────── */}
      {!loading && (
        <div className="animate-fadeInUp" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <DeviceTable
            devices={devices}
            selectedRegion={selectedRegion}
            onRowClick={handleRowClick}
          />
        </div>
      )}
    </div>
  );
}