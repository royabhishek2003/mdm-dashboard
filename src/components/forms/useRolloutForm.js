import { useMemo, useState } from 'react';
import { compareVersions } from '../../utils/versionUtils.js';

export function useRolloutForm(devices) {
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({
    fromVersion: '',
    toVersion: '',
    region: 'All',
    deviceGroup: 'All',
    rolloutType: 'scheduled', // default safe value
    scheduledAt: '',
    phasedPercentage: 25,
    phasedIntervalMinutes: 30,
    mandatory: false
  });

  const updateField = (name, value) => {
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /* -----------------------------------
     Matching Devices Count
  ------------------------------------ */
  const matchingDevicesCount = useMemo(() => {
    return devices.filter(d => {
      if (form.region !== 'All' && d.region !== form.region) return false;
      if (form.deviceGroup !== 'All' && d.deviceGroup !== form.deviceGroup) return false;
      if (form.fromVersion && d.currentVersion !== form.fromVersion) return false;
      return true;
    }).length;
  }, [
    devices,
    form.region,
    form.deviceGroup,
    form.fromVersion
  ]);

  /* -----------------------------------
     Downgrade Check
  ------------------------------------ */
  const isDowngrade =
    form.fromVersion &&
    form.toVersion &&
    compareVersions(form.toVersion, form.fromVersion) <= 0;

  /* -----------------------------------
     Reset Helper (Very Useful After Submit)
  ------------------------------------ */
  const resetForm = () => {
    setForm({
      fromVersion: '',
      toVersion: '',
      region: 'All',
      deviceGroup: 'All',
      rolloutType: 'scheduled',
      scheduledAt: '',
      phasedPercentage: 25,
      phasedIntervalMinutes: 30,
      mandatory: false
    });
    setStep(0);
  };

  return {
    step,
    setStep,
    form,
    updateField,
    matchingDevicesCount,
    isDowngrade,
    resetForm
  };
}