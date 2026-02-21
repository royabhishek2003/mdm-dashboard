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
    if (!devices.length) {
      dispatch(loadDevices());
    }
  }, [dispatch, devices.length]);

  const handleRegionClick = useCallback(
    region => {
      dispatch(
        setSelectedRegion(region === selectedRegion ? null : region)
      );
    },
    [dispatch, selectedRegion]
  );

  const handleRowClick = useCallback(
    device => {
      navigate(`/devices/${device.id}`);
    },
    [navigate]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-100">
          Device Inventory Dashboard
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Monitor device status, versions, and compliance across your fleet
        </p>
      </div>

      {/* KPI Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <KpiSkeleton key={i} />
          ))
        ) : (
          <>
            <KpiCard
              label="Total Devices"
              value={kpis.totalDevices}
              tone="neutral"
            />

            <KpiCard
              label="On Latest Version"
              value={kpis.onLatest}
              helper={`${kpis.onLatestPct}% of fleet`}
              tone="positive"
            />

            <KpiCard
              label="Outdated"
              value={kpis.outdated}
              helper={`${kpis.outdatedPct}% of fleet`}
              tone="warning"
            />

            <KpiCard
              label="Inactive (>7 days)"
              value={kpis.inactive}
              helper={`${kpis.inactivePct}% of fleet`}
              tone="warning"
            />

            <KpiCard
              label="Failed Updates"
              value={kpis.failed}
              helper={`${kpis.failedPct}% of fleet`}
              tone="danger"
            />
          </>
        )}
      </div>

      {/* Chart Section */}
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
        <div className="flex items-center justify-center h-48 text-slate-400 border border-slate-800 rounded-lg">
          No data available
        </div>
      )}

      {/* Device Table */}
      {!loading && (
        <DeviceTable
          devices={devices}
          selectedRegion={selectedRegion}
          onRowClick={handleRowClick}
        />
      )}
    </div>
  );
}