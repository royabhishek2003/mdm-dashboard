export default function TargetsStep({
  form,
  updateField,
  regions,
  groups,
  matchingDevicesCount
}) {
  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label>Region</label>
          <select
            value={form.region}
            onChange={(e) => updateField('region', e.target.value)}
            className="mt-1 w-full rounded border bg-slate-900 px-2 py-1"
          >
            <option value="All">All</option>
            {regions.map(r => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Device Group</label>
          <select
            value={form.deviceGroup}
            onChange={(e) => updateField('deviceGroup', e.target.value)}
            className="mt-1 w-full rounded border bg-slate-900 px-2 py-1"
          >
            <option value="All">All</option>
            {groups.map(g => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="text-sm">
        Matching Devices: <strong>{matchingDevicesCount}</strong>
      </div>
    </div>
  );
}