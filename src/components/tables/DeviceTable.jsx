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
  { value: 'all', label: 'All Status' },
  { value: 'updated', label: 'Updated' },
  { value: 'outdated', label: 'Outdated' },
  { value: 'failed', label: 'Failed' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'installing', label: 'Installing' }
];

/* ── Small reusable filter select ─────────────────────── */
function FilterSelect({ value, onChange, children, className = '' }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`rounded-lg border border-slate-700/60 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-colors duration-150 appearance-none cursor-pointer hover:border-slate-600 ${className}`}
    >
      {children}
    </select>
  );
}

/* ── Sort icon ────────────────────────────────────────── */
function SortIcon({ field, sortField, sortDirection }) {
  if (field !== sortField) return (
    <svg className="ml-1 inline h-3 w-3 text-slate-600" viewBox="0 0 16 16" fill="currentColor">
      <path d="M5 4l3-3 3 3M5 12l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
  return (
    <svg className="ml-1 inline h-3 w-3 text-indigo-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      {sortDirection === 'asc'
        ? <path d="M8 12V4M4 8l4-4 4 4" />
        : <path d="M8 4v8M4 8l4 4 4-4" />}
    </svg>
  );
}

export default function DeviceTable({ devices = [], selectedRegion, onRowClick }) {
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [versionFilter, setVersionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('All');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const toggleSort = field => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const resetFilters = () => {
    setSearch(''); setRegionFilter('All'); setVersionFilter('All');
    setStatusFilter('all'); setGroupFilter('All');
  };

  const filteredDevices = useMemo(() => {
    let rows = [...devices];
    if (selectedRegion) rows = rows.filter(d => d.region === selectedRegion);
    if (regionFilter !== 'All') rows = rows.filter(d => d.region === regionFilter);
    if (groupFilter !== 'All') rows = rows.filter(d => d.deviceGroup === groupFilter);
    if (versionFilter !== 'All') rows = rows.filter(d => d.currentVersion === versionFilter);
    if (statusFilter !== 'all') rows = rows.filter(d => {
      if (statusFilter === 'inactive') return isInactiveSinceDays(d.lastSeen, new Date(), 7);
      return d.updateStatus?.toLowerCase() === statusFilter;
    });
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(d => d.id.toLowerCase().includes(q) || d.name.toLowerCase().includes(q));
    }
    rows.sort((a, b) => {
      let av = a[sortField], bv = b[sortField];
      if (sortField === 'lastSeen') { av = new Date(av).getTime(); bv = new Date(bv).getTime(); }
      if (sortField === 'currentVersion') return sortDirection === 'asc' ? compareVersions(av, bv) : compareVersions(bv, av);
      av = typeof av === 'string' ? av.toLowerCase() : av;
      bv = typeof bv === 'string' ? bv.toLowerCase() : bv;
      if (av < bv) return sortDirection === 'asc' ? -1 : 1;
      if (av > bv) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [devices, selectedRegion, search, regionFilter, versionFilter, statusFilter, groupFilter, sortField, sortDirection]);

  useEffect(() => { setPage(1); },
    [search, regionFilter, versionFilter, statusFilter, groupFilter, selectedRegion]);

  const totalPages = Math.ceil(filteredDevices.length / pageSize);
  const paginatedDevices = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredDevices.slice(start, start + pageSize);
  }, [filteredDevices, page, pageSize]);

  const hasActiveFilters = search || regionFilter !== 'All' || versionFilter !== 'All' || statusFilter !== 'all' || groupFilter !== 'All';

  const COLUMNS = [
    ['id', 'Device ID'],
    ['name', 'Name'],
    ['region', 'Region'],
    ['deviceGroup', 'Group'],
    ['os', 'OS'],
    ['currentVersion', 'Current'],
    ['targetVersion', 'Target'],
    ['updateStatus', 'Status'],
    ['lastSeen', 'Last Seen']
  ];

  const nonSortable = new Set(['updateStatus', 'targetVersion']);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800/60 bg-slate-900/50 shadow-xl">

      {/* ── Filter Bar ─────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-800/60 bg-slate-900/80 px-4 py-3">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by ID or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-44 rounded-lg border border-slate-700/60 bg-slate-800/70 py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/15 transition-colors duration-150"
          />
        </div>

        <FilterSelect value={regionFilter} onChange={setRegionFilter}>
          <option value="All">All Regions</option>
          {DEVICE_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </FilterSelect>

        <FilterSelect value={groupFilter} onChange={setGroupFilter}>
          <option value="All">All Groups</option>
          {DEVICE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
        </FilterSelect>

        <FilterSelect value={versionFilter} onChange={setVersionFilter}>
          <option value="All">All Versions</option>
          {DEVICE_VERSIONS.map(v => <option key={v} value={v}>{v}</option>)}
        </FilterSelect>

        <FilterSelect value={statusFilter} onChange={setStatusFilter}>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </FilterSelect>

        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/70 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-600 hover:bg-slate-700/60 transition-colors duration-150"
          >
            <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
            Clear
          </button>
        )}

        <div className="ml-auto flex items-center gap-3">
          {selectedRegion && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
              {selectedRegion}
            </span>
          )}
          <span className="text-[11px] text-slate-500">
            <span className="font-semibold text-slate-300">{filteredDevices.length}</span> devices
          </span>
        </div>
      </div>

      {/* ── Empty State ─────────────────────────────────── */}
      {filteredDevices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
            <span className="text-3xl">📱</span>
          </div>
          <p className="text-sm font-medium text-slate-300">No devices match current filters</p>
          <p className="mt-1 text-xs text-slate-600">Try adjusting filters or clearing the region selection</p>
          <button
            onClick={resetFilters}
            className="mt-4 rounded-lg border border-slate-700/60 bg-slate-800 px-4 py-2 text-xs text-slate-300 hover:bg-slate-700 transition-colors"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* ── Table ────────────────────────────────────── */}
          <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
            <table className="min-w-full text-left">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-slate-800/80 bg-slate-900/95 backdrop-blur-sm">
                  {COLUMNS.map(([field, label]) => (
                    <th
                      key={field}
                      onClick={() => !nonSortable.has(field) && toggleSort(field)}
                      className={`whitespace-nowrap px-4 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500 transition-colors duration-150 ${!nonSortable.has(field) ? 'cursor-pointer select-none hover:text-slate-300' : ''
                        } ${sortField === field ? 'text-indigo-400' : ''}`}
                    >
                      {label}
                      {!nonSortable.has(field) && (
                        <SortIcon field={field} sortField={sortField} sortDirection={sortDirection} />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/40">
                {paginatedDevices.map((d, idx) => (
                  <tr
                    key={d.id}
                    onClick={() => onRowClick?.(d)}
                    className="table-row-hover cursor-pointer group animate-fadeIn"
                    style={{ animationDelay: `${idx * 20}ms`, animationFillMode: 'both' }}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-[11px] text-slate-400 group-hover:text-indigo-300 transition-colors duration-150">{d.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors duration-150">{d.name}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{d.region}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{d.deviceGroup}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">{d.os}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-slate-200">{d.currentVersion}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-500">{d.targetVersion}</span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={d.updateStatus} />
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-500">
                      {formatDateTime(d.lastSeen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ───────────────────────────────── */}
          <div className="flex items-center justify-between border-t border-slate-800/60 bg-slate-900/60 px-4 py-3">
            <span className="text-[11px] text-slate-500">
              Page <span className="font-semibold text-slate-300">{page}</span> of <span className="font-semibold text-slate-300">{totalPages}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded-lg border border-slate-700/60 bg-slate-800/70 px-3 py-1 text-xs text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-600/10 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
              >← Prev</button>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="rounded-lg border border-slate-700/60 bg-slate-800/70 px-3 py-1 text-xs text-slate-300 hover:border-indigo-500/40 hover:bg-indigo-600/10 hover:text-indigo-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
              >Next →</button>

              <FilterSelect value={pageSize} onChange={v => { setPageSize(Number(v)); setPage(1); }} className="w-20">
                <option value={10}>10 / pg</option>
                <option value={20}>20 / pg</option>
                <option value={50}>50 / pg</option>
              </FilterSelect>
            </div>
          </div>
        </>
      )}
    </div>
  );
}