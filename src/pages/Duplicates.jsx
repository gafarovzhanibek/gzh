import { useState } from 'react';
import { loadData } from '../utils/storage';
import { exportToExcel } from '../utils/exporter';

const COLS = [
  { header: 'Serial Number', key: 'Serial Number' },
  { header: 'Абонент', key: 'Абонент' },
  { header: 'OLT', key: 'OLT' },
  { header: 'PON Port', key: 'PON Port' },
  { header: 'Модель', key: 'Модель' },
];

function DupTable({ rows, filename }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-500">{rows.length} records</span>
        <button
          onClick={() => exportToExcel(rows, COLS, filename)}
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
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, i) => {
                const isInactive = !row['Модель'] || String(row['Модель']).trim() === '';
                return (
                  <tr key={i} className={isInactive ? 'bg-red-50' : 'hover:bg-gray-50'}>
                    {COLS.map(c => (
                      <td key={c.key} className="px-4 py-2 text-xs text-gray-700 font-mono">{row[c.key]}</td>
                    ))}
                    <td className="px-4 py-2">
                      {isInactive && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">Inactive</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function Duplicates() {
  const data = loadData();
  const [tab, setTab] = useState('serial');

  const tabs = [
    { id: 'serial', label: `Serial Duplicates (${data.dupSerials.length})` },
    { id: 'subscriber', label: `Subscriber Duplicates (${data.dupSubscribers.length})` },
    { id: 'all', label: `All (${data.dupSerials.length + data.dupSubscribers.length})` },
  ];

  const rows = tab === 'serial' ? data.dupSerials
    : tab === 'subscriber' ? data.dupSubscribers
    : [...data.dupSerials, ...data.dupSubscribers];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Duplicates</h2>
      <div className="flex gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <DupTable rows={rows} filename={`duplicates_${tab}.xlsx`} />
    </div>
  );
}
