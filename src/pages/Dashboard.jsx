import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { loadData } from '../utils/storage';

function MetricCard({ label, value, sub, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    gray: 'bg-gray-50 border-gray-200 text-gray-700',
  };
  return (
    <div className={`border rounded-xl p-4 ${colors[color]}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
      {sub && <div className="text-xs mt-1 opacity-70">{sub}</div>}
    </div>
  );
}

const PIE_COLORS = ['#22c55e', '#ef4444'];

export default function Dashboard() {
  const data = loadData();
  const { summary, ports, olts } = data;

  const topPorts = useMemo(() =>
    [...ports]
      .sort((a, b) => b.total - a.total)
      .slice(0, 15)
      .map(p => ({ name: `${p.olt.split('.').slice(-2).join('.')}\n${p.port}`, total: p.total, active: p.active })),
    [ports]
  );

  const pieData = [
    { name: 'Active', value: summary.activeCount },
    { name: 'Inactive', value: summary.inactiveCount },
  ];

  const oltTable = useMemo(() =>
    [...olts].sort((a, b) => b.total - a.total),
    [olts]
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total ONTs" value={summary.total.toLocaleString()} color="indigo" />
        <MetricCard
          label="Active ONTs"
          value={summary.activeCount.toLocaleString()}
          sub={`${summary.activePct}% of total`}
          color="green"
        />
        <MetricCard
          label="Inactive ONTs"
          value={summary.inactiveCount.toLocaleString()}
          sub={`${(100 - parseFloat(summary.activePct)).toFixed(1)}% of total`}
          color="red"
        />
        <MetricCard
          label="ONT Id Duplicates"
          value={summary.dupOntId.toLocaleString()}
          color={summary.dupOntId > 0 ? 'yellow' : 'gray'}
        />
        <MetricCard
          label="Serial Duplicates"
          value={summary.dupSerial.toLocaleString()}
          color={summary.dupSerial > 0 ? 'yellow' : 'gray'}
        />
        <MetricCard
          label="Subscriber Duplicates"
          value={summary.dupSubscriber.toLocaleString()}
          color={summary.dupSubscriber > 0 ? 'yellow' : 'gray'}
        />
        <MetricCard label="OLTs" value={summary.oltCount.toLocaleString()} color="blue" />
        <MetricCard label="PON Ports" value={summary.portCount.toLocaleString()} color="blue" />
        <MetricCard
          label="Overloaded Ports"
          value={summary.overloadedPorts.toLocaleString()}
          sub="> 64 ONTs/port"
          color={summary.overloadedPorts > 0 ? 'red' : 'green'}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Top 15 Loaded PON Ports</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPorts} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="total" name="Total ONTs" fill="#6366f1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="active" name="Active ONTs" fill="#22c55e" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Active vs Inactive</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip formatter={(v) => v.toLocaleString()} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* OLT table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">ONT Distribution by OLT</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['OLT', 'Total', 'Active', 'Active %', 'Inactive', 'Ports', 'Avg/Port', 'Max/Port'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {oltTable.map(row => (
                <tr key={row.olt} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs text-gray-700">{row.olt}</td>
                  <td className="px-4 py-2 font-semibold">{row.total}</td>
                  <td className="px-4 py-2 text-green-700">{row.active}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      parseFloat(row.activePct) < 50 ? 'bg-red-100 text-red-700'
                      : parseFloat(row.activePct) < 80 ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                    }`}>
                      {row.activePct}%
                    </span>
                  </td>
                  <td className="px-4 py-2 text-red-600">{row.inactive}</td>
                  <td className="px-4 py-2">{row.portCount}</td>
                  <td className="px-4 py-2">{row.avgPerPort}</td>
                  <td className="px-4 py-2">{row.maxOnPort}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
