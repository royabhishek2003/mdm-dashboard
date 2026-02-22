import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  logout,
  selectCurrentUser
} from '../features/auth/authSlice.js';
import { useTheme } from '../app/ThemeContext.jsx';

/* ─── Icons (inline SVG) ─────────────────────────────── */
const icons = {
  dashboard: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  rollout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  ),
  history: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  audit: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  logout: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  lock: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
};

/* ─── Role Badge Colors ─────────────────────────────── */
const roleBadge = {
  ADMIN: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  OPS: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  ANALYST: 'bg-slate-600/40 text-slate-300 border-slate-600/50'
};

/* ─── NavLink renderer ──────────────────────────────── */
function SideNavLink({ to, icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        [
          'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive
            ? 'nav-link-active'
            : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
        ].join(' ')
      }
    >
      <span className="flex-shrink-0 transition-colors duration-200">{icon}</span>
      {label}
    </NavLink>
  );
}

export default function MainLayout() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  if (!user) return null;

  const isReadOnly = user.role === 'ANALYST';
  const isAdmin = user.role === 'ADMIN';

  const initials = (user.name || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen text-slate-100" style={{ backgroundColor: 'var(--color-bg)' }}>

      {/* ── Sidebar ─────────────────────────────────────── */}
      <aside className="mdm-sidebar relative flex h-screen w-64 flex-col border-r border-slate-800/60 bg-slate-950 animate-slideInLeft sticky top-0">

        {/* Subtle gradient top accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 via-blue-500 to-transparent" />

        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-[10px] font-bold shadow-lg shadow-indigo-900/40">
            MDM
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400 dot-pulse" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-slate-100">
              Operations
            </div>
            <div className="text-[11px] font-medium text-slate-500">
              Fleet &amp; Rollout Control
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

        {/* Nav */}
        <nav className="mt-4 flex-1 overflow-y-auto space-y-0.5 px-3 text-sm pb-2">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
            Navigation
          </p>

          <SideNavLink to="/" icon={icons.dashboard} label="Dashboard" end />

          {!isReadOnly ? (
            <>
              <SideNavLink to="/rollouts" icon={icons.rollout} label="Rollouts" />
              <SideNavLink to="/rollout-history" icon={icons.history} label="Rollout History" />
            </>
          ) : (
            <>
              {[
                { label: 'Rollouts', icon: icons.rollout },
                { label: 'Rollout History', icon: icons.history }
              ].map(item => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 cursor-not-allowed"
                >
                  <span className="flex-shrink-0 opacity-50">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  <span className="opacity-40">{icons.lock}</span>
                </div>
              ))}
            </>
          )}

          {isAdmin && (
            <SideNavLink to="/audit-logs" icon={icons.audit} label="Audit Logs" />
          )}
        </nav>

        {/* User footer */}
        <div className="border-t border-slate-800/60 p-3">
          <div className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-slate-800/40 transition-colors duration-200">
            {/* Avatar */}
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-xs font-bold text-white shadow">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-slate-200">{user.name}</div>
              <span className={`mt-0.5 inline-flex items-center rounded border px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wider ${roleBadge[user.role]}`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Sign out"
              className="flex-shrink-0 rounded-md p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors duration-200"
            >
              {icons.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────── */}
      <div className="mdm-main-bg flex flex-1 flex-col min-w-0">

        {/* Top header */}
        <header className="mdm-header flex items-center justify-between border-b border-slate-800/60 bg-slate-950/80 px-6 py-3 backdrop-blur-sm sticky top-0 z-10 animate-fadeInDown">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 dot-pulse" />
            <span className="text-sm font-semibold text-slate-200">
              MDM Operations Overview
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold ${roleBadge[user.role]}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {user.role}
            </span>

            {/* ── Theme Toggle ─────────────────────────────── */}
            <button
              onClick={toggle}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="theme-toggle-btn"
              aria-label="Toggle theme"
            >
              <div className="thumb">
                {theme === 'dark' ? '🌙' : '☀️'}
              </div>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="animate-fadeIn">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}