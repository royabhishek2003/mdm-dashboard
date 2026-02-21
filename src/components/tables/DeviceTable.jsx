import React, { useMemo, useState, useEffect } from 'react';
import StatusBadge from '../common/StatusBadge.jsx';
import {
  DEVICE_REGIONS,
  DEVICE_VERSIONS,
  DEVICE_GROUPS
} from '../../mocks/generateDevices.js';
import { formatDateTime, isInactiveSinceDays } from '../../utils/dateUtils.js';
import { compareVersions } from '../../utils/versionUtils.js';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'updated', label: 'Updated' },
  { value: 'outdated', label: 'Outdated' },
  { value: 'failed', label: 'Failed' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'installing', label: 'Installing' }
];

export default function DeviceTable({
  devices = [],
  selectedRegion,
  onRowClick
}) {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [versionFilter, setVersionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('All');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // ✅ Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const toggleSort = field => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const resetFilters = () => {
    setSearch('');
    setRegionFilter('All');
    setVersionFilter('All');
    setStatusFilter('all');
    setGroupFilter('All');
  };

  const filteredDevices = useMemo(() => {
    let rows = [...devices];

    if (selectedRegion) {
      rows = rows.filter(d => d.region === selectedRegion);
    }

    if (regionFilter !== 'All') {
      rows = rows.filter(d => d.region === regionFilter);
    }

    if (groupFilter !== 'All') {
      rows = rows.filter(d => d.deviceGroup === groupFilter);
    }

    if (versionFilter !== 'All') {
      rows = rows.filter(d => d.currentVersion === versionFilter);
    }

    if (statusFilter !== 'all') {
      rows = rows.filter(d => {
        if (statusFilter === 'inactive') {
          return isInactiveSinceDays(d.lastSeen, new Date(), 7);
        }
        return d.updateStatus?.toLowerCase() === statusFilter;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        d =>
          d.id.toLowerCase().includes(q) ||
          d.name.toLowerCase().includes(q)
      );
    }

    rows.sort((a, b) => {
      let av = a[sortField];
      let bv = b[sortField];

      if (sortField === 'lastSeen') {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      }

      if (sortField === 'currentVersion') {
        return sortDirection === 'asc'
          ? compareVersions(av, bv)
          : compareVersions(bv, av);
      }

      av = typeof av === 'string' ? av.toLowerCase() : av;
      bv = typeof bv === 'string' ? bv.toLowerCase() : bv;

      if (av < bv) return sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return rows;
  }, [
    devices,
    selectedRegion,
    search,
    regionFilter,
    versionFilter,
    statusFilter,
    groupFilter,
    sortField,
    sortDirection
  ]);

  // ✅ Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, regionFilter, versionFilter, statusFilter, groupFilter, selectedRegion]);

  // ✅ Pagination calculation
  const totalPages = Math.ceil(filteredDevices.length / pageSize);

  const paginatedDevices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredDevices.slice(start, start + pageSize);
  }, [filteredDevices, page, pageSize]);

  const sortIcon = field =>
    sortField === field ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅';

  return (
    <div className="mt-4 rounded-lg border border-slate-800 bg-slate-900/40">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 border-b border-slate-800 px-4 py-3 text-xs">
        <input
          type="text"
          placeholder="Search device..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-40 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs"
        />

        <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1">
          <option value="All">All Regions</option>
          {DEVICE_REGIONS.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select value={groupFilter} onChange={e => setGroupFilter(e.target.value)} className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1">
          <option value="All">All Groups</option>
          {DEVICE_GROUPS.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>

        <select value={versionFilter} onChange={e => setVersionFilter(e.target.value)} className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1">
          <option value="All">All Versions</option>
          {DEVICE_VERSIONS.map(v => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1">
          {STATUS_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button
          onClick={resetFilters}
          className="rounded-md bg-slate-800 px-2 py-1 text-[11px] hover:bg-slate-700"
        >
          Reset
        </button>

        <div className="ml-auto text-slate-400">
          {filteredDevices.length} devices
        </div>
      </div>

      {/* Empty State */}
      {filteredDevices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <div className="text-5xl mb-4">📱</div>
          <p className="text-sm">No devices match current filters</p>
          <p className="text-xs mt-2 text-slate-500">
            Try adjusting filters or region selection
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="max-h-[450px] overflow-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-900/90">
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wide text-slate-400">
                  {[
                    ['id', 'ID'],
                    ['name', 'Name'],
                    ['region', 'Region'],
                    ['deviceGroup', 'Group'],
                    ['os', 'OS'],
                    ['currentVersion', 'Current'],
                    ['targetVersion', 'Target'],
                    ['updateStatus', 'Status'],
                    ['lastSeen', 'Last Seen']
                  ].map(([field, label]) => (
                    <th
                      key={field}
                      className="cursor-pointer px-3 py-2"
                      onClick={() =>
                        field !== 'updateStatus' &&
                        field !== 'targetVersion' &&
                        toggleSort(field)
                      }
                    >
                      {label}{' '}
                      {field !== 'updateStatus' &&
                        field !== 'targetVersion' && (
                          <span className="text-[10px]">
                            {sortIcon(field)}
                          </span>
                        )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedDevices.map(d => (
                  <tr
                    key={d.id}
                    className="cursor-pointer border-b border-slate-800/60 hover:bg-slate-800/40"
                    onClick={() => onRowClick?.(d)}
                  >
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-300">{d.id}</td>
                    <td className="px-3 py-2 text-slate-100">{d.name}</td>
                    <td className="px-3 py-2 text-slate-300">{d.region}</td>
                    <td className="px-3 py-2 text-slate-300">{d.deviceGroup}</td>
                    <td className="px-3 py-2 text-slate-300">{d.os}</td>
                    <td className="px-3 py-2 text-slate-300">{d.currentVersion}</td>
                    <td className="px-3 py-2 text-slate-300">{d.targetVersion}</td>
                    <td className="px-3 py-2">
                      <StatusBadge status={d.updateStatus} />
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {formatDateTime(d.lastSeen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-400 border-t border-slate-800">
            <div>
              Page {page} of {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-2 py-1 border rounded disabled:opacity-40"
              >
                Prev
              </button>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-2 py-1 border rounded disabled:opacity-40"
              >
                Next
              </button>

              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="ml-2 px-2 py-1 border rounded bg-slate-800"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
}