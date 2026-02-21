export default function VersionStep({
  form,
  updateField,
  versions,
  isDowngrade
}) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label>From Version</label>
          <select
            value={form.fromVersion}
            onChange={(e) => updateField('fromVersion', e.target.value)}
            className="mt-1 w-full rounded border bg-slate-900 px-2 py-1"
          >
            <option value="">Select</option>
            {versions.map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </div>

        <div>
          <label>To Version</label>
          <select
            value={form.toVersion}
            onChange={(e) => updateField('toVersion', e.target.value)}
            className="mt-1 w-full rounded border bg-slate-900 px-2 py-1"
          >
            <option value="">Select</option>
            {versions.map(v => (
              <option key={v}>{v}</option>
            ))}
          </select>

          {isDowngrade && (
            <p className="text-red-400 text-xs mt-1">
              Cannot downgrade version.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}