import { useState, useMemo } from 'react';
import { loadData } from '../utils/storage';
import { exportToExcel } from '../utils/exporter';

const COLS = [
  { header: 'Serial Number', key: 'Serial Number' },
  { header: 'Абонент', key: 'Абонент' },
  { header: 'OLT', key: 'OLT' },
  { header: 'PON Port', key: 'PON Port' },
  { header: 'Модель', key: 'Модель' },
];

export default function Inactive() {
  const data = loadData();
  const [oltFilter, setOltFilter] = useState('');

  const dupSerialSet = useMemo(() => new Set(data.dupSerials.map(r => r['Serial Number'])), [data.dupSerials]);
  const olts = useMemo(() => [...new Set(data.inactive.map(r => r['OLT']))].sort(), [data.inactive]);

  const rows = useMemo(() => {
    let r = data.inactive;
    if (oltFilter) r = r.filter(row => row['OLT'] === oltFilter);
    return r.map(row => ({ ...row, _isDup: dupSerialSet.has(row['Serial Number']) }));
  }, [data.inactive, oltFilter, dupSerialSet]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Inactive ONTs</h2>
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={oltFilter}
          onChange={e => setOltFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="">All OLTs</option>
          {olts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <span className="text-sm text-gray-500">{rows.length} records</span>
        <button
          onClick={() => exportToExcel(rows, COLS, 'inactive_onts.xlsx')}
          className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
        >
          Export Excel
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {COLS.map(c => (
                  <th key={c.key} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">{c.header}</th>
                ))}
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Duplicate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => (
                <tr key={i} className={row._isDup ? 'bg-orange-50' : 'hover:bg-gray-50'}>
                  {COLS.map(c => (
                    <td key={c.key} className="px-4 py-2 text-xs text-gray-700 font-mono">{row[c.key]}</td>
                  ))}
                  <td className="px-4 py-2">
                    {row._isDup && <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">Dup</span>}
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
