import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadDevices } from '../features/devices/devicesSlice.js';
import {
  selectDevices,
  selectDevicesLoading
} from '../features/devices/selectors.js';
import { selectCurrentRole } from '../features/auth/authSlice.js';

import StatusBadge from '../components/common/StatusBadge.jsx';
import Timeline from '../components/timeline/Timeline.jsx';
import Button from '../components/common/Button.jsx';
import { formatDateTime } from '../utils/dateUtils.js';

export default function DeviceDetail() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const devices = useSelector(selectDevices);
  const loading = useSelector(selectDevicesLoading);
  const role = useSelector(selectCurrentRole);

  useEffect(() => {
    if (!devices.length) {
      dispatch(loadDevices());
    }
  }, [dispatch, devices.length]);

  const device = useMemo(() => {
    return devices.find(d => d.id === deviceId);
  }, [devices, deviceId]);

  const complianceStatus = useMemo(() => {
    if (!device) return null;

    if (device.isBlocked) return 'blocked';

    if (device.currentVersion !== device.targetVersion) {
      return 'outdated';
    }

    return 'compliant';
  }, [device]);

  const timelineItems = useMemo(() => {
    if (!device || !device.updateHistory?.length) return [];

    return device.updateHistory.map((item, index) => ({
      id: index,
      timestamp: item.timestamp,
      title: item.message,
      message: item.message,
      status: item.status
    }));
  }, [device]);

  // ✅ Lightweight loading state (no FullPageLoader)
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-700 rounded" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-40 bg-slate-800 rounded" />
          <div className="h-40 bg-slate-800 rounded" />
        </div>
        <div className="h-60 bg-slate-800 rounded" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-6 text-center">
        <h2 className="text-lg font-semibold text-slate-100">
          Device Not Found
        </h2>
        <p className="mt-2 text-xs text-slate-400">
          The device with ID {deviceId} could not be found.
        </p>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100">
            {device.name}
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Device ID: {device.id}
          </p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Info + Compliance */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Device Info */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-100">
            Device Information
          </h2>

          <dl className="space-y-2 text-xs">
            {[
              ['Device ID', device.id],
              ['Name', device.name],
              ['Region', device.region],
              ['Device Group', device.deviceGroup],
              ['OS', device.os],
              ['Current Version', device.currentVersion],
              ['Target Version', device.targetVersion],
              ['Last Seen', formatDateTime(device.lastSeen)]
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <dt className="text-slate-400">{label}</dt>
                <dd className="text-slate-100">{value || '-'}</dd>
              </div>
            ))}

            <div className="flex justify-between">
              <dt className="text-slate-400">Update Status</dt>
              <dd>
                <StatusBadge status={device.updateStatus} />
              </dd>
            </div>
          </dl>
        </div>

        {/* Compliance */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-100">
            Compliance Status
          </h2>

          <div className="flex items-center gap-3">
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold ${
                complianceStatus === 'compliant'
                  ? 'bg-emerald-900/40 text-emerald-300'
                  : complianceStatus === 'outdated'
                  ? 'bg-amber-900/40 text-amber-300'
                  : 'bg-red-900/40 text-red-300'
              }`}
            >
              {complianceStatus === 'compliant'
                ? '✓'
                : complianceStatus === 'outdated'
                ? '!'
                : '✗'}
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-100">
                {complianceStatus === 'compliant'
                  ? 'Compliant'
                  : complianceStatus === 'outdated'
                  ? 'Outdated'
                  : 'Blocked'}
              </div>

              <div className="text-[11px] text-slate-400">
                {complianceStatus === 'compliant'
                  ? 'Device meets required version policy'
                  : complianceStatus === 'outdated'
                  ? `Running ${device.currentVersion}, target is ${device.targetVersion}`
                  : 'Device blocked due to policy or repeated failures'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-100">
            Update History Timeline
          </h2>

          {role === 'ADMIN' && (
            <span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-300">
              Admin View
            </span>
          )}
        </div>

        <Timeline items={timelineItems} />
      </div>
    </div>
  );
}