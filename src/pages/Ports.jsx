import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadData } from '../utils/storage';

const STATUS_LABELS = {
  overloaded: { label: '⚠ Overloaded', cls: 'bg-red-100 text-red-700' },
  underloaded: { label: '↓ Underloaded', cls: 'bg-yellow-100 text-yellow-700' },
  normal: { label: '✓ Normal', cls: 'bg-green-100 text-green-700' },
};

export default function Ports() {
  const data = loadData();
  const [searchParams] = useSearchParams();
  const initialOlt = searchParams.get('olt') || '';

  const [statusFilter, setStatusFilter] = useState('all');
  const [oltFilter, setOltFilter] = useState(initialOlt);
  const [sortKey, setSortKey] = useState('total');
  const [sortDir, setSortDir] = useState('desc');

  const olts = useMemo(() => [...new Set(data.ports.map(p => p.olt))].sort(), [data.ports]);

  const filtered = useMemo(() => {
    let rows = data.ports;
    if (statusFilter !== 'all') rows = rows.filter(p => p.status === statusFilter);
    if (oltFilter) rows = rows.filter(p => p.olt === oltFilter);
    return [...rows].sort((a, b) => {
      const va = parseFloat(a[sortKey]) || 0;
      const vb = parseFloat(b[sortKey]) || 0;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  }, [data.ports, statusFilter, oltFilter, sortKey, sortDir]);

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  function SortTh({ label, k }) {
    return (
      <th
        className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
        onClick={() => handleSort(k)}
      >
        {label} {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </th>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">PON Port Load</h2>
      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="all">All statuses</option>
          <option value="overloaded">⚠ Overloaded (&gt;64)</option>
          <option value="normal">✓ Normal (10–64)</option>
          <option value="underloaded">↓ Underloaded (&lt;10)</option>
        </select>
        <select
          value={oltFilter}
          onChange={e => setOltFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="">All OLTs</option>
          {olts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <span className="self-center text-sm text-gray-500">{filtered.length} ports</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">OLT</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">PON Port</th>
                <SortTh label="Total" k="total" />
                <SortTh label="Active" k="active" />
                <SortTh label="Inactive" k="inactive" />
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-xs text-gray-600 font-mono">{p.olt}</td>
                  <td className="px-4 py-2 text-xs text-gray-700 font-mono">{p.port}</td>
                  <td className="px-4 py-2 font-semibold">{p.total}</td>
                  <td className="px-4 py-2 text-green-700">{p.active}</td>
                  <td className="px-4 py-2 text-red-500">{p.inactive}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_LABELS[p.status].cls}`}>
                      {STATUS_LABELS[p.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
