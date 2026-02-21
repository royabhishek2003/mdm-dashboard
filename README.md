# MDM Operations Dashboard

A production-grade frontend application for managing Mobile Device Management (MDM) operations, built with React, Redux Toolkit, React Router v6, and Tailwind CSS.

## Features

- **Device Inventory Dashboard**: Real-time KPI cards, region/version charts, and comprehensive device table with filtering
- **Update Scheduling System**: Multi-step form wizard for scheduling device updates with version selection, target filtering, and rollout strategies
- **Active Rollout Monitor**: Real-time tracking of rollout lifecycle stages with pause/resume/cancel controls
- **Device Detail View**: Comprehensive device information with compliance status and audit timeline
- **Role-Based Access Control**: Three-tier permission system (ANALYST, OPS, ADMIN) with UI restrictions
- **Dynamic KPI Calculations**: All metrics computed from device dataset - no hardcoded values
- **Mock Service Layer**: Simulated async APIs using Promise + setTimeout

## Tech Stack

- **React 18.3** (JavaScript)
- **Redux Toolkit** - State management
- **React Router v6** - Routing
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Vite** - Build tool

## Project Structure

```
mdm-operations-dashboard/
├── src/
│   ├── app/
│   │   └── store.js                 # Redux store configuration
│   ├── features/
│   │   ├── devices/
│   │   │   ├── devicesSlice.js      # Devices Redux slice
│   │   │   └── selectors.js         # Memoized selectors for KPIs
│   │   ├── rollouts/
│   │   │   └── rolloutsSlice.js     # Rollouts Redux slice
│   │   └── auth/
│   │       └── authSlice.js          # Authentication Redux slice
│   ├── components/
│   │   ├── common/                  # Reusable UI components
│   │   │   ├── Button.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── FullPageLoader.jsx
│   │   │   └── EmptyState.jsx
│   │   ├── kpi/
│   │   │   └── KpiCard.jsx
│   │   ├── charts/
│   │   │   └── RegionVersionBarChart.jsx
│   │   ├── tables/
│   │   │   └── DeviceTable.jsx
│   │   ├── timeline/
│   │   │   └── Timeline.jsx
│   │   └── forms/
│   │       ├── RolloutForm.jsx
│   │       └── ActiveRolloutMonitor.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx            # Main dashboard page
│   │   ├── Rollouts.jsx             # Rollout management page
│   │   ├── DeviceDetail.jsx         # Device detail view
│   │   └── Login.jsx                # Authentication page
│   ├── layouts/
│   │   └── MainLayout.jsx           # Main application layout
│   ├── services/
│   │   ├── deviceService.js         # Mock device API
│   │   ├── rolloutService.js        # Mock rollout API
│   │   └── authService.js           # Mock auth API
│   ├── mocks/
│   │   └── generateDevices.js      # Device data generator
│   ├── utils/
│   │   ├── dateUtils.js             # Date utility functions
│   │   └── versionUtils.js         # Version comparison utilities
│   ├── App.jsx                      # Root component with routing
│   ├── main.jsx                     # Application entry point
│   └── index.css                    # Global styles
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   # or
   npm start
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview production build**:
   ```bash
   npm run preview
   ```

## Usage

1. **Login**: Navigate to `/login` and select a role:
   - **ANALYST**: Read-only access to view dashboards
   - **OPS**: Can schedule rollouts but cannot approve mandatory updates
   - **ADMIN**: Full access including approval workflows

2. **Dashboard**: View device inventory with KPIs, charts, and filtered table
   - Click on chart bars to filter devices by region
   - Click table rows to view device details

3. **Rollouts**: Schedule and monitor device updates
   - Use the multi-step form to create rollouts
   - Monitor active rollouts with real-time stage updates
   - Pause, resume, or cancel rollouts (based on role permissions)

4. **Device Detail**: View comprehensive device information
   - Device metadata and compliance status
   - Update history timeline
   - Admin-only audit log section

## Key Architecture Decisions

- **Feature-based modular structure**: Organized by domain (devices, rollouts, auth)
- **Memoized selectors**: Using `createSelector` for efficient KPI calculations
- **Mock service layer**: Simulated async operations with 800ms delay
- **Dynamic KPIs**: All metrics computed from device dataset
- **Role-based UI**: Conditional rendering based on user role
- **Real-time simulation**: `setInterval` for rollout stage progression
- **Code splitting**: React.lazy for major page components

## Dependencies

### Production
- `@reduxjs/toolkit`: ^2.2.0
- `react`: ^18.3.0
- `react-dom`: ^18.3.0
- `react-redux`: ^9.1.0
- `react-router-dom`: ^6.22.0
- `recharts`: ^2.10.0

### Development
- `@vitejs/plugin-react`: ^4.0.0
- `autoprefixer`: ^10.4.0
- `postcss`: ^8.4.0
- `tailwindcss`: ^3.4.0
- `vite`: ^5.0.0

## Browser Support

Modern browsers with ES6+ support (Chrome, Firefox, Safari, Edge)

## License

MIT
