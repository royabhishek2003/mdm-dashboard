import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../features/auth/authSlice.js';
import {
  selectAuthStatus,
  selectAuthError
} from '../features/auth/authSlice.js';
import Button from '../components/common/Button.jsx';

const ROLES = [
  { value: 'ANALYST', label: 'Analyst (Read-only)' },
  { value: 'OPS', label: 'Operations (Schedule updates)' },
  { value: 'ADMIN', label: 'Admin (Full access)' }
];

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const [username, setUsername] = useState('');
  const [role, setRole] = useState('ANALYST');
  const [localError, setLocalError] = useState(null);

  const isSubmitting = status === 'loading';

  const handleSubmit = async e => {
    e.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername || trimmedUsername.length < 2) {
      setLocalError('Username must be at least 2 characters.');
      return;
    }

    setLocalError(null);

    try {
      await dispatch(
        login({ username: trimmedUsername, role })
      ).unwrap();

      navigate('/');
    } catch (_err) {
      // handled via Redux
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-brand-600 text-2xl font-bold text-white">
            MDM
          </div>
          <h1 className="text-xl font-bold text-slate-100">
            MDM Operations Dashboard
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to manage your device fleet
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-xs font-medium text-slate-300">
              Role
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:border-brand-500 focus:outline-none"
              disabled={isSubmitting}
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Local Validation Error */}
          {localError && (
            <div className="rounded-md border border-red-700/60 bg-red-900/20 px-3 py-2 text-xs text-red-200">
              {localError}
            </div>
          )}

          {/* API Error */}
          {error && (
            <div className="rounded-md border border-red-700/60 bg-red-900/20 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-4 text-center text-[11px] text-slate-400">
          This is a demo application. Select any role to continue.
        </p>
      </div>
    </div>
  );
}