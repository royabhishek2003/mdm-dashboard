export default function ReviewStep({ form, matchingDevicesCount }) {
  return (
    <div className="space-y-2 text-sm">
      <div>From: {form.fromVersion}</div>
      <div>To: {form.toVersion}</div>
      <div>Region: {form.region}</div>
      <div>Group: {form.deviceGroup}</div>
      <div>Rollout: {form.rolloutType}</div>
      <div>Devices: {matchingDevicesCount}</div>
    </div>
  );
}