// import React, { useMemo } from 'react';
// import Button from '../common/Button.jsx';

// function canSchedule(role) {
//   return role === 'OPS' || role === 'ADMIN';
// }

// function formatStatus(status) {
//   if (!status) return 'Scheduled';
//   return status.replace('_', ' ');
// }

// function getStatusBadge(status) {
//   const map = {
//     scheduled: 'bg-brand-500/20 text-brand-300',
//     in_progress: 'bg-blue-500/20 text-blue-300',
//     completed: 'bg-emerald-500/20 text-emerald-300',
//     cancelled: 'bg-slate-600/20 text-slate-300',
//     pending_approval: 'bg-yellow-500/20 text-yellow-300' // ✅ added
//   };

//   return map[status] || map.scheduled;
// }

// export default function ActiveRolloutCard({
//   rollout,
//   role,
//   onPause,
//   onResume,
//   onCancel,
//   onShowFailed,
//   onApprove // ✅ new prop
// }) {
//   const {
//     id,
//     name,
//     status,
//     fromVersion,
//     toVersion,
//     region,
//     deviceGroup,
//     totalDevices,
//     mandatory,
//     isPaused,
//     stages = {},
//     createdByRole,
//     scheduleType,
//     phasedPercentage,
//     phasedIntervalMinutes,
//     currentPhase,
//     remainingDevices
//   } = rollout;

//   const {
//     scheduled = 0,
//     notified = 0,
//     downloading = 0,
//     installing = 0,
//     completed = 0,
//     failed = 0
//   } = stages;

//   const progressPercent = useMemo(() => {
//     if (!totalDevices) return 0;
//     return Math.round(((completed + failed) / totalDevices) * 100);
//   }, [completed, failed, totalDevices]);

//   const scheduleAllowed = canSchedule(role);
//   const isAnalyst = role === 'ANALYST';
//   const isPhased = scheduleType === 'phased';
//   const isPending = status === 'pending_approval';

//   const showPause =
//     !isPending &&
//     !isPaused &&
//     status !== 'completed' &&
//     status !== 'cancelled';

//   const showResume =
//     !isPending &&
//     isPaused &&
//     status !== 'completed' &&
//     status !== 'cancelled';

//   const showCancel =
//     !isPending &&
//     status !== 'completed' &&
//     status !== 'cancelled';

//   const showApprove =
//     isPending && role === 'ADMIN';

//   return (
//     <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs">

//       {/* Header */}
//       <div className="mb-3 flex items-start justify-between">
//         <div>
//           <div className="flex flex-wrap items-center gap-2">
//             <h4 className="text-sm font-semibold text-slate-100">
//               {name}
//             </h4>

//             <span
//               className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBadge(
//                 status
//               )}`}
//             >
//               {formatStatus(status)}
//             </span>

//             {mandatory && (
//               <span className="rounded-full bg-red-900/40 px-2 py-0.5 text-[10px] text-red-200">
//                 Mandatory
//               </span>
//             )}

//             {isPaused && !isPending && (
//               <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
//                 Paused
//               </span>
//             )}

//             {isPhased && (
//               <span className="rounded-full bg-purple-900/40 px-2 py-0.5 text-[10px] text-purple-200">
//                 Phased
//               </span>
//             )}
//           </div>

//           <p className="mt-1 text-[11px] text-slate-400">
//             {fromVersion} → {toVersion} • {region} •{' '}
//             {deviceGroup} • {totalDevices} devices
//           </p>

//           {role === 'ADMIN' && (
//             <p className="mt-1 text-[10px] text-slate-500">
//               Created by: {createdByRole}
//             </p>
//           )}
//         </div>

//         {/* Actions */}
//         <div className="flex gap-2">

//           {showApprove && (
//             <Button
//               variant="primary"
//               onClick={() => onApprove(id)}
//             >
//               Approve
//             </Button>
//           )}

//           {showPause && (
//             <Button
//               variant="secondary"
//               onClick={() => onPause(id)}
//               disabled={!scheduleAllowed}
//               title={
//                 isAnalyst
//                   ? 'Read-only access'
//                   : !scheduleAllowed
//                   ? 'Requires OPS or ADMIN role'
//                   : ''
//               }
//             >
//               Pause
//             </Button>
//           )}

//           {showResume && (
//             <Button
//               variant="primary"
//               onClick={() => onResume(id)}
//               disabled={!scheduleAllowed}
//               title={
//                 isAnalyst
//                   ? 'Read-only access'
//                   : !scheduleAllowed
//                   ? 'Requires OPS or ADMIN role'
//                   : ''
//               }
//             >
//               Resume
//             </Button>
//           )}

//           {showCancel && (
//             <Button
//               variant="danger"
//               onClick={() => {
//                 if (
//                   window.confirm(
//                     'Are you sure you want to cancel this rollout?'
//                   )
//                 ) {
//                   onCancel(id);
//                 }
//               }}
//               disabled={!scheduleAllowed}
//               title={
//                 isAnalyst
//                   ? 'Read-only access'
//                   : !scheduleAllowed
//                   ? 'Requires OPS or ADMIN role'
//                   : ''
//               }
//             >
//               Cancel
//             </Button>
//           )}
//         </div>
//       </div>

//       {/* Phased Info */}
//       {isPhased && !isPending && (
//         <div className="mb-3 rounded-md bg-purple-900/20 p-2 text-[11px] text-purple-200">
//           <div>
//             Phase: <span className="font-semibold">{currentPhase}</span>
//           </div>
//           <div>
//             Batch Size: {phasedPercentage}% every{' '}
//             {phasedIntervalMinutes}s (simulated)
//           </div>
//           <div>
//             Remaining Devices: {remainingDevices}
//           </div>
//         </div>
//       )}

//       {/* Progress */}
//       {!isPending && (
//         <>
//           <div className="mb-3">
//             <div className="flex justify-between text-[10px] text-slate-400">
//               <span>Progress</span>
//               <span>{progressPercent}%</span>
//             </div>
//             <div className="mt-1 h-2 w-full rounded bg-slate-800">
//               <div
//                 className="h-2 rounded bg-emerald-500 transition-all duration-300"
//                 style={{ width: `${progressPercent}%` }}
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-6 gap-2 rounded-md bg-slate-900/40 p-2 text-[11px]">
//             <Stage label="Scheduled" value={scheduled} />
//             <Stage label="Notified" value={notified} />
//             <Stage label="Downloading" value={downloading} />
//             <Stage label="Installing" value={installing} />
//             <Stage label="Completed" value={completed} highlight="text-emerald-400" />
//             <Stage
//               label="Failed"
//               value={failed}
//               highlight="text-red-400"
//               isClickable={failed > 0}
//               onClick={() => failed > 0 && onShowFailed?.(rollout)}
//             />
//           </div>
//         </>
//       )}

//       {isPending && (
//         <div className="mt-3 text-yellow-300 text-[11px]">
//           Waiting for ADMIN approval before execution.
//         </div>
//       )}
//     </div>
//   );
// }

// function Stage({
//   label,
//   value,
//   highlight = '',
//   isClickable = false,
//   onClick
// }) {
//   const content = (
//     <>
//       <div className={`font-semibold ${highlight}`}>
//         {value}
//       </div>
//       <div className="text-[10px] text-slate-400">
//         {label}
//       </div>
//     </>
//   );

//   if (isClickable) {
//     return (
//       <button
//         onClick={onClick}
//         className="text-center hover:opacity-80"
//       >
//         {content}
//       </button>
//     );
//   }

//   return <div className="text-center">{content}</div>;
// }





import React, { useMemo } from 'react';
import Button from '../common/Button.jsx';

function canSchedule(role) {
  return role === 'OPS' || role === 'ADMIN';
}

function formatStatus(status) {
  if (!status) return 'Scheduled';
  return status.replace('_', ' ');
}

function getStatusBadge(status) {
  const map = {
    scheduled: 'bg-brand-500/20 text-brand-300',
    in_progress: 'bg-blue-500/20 text-blue-300',
    completed: 'bg-emerald-500/20 text-emerald-300',
    cancelled: 'bg-slate-600/20 text-slate-300',
    pending_approval: 'bg-yellow-500/20 text-yellow-300'
  };

  return map[status] || map.scheduled;
}

export default function ActiveRolloutCard({
  rollout,
  role,
  onPause,
  onResume,
  onCancel,
  onShowFailed,
  onApprove
}) {
  const {
    id,
    name,
    status,
    fromVersion,
    toVersion,
    region,
    deviceGroup,
    totalDevices,
    mandatory,
    isPaused,
    stages = {},
    createdByRole,
    scheduleType,
    phasedPercentage,
    phasedIntervalMinutes,
    currentPhase,
    remainingDevices,
    auditLogs = []
  } = rollout;

  const {
    scheduled = 0,
    notified = 0,
    downloading = 0,
    installing = 0,
    completed = 0,
    failed = 0
  } = stages;

  const progressPercent = useMemo(() => {
    if (!totalDevices) return 0;
    return Math.round(((completed + failed) / totalDevices) * 100);
  }, [completed, failed, totalDevices]);

  const scheduleAllowed = canSchedule(role);
  const isAnalyst = role === 'ANALYST';
  const isPhased = scheduleType === 'phased';
  const isPending = status === 'pending_approval';

  const showPause =
    !isPending &&
    !isPaused &&
    status !== 'completed' &&
    status !== 'cancelled';

  const showResume =
    !isPending &&
    isPaused &&
    status !== 'completed' &&
    status !== 'cancelled';

  const showCancel =
    !isPending &&
    status !== 'completed' &&
    status !== 'cancelled';

  const showApprove =
    isPending && role === 'ADMIN';

  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-4 text-xs">

      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-100">
              {name}
            </h4>

            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBadge(
                status
              )}`}
            >
              {formatStatus(status)}
            </span>

            {mandatory && (
              <span className="rounded-full bg-red-900/40 px-2 py-0.5 text-[10px] text-red-200">
                Mandatory
              </span>
            )}

            {isPaused && !isPending && (
              <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] text-slate-300">
                Paused
              </span>
            )}

            {isPhased && (
              <span className="rounded-full bg-purple-900/40 px-2 py-0.5 text-[10px] text-purple-200">
                Phased
              </span>
            )}
          </div>

          <p className="mt-1 text-[11px] text-slate-400">
            {fromVersion} → {toVersion} • {region} •{' '}
            {deviceGroup} • {totalDevices} devices
          </p>

          {role === 'ADMIN' && (
            <p className="mt-1 text-[10px] text-slate-500">
              Created by: {createdByRole}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">

          {showApprove && (
            <Button
              variant="primary"
              onClick={() => onApprove(id)}
            >
              Approve
            </Button>
          )}

          {showPause && (
            <Button
              variant="secondary"
              onClick={() => onPause(id)}
              disabled={!scheduleAllowed}
              title={
                isAnalyst
                  ? 'Read-only access'
                  : !scheduleAllowed
                  ? 'Requires OPS or ADMIN role'
                  : ''
              }
            >
              Pause
            </Button>
          )}

          {showResume && (
            <Button
              variant="primary"
              onClick={() => onResume(id)}
              disabled={!scheduleAllowed}
              title={
                isAnalyst
                  ? 'Read-only access'
                  : !scheduleAllowed
                  ? 'Requires OPS or ADMIN role'
                  : ''
              }
            >
              Resume
            </Button>
          )}

          {showCancel && (
            <Button
              variant="danger"
              onClick={() => {
                if (
                  window.confirm(
                    'Are you sure you want to cancel this rollout?'
                  )
                ) {
                  onCancel(id);
                }
              }}
              disabled={!scheduleAllowed}
              title={
                isAnalyst
                  ? 'Read-only access'
                  : !scheduleAllowed
                  ? 'Requires OPS or ADMIN role'
                  : ''
              }
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Phased Info */}
      {isPhased && !isPending && (
        <div className="mb-3 rounded-md bg-purple-900/20 p-2 text-[11px] text-purple-200">
          <div>
            Phase: <span className="font-semibold">{currentPhase}</span>
          </div>
          <div>
            Batch Size: {phasedPercentage}% every{' '}
            {phasedIntervalMinutes}s (simulated)
          </div>
          <div>
            Remaining Devices: {remainingDevices}
          </div>
        </div>
      )}

      {/* Progress */}
      {!isPending && (
        <>
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="mt-1 h-2 w-full rounded bg-slate-800">
              <div
                className="h-2 rounded bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </>
      )}

    </div>
  );
}