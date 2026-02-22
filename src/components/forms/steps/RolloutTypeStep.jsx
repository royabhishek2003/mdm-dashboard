export default function RolloutTypeStep({ form, updateField, role }) {
  const isAdmin = role === 'ADMIN';

  return (
    <div className="space-y-6">

      <h3 className="text-sm font-semibold text-slate-100">
        Rollout Type
      </h3>

      {/* Immediate */}
      <OptionCard
        title="Immediate Rollout"
        description="Starts deployment instantly"
        selected={form.rolloutType === 'immediate'}
        onClick={() => updateField('rolloutType', 'immediate')}
      />

      {/* Scheduled */}
      <OptionCard
        title="Scheduled Rollout"
        description="Start rollout at a specific time"
        selected={form.rolloutType === 'scheduled'}
        onClick={() => updateField('rolloutType', 'scheduled')}
      />

      {/* 🔥 Show Date/Time Picker */}
      {form.rolloutType === 'scheduled' && (
        <div className="ml-2 space-y-2">
          <label className="block text-xs text-slate-400">
            Select Start Date & Time
          </label>

          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) =>
              updateField('scheduledAt', e.target.value)
            }
            className="w-full rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      )}

      {/* Phased */}
      <OptionCard
        title="Phased Rollout"
        description="Gradually deploy in percentage batches"
        selected={form.rolloutType === 'phased'}
        onClick={() => updateField('rolloutType', 'phased')}
      />

      {/* 🔥 Show Phased Controls */}
      {form.rolloutType === 'phased' && (
  <div className="ml-2 grid grid-cols-2 gap-4">

    {/* Percentage */}
    <div>
      <label className="block text-xs text-slate-400 mb-1">
        Percentage per Batch
      </label>
      <input
        type="number"
        min="1"
        max="100"
        value={form.phasedPercentage}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const value = parseInt(e.target.value || 0, 10);

          // clamp between 1–100
          const clamped = Math.max(1, Math.min(100, value));

          updateField('phasedPercentage', clamped);
        }}
        className="w-full rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2 text-xs text-slate-100"
      />
    </div>

    {/* Interval */}
    <div>
      <label className="block text-xs text-slate-400 mb-1">
        Interval (minutes)
      </label>
      <input
        type="number"
        min="1"
        value={form.phasedIntervalMinutes}
        onFocus={(e) => e.target.select()}
        onChange={(e) => {
          const value = parseInt(e.target.value || 0, 10);

          // minimum 1 minute
          const safeValue = Math.max(1, value);

          updateField('phasedIntervalMinutes', safeValue);
        }}
        className="w-full rounded-md border border-slate-700 bg-slate-900/40 px-3 py-2 text-xs text-slate-100"
      />
    </div>

  </div>
)}


    </div>
  );
}

/* -----------------------------------
   Reusable Option Card
------------------------------------ */
function OptionCard({
  title,
  description,
  selected,
  onClick,
  danger = false
}) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer rounded-lg border p-4 transition ${
        selected
          ? danger
            ? 'border-red-500 bg-red-900/20'
            : 'border-brand-500 bg-brand-500/10'
          : 'border-slate-700 bg-slate-900/40'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-100">
            {title}
          </p>
          <p className="text-xs text-slate-400">
            {description}
          </p>
        </div>

        <div
          className={`h-4 w-4 rounded border ${
            selected
              ? danger
                ? 'bg-red-500 border-red-500'
                : 'bg-brand-500 border-brand-500'
              : 'border-slate-600'
          }`}
        />
      </div>
    </div>
  );
}