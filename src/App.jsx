import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import {
  selectIsAuthenticated,
  selectCurrentRole
} from './features/auth/authSlice.js';

import MainLayout from './layouts/MainLayout.jsx';
import AuditLogs from './pages/AuditLogs.jsx';
import RolloutHistory from './pages/RolloutHistory.jsx';

const Dashboard = React.lazy(() => import('./pages/Dashboard.jsx'));
const Rollouts = React.lazy(() => import('./pages/Rollouts.jsx'));
const DeviceDetail = React.lazy(() => import('./pages/DeviceDetail.jsx'));
const Login = React.lazy(() => import('./pages/Login.jsx'));

function RouteLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-950 text-slate-400">
      Loading...
    </div>
  );
}

function ProtectedRoute({ children, allowedRoles }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectCurrentRole);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(15,23,42,0.95)',
            color: '#f1f5f9',
            border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: '12px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1)',
            fontSize: '13px',
            fontFamily: 'Inter, system-ui, sans-serif',
            padding: '12px 16px',
          },
          success: {
            iconTheme: { primary: '#34D399', secondary: '#022c22' },
            style: { borderColor: 'rgba(52,211,153,0.3)' },
          },
          error: {
            iconTheme: { primary: '#F87171', secondary: '#450a0a' },
            style: { borderColor: 'rgba(248,113,113,0.3)' },
          },
        }}
      />
      <Routes>
        {/* Login Route */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<RouteLoader />}>
              <Login />
            </Suspense>
          }
        />

        {/* Protected Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route
            index
            element={
              <Suspense fallback={<RouteLoader />}>
                <Dashboard />
              </Suspense>
            }
          />

          {/* Rollouts (OPS + ADMIN only) */}
          <Route
            path="rollouts"
            element={
              <ProtectedRoute allowedRoles={['OPS', 'ADMIN']}>
                <Suspense fallback={<RouteLoader />}>
                  <Rollouts />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* 🔐 Audit Logs (ADMIN only) */}
          <Route
            path="audit-logs"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Suspense fallback={<RouteLoader />}>
                  <AuditLogs />
                </Suspense>
              </ProtectedRoute>
            }
          />

          <Route
            path="rollout-history"
            element={
              <ProtectedRoute allowedRoles={['OPS', 'ADMIN']}>
                <Suspense fallback={<RouteLoader />}>
                  <RolloutHistory />
                </Suspense>
              </ProtectedRoute>
            }
          />

          {/* Device Detail */}
          <Route
            path="devices/:deviceId"
            element={
              <Suspense fallback={<RouteLoader />}>
                <DeviceDetail />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </>
  );
}