import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { loadDevices } from '../features/devices/devicesSlice.js';
import { selectDevices, selectDevicesLoading } from '../features/devices/selectors.js';
import {
  ensureUpdateAuditForDevice,
  selectUpdateAuditForDevice
} from '../features/updateAudit/updateAuditSlice.js';
import { selectCurrentRole } from '../features/auth/authSlice.js';

import StatusBadge from '../components/common/StatusBadge.jsx';
import Timeline from '../components/timeline/Timeline.jsx';
import UpdateAuditTimeline from '../components/updateAudit/UpdateAuditTimeline.jsx';
import Button from '../components/common/Button.jsx';
import { formatDateTime } from '../utils/dateUtils.js';

/* ── Info Row ────────────────────────────────────────── */
function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/50 last:border-0 group">
      <dt className="text-xs text-slate-500 font-medium">{label}</dt>
      <dd className="text-xs font-medium text-slate-200 font-mono-custom">{value || '—'}</dd>
    </div>
  );
}

/* ── Section Card ─────────────────────────────────────── */
function Card({ title, badge, children, className = '' }) {
  return (
    <div className={`rounded-xl border border-slate-800/60 bg-slate-900/50 shadow-lg overflow-hidden ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800/40 px-5 py-3">
        <h2 className="text-sm font-semibold text-slate-200">{title}</h2>
        {badge}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function DeviceDetail() {
  const { deviceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const devices = useSelector(selectDevices);
  const loading = useSelector(selectDevicesLoading);
  const role = useSelector(selectCurrentRole);
  const updateAuditAttempts = useSelector(state => selectUpdateAuditForDevice(state, deviceId));

  useEffect(() => {
    if (!devices.length) dispatch(loadDevices());
  }, [dispatch, devices.length]);

  const device = useMemo(() => devices.find(d => d.id === deviceId), [devices, deviceId]);

  useEffect(() => {
    if (deviceId && device) dispatch(ensureUpdateAuditForDevice({ deviceId, device }));
  }, [dispatch, deviceId, device]);

  const complianceStatus = useMemo(() => {
    if (!device) return null;
    if (device.isBlocked) return 'blocked';
    if (device.currentVersion !== device.targetVersion) return 'outdated';
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

  /* ── Compliance badge config ─────────────────────────── */
  const complianceConfig = {
    compliant: {
      icon: '✓',
      ring: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
      dot: 'bg-emerald-400',
      label: 'Compliant',
      desc: 'Device meets required version policy'
    },
    outdated: {
      icon: '!',
      ring: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
      dot: 'bg-amber-400',
      label: 'Outdated',
      desc: device ? `Running ${device.currentVersion}, target is ${device.targetVersion}` : ''
    },
    blocked: {
      icon: '✕',
      ring: 'bg-red-500/15 border-red-500/30 text-red-300',
      dot: 'bg-red-400',
      label: 'Blocked',
      desc: 'Device blocked due to policy or repeated failures'
    }
  };
  const cc = complianceConfig[complianceStatus] || complianceConfig.outdated;

  /* ── Skeleton ──────────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-56 rounded-xl animate-shimmer" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-52 rounded-xl animate-shimmer" />
          <div className="h-52 rounded-xl animate-shimmer" />
        </div>
        <div className="h-64 rounded-xl animate-shimmer" />
      </div>
    );
  }

  if (!device) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800/60 bg-slate-900/50 p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900 text-3xl">📱</div>
        <h2 className="text-lg font-bold text-slate-100">Device Not Found</h2>
        <p className="mt-2 text-sm text-slate-500">The device with ID <code className="text-indigo-400">{deviceId}</code> could not be found.</p>
        <Button variant="secondary" className="mt-6" onClick={() => navigate('/')}>
          ← Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between animate-fadeInDown">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/25 to-blue-600/15 border border-indigo-500/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-indigo-400" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" /><circle cx="12" cy="17" r="1" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">{device.name}</h1>
            <p className="mt-0.5 font-mono text-xs text-slate-500">{device.id}</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7-7-7 7" /><path d="M12 5v14" /></svg>
          Dashboard
        </Button>
      </div>

      {/* ── Info + Compliance ──────────────────────────── */}
      <div className="grid gap-5 md:grid-cols-2">

        {/* Device Information */}
        <Card title="Device Information" className="animate-fadeInUp stagger-1">
          <dl>
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
              <InfoRow key={label} label={label} value={value} />
            ))}

            <div className="flex items-center justify-between pt-2">
              <dt className="text-xs text-slate-500 font-medium">Update Status</dt>
              <dd><StatusBadge status={device.updateStatus} /></dd>
            </div>
          </dl>
        </Card>

        {/* Compliance */}
        <Card
          title="Compliance Status"
          badge={role === 'ADMIN' && (
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-widest text-indigo-300 uppercase">
              Admin View
            </span>
          )}
          className="animate-fadeInUp stagger-2"
        >
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            {/* Big compliance circle */}
            <div className={`relative flex h-20 w-20 items-center justify-center rounded-full border-2 text-3xl font-bold ${cc.ring}`}>
              {cc.icon}
              {/* Outer ping for live states */}
              {complianceStatus !== 'compliant' && (
                <span className={`absolute inset-0 rounded-full opacity-20 animate-pulseSoft ${cc.ring.split(' ')[0]}`} />
              )}
            </div>

            <div className="text-center">
              <div className={`text-lg font-bold ${cc.ring.split(' ')[2]}`}>{cc.label}</div>
              <div className="mt-1 text-xs text-slate-500">{cc.desc}</div>
            </div>

            {/* Mini version pills */}
            {complianceStatus === 'outdated' && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-700/30 bg-amber-900/15 px-4 py-2">
                <span className="font-mono text-sm font-bold text-amber-300">{device.currentVersion}</span>
                <svg className="h-4 w-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                <span className="font-mono text-sm font-bold text-emerald-300">{device.targetVersion}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Audit Timeline ─────────────────────────────── */}
      <div className="animate-fadeInUp stagger-3">
        <UpdateAuditTimeline attempts={updateAuditAttempts} />
      </div>

      {/* ── Update History Timeline ────────────────────── */}
      <div className="animate-fadeInUp stagger-4">
        <Card title="Update History Timeline">
          <Timeline items={timelineItems} />
        </Card>
      </div>
    </div>
  );
}