import React, { useMemo } from 'react';
import Modal from '../common/Modal.jsx';
import Button from '../common/Button.jsx';

function generateMockFailures(count = 0) {
  const reasons = [
    'Network timeout during download',
    'Insufficient storage space',
    'App integrity verification failed',
    'Device offline during install',
    'OS compatibility mismatch'
  ];

  return Array.from({ length: count }).map((_, i) => ({
    id: `DEV-FAIL-${String(i + 1).padStart(4, '0')}`,
    reason: reasons[i % reasons.length],
    stage: 'Installing'
  }));
}

export default function FailedDevicesModal({
  open,
  rollout,
  onClose
}) {
  const failedCount = rollout?.stages?.failed ?? 0;
  const name = rollout?.name ?? '';

  const failedDevices = useMemo(
    () => generateMockFailures(failedCount),
    [failedCount]
  );

  return (
    <Modal
      open={open}
      title={`Failed Devices – ${name}`}
      onClose={onClose}
    >
      <div className="space-y-3 text-xs">
        {/* Summary */}
        <div className="rounded-md bg-red-900/20 p-3 text-red-200">
          <div className="font-semibold">
            {failedCount} device
            {failedCount !== 1 && 's'} failed
          </div>
          <div className="text-[11px] text-red-300">
            Review failure reasons below. You may retry
            after investigation.
          </div>
        </div>

        {/* Failure List */}
        {failedDevices.length === 0 ? (
          <div className="text-slate-400">
            No failed devices recorded.
          </div>
        ) : (
          <div className="max-h-60 overflow-auto rounded-md border border-slate-800">
            <table className="min-w-full text-left text-[11px]">
              <thead className="sticky top-0 bg-slate-900/90">
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="px-3 py-2">Device ID</th>
                  <th className="px-3 py-2">Stage</th>
                  <th className="px-3 py-2">Failure Reason</th>
                </tr>
              </thead>
              <tbody>
                {failedDevices.map(device => (
                  <tr
                    key={device.id}
                    className="border-b border-slate-800/60"
                  >
                    <td className="px-3 py-2 font-mono text-slate-300">
                      {device.id}
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {device.stage}
                    </td>
                    <td className="px-3 py-2 text-red-300">
                      {device.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Actions */}
        {failedDevices.length > 0 && (
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              variant="danger"
              onClick={() =>
                console.log('Retry logic here')
              }
            >
              Retry Failed Devices
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}