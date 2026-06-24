import { NavLink, useNavigate } from 'react-router-dom';
import { loadMeta, clearData } from '../utils/storage';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/olts', label: 'OLTs', icon: '🌐' },
  { to: '/ports', label: 'PON Ports', icon: '🔌' },
  { to: '/duplicates', label: 'Duplicates', icon: '🔁' },
  { to: '/inactive', label: 'Inactive ONTs', icon: '⚠️' },
];

export default function Layout({ children }) {
  const meta = loadMeta();
  const navigate = useNavigate();

  function handleNewFile() {
    clearData();
    navigate('/');
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col fixed top-0 left-0 h-full z-10">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-lg font-bold text-indigo-400">ONT Monitor</h1>
          {meta && (
            <div className="mt-2 text-xs text-gray-400">
              <div className="truncate" title={meta.filename}>{meta.filename}</div>
              <div>{meta.rowCount.toLocaleString()} records</div>
            </div>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleNewFile}
            className="w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left"
          >
            ↩ Upload New File
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="ml-64 flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
}
