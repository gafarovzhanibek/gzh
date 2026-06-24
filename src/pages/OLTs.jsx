import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadData } from '../utils/storage';

export default function OLTs() {
  const data = loadData();
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState('total');
  const [sortDir, setSortDir] = useState('desc');

  const olts = [...data.olts].sort((a, b) => {
    const va = parseFloat(a[sortKey]) || 0;
    const vb = parseFloat(b[sortKey]) || 0;
    return sortDir === 'asc' ? va - vb : vb - va;
  });

  function handleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  function SortTh({ label, k }) {
    const active = sortKey === k;
    return (
      <th
        className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 select-none"
        onClick={() => handleSort(k)}
      >
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </th>
    );
  }

  function rowClass(pct) {
    const p = parseFloat(pct);
    if (p < 50) return 'bg-red-50 hover:bg-red-100';
    if (p < 80) return 'bg-yellow-50 hover:bg-yellow-100';
    return 'hover:bg-gray-50';
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">OLTs</h2>
      <div className="flex gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded inline-block"></span> Active &lt; 50%</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-100 rounded inline-block"></span> Active &lt; 80%</span>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">OLT</th>
                <SortTh label="Total" k="total" />
                <SortTh label="Active" k="active" />
                <SortTh label="Active %" k="activePct" />
                <SortTh label="Inactive" k="inactive" />
                <SortTh label="Ports" k="portCount" />
                <SortTh label="Avg/Port" k="avgPerPort" />
                <SortTh label="Max/Port" k="maxOnPort" />
                <SortTh label="Duplicates" k="duplicates" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {olts.map(row => (
                <tr
                  key={row.olt}
                  className={`${rowClass(row.activePct)} cursor-pointer`}
                  onClick={() => navigate(`/ports?olt=${encodeURIComponent(row.olt)}`)}
                >
                  <td className="px-4 py-2 font-mono text-xs text-gray-700">{row.olt}</td>
                  <td className="px-4 py-2 font-semibold">{row.total}</td>
                  <td className="px-4 py-2 text-green-700">{row.active}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      parseFloat(row.activePct) < 50 ? 'bg-red-200 text-red-800'
                      : parseFloat(row.activePct) < 80 ? 'bg-yellow-200 text-yellow-800'
                      : 'bg-green-100 text-green-700'
                    }`}>
                      {row.activePct}%
                    </span>
                  </td>
                  <td className="px-4 py-2 text-red-600">{row.inactive}</td>
                  <td className="px-4 py-2">{row.portCount}</td>
                  <td className="px-4 py-2">{row.avgPerPort}</td>
                  <td className="px-4 py-2">{row.maxOnPort}</td>
                  <td className="px-4 py-2">
                    {row.duplicates > 0 && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">{row.duplicates}</span>
                    )}
                    {row.duplicates === 0 && <span className="text-gray-300">—</span>}
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
