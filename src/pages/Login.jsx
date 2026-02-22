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
  { value: 'ANALYST', label: 'Analyst', desc: 'Read-only access', color: 'text-slate-300' },
  { value: 'OPS', label: 'Operations', desc: 'Schedule updates', color: 'text-blue-300' },
  { value: 'ADMIN', label: 'Admin', desc: 'Full access', color: 'text-indigo-300' }
];

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const status = useSelector(selectAuthStatus);
  const error = useSelector(selectAuthError);

  const [username, setUsername] = useState('');
  const [role, setRole] = useState('ANALYST');
  const [localError, setLocalError] = useState(null);
  const [focused, setFocused] = useState(null);

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
      await dispatch(login({ username: trimmedUsername, role })).unwrap();
      navigate('/');
    } catch (_err) { /* handled via Redux */ }
  };

  const displayError = localError || error;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950">

      {/* ── Ambient background ───────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/8 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-purple-600/5 blur-[80px]" />
        {/* Grid lines */}
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(148,163,184,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.025) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      {/* ── Card ─────────────────────────────────────────── */}
      <div className="relative w-full max-w-md animate-scaleIn">
        <div className="overflow-hidden rounded-2xl border border-slate-800/60 bg-slate-900/80 shadow-2xl shadow-black/60 backdrop-blur-xl">

          {/* Top gradient bar */}
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500" />

          <div className="p-8">

            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-5 relative w-16 h-16">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-xl font-bold text-white shadow-lg shadow-indigo-900/50">
                  MDM
                </div>
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 opacity-30 blur-lg" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight gradient-text">
                MDM Operations
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Sign in to manage your device fleet
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div className="animate-fadeInUp stagger-1">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Username
                </label>
                <div className={`relative rounded-xl border transition-all duration-200 ${focused === 'username'
                    ? 'border-indigo-500/60 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]'
                    : 'border-slate-700/60'
                  } bg-slate-800/60`}>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    onFocus={() => setFocused('username')}
                    onBlur={() => setFocused(null)}
                    placeholder="Enter your username"
                    className="w-full rounded-xl bg-transparent px-4 py-3 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none"
                    disabled={isSubmitting}
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Role */}
              <div className="animate-fadeInUp stagger-2">
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ROLES.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      disabled={isSubmitting}
                      className={`rounded-xl border px-3 py-3 text-left transition-all duration-200 focus:outline-none ${role === r.value
                          ? 'border-indigo-500/60 bg-indigo-600/15 shadow-[0_0_0_1px_rgba(99,102,241,0.3)]'
                          : 'border-slate-700/60 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/70'
                        }`}
                    >
                      <div className={`text-xs font-semibold ${role === r.value ? 'text-indigo-300' : 'text-slate-200'}`}>
                        {r.label}
                      </div>
                      <div className="mt-0.5 text-[10px] text-slate-500 leading-tight">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {displayError && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-700/40 bg-red-900/20 px-4 py-3 animate-scaleIn">
                  <svg className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-xs text-red-300">{displayError}</p>
                </div>
              )}

              {/* Submit */}
              <div className="animate-fadeInUp stagger-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`btn-glow w-full rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${!isSubmitting ? 'hover:from-indigo-500 hover:to-blue-500' : ''
                    }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Signing in…
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                    </span>
                  )}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-[11px] text-slate-600">
              Demo application — select any role to continue
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}