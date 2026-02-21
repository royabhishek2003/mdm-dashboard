import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  logout,
  selectCurrentUser
} from '../features/auth/authSlice.js';

const navLinkClasses = ({ isActive }) =>
  [
    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-slate-800 text-white'
      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
  ].join(' ');

export default function MainLayout() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  if (!user) {
    return null;
  }

  const isReadOnly = user.role === 'ANALYST';
  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-slate-800 bg-slate-950/90">
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold">
            MDM
          </div>
          <div>
            <div className="text-sm font-semibold">
              Operations Dashboard
            </div>
            <div className="text-[11px] text-slate-400">
              Fleet & Rollout Control
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 space-y-1 px-3 text-sm">
          <NavLink to="/" end className={navLinkClasses}>
            Dashboard
          </NavLink>

          {/* Rollouts */}
          {/* Rollouts */}
{!isReadOnly ? (
  <>
    <NavLink to="/rollouts" className={navLinkClasses}>
      Rollouts
    </NavLink>

    <NavLink to="/rollout-history" className={navLinkClasses}>
      Rollout History
    </NavLink>
  </>
) : (
  <>
    <div className="rounded-md px-3 py-2 text-sm text-slate-500 cursor-not-allowed">
      Rollouts (Restricted)
    </div>

    <div className="rounded-md px-3 py-2 text-sm text-slate-500 cursor-not-allowed">
      Rollout History (Restricted)
    </div>
  </>
)}

          {/* 🔐 Audit Logs (ADMIN only) */}
          {isAdmin && (
            <NavLink to="/audit-logs" className={navLinkClasses}>
              Audit Logs
            </NavLink>
          )}
        </nav>

        {/* User Section */}
        <div className="border-t border-slate-800 px-4 py-3 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-[11px] text-slate-400">
                {user.role}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-md bg-slate-800 px-2 py-1 text-[11px] text-slate-200 hover:bg-slate-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-6 py-3">
          <div className="text-sm font-semibold text-slate-100">
            MDM Operations Overview
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px]">
              Role: <span className="font-semibold">{user.role}</span>
            </span>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}