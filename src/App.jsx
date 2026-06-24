import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom';
import Upload from './pages/Upload';
import Dashboard from './pages/Dashboard';
import OLTs from './pages/OLTs';
import Ports from './pages/Ports';
import Duplicates from './pages/Duplicates';
import Inactive from './pages/Inactive';
import Layout from './components/Layout';
import RequireData from './components/RequireData';

function WithLayout({ children }) {
  return (
    <RequireData>
      <Layout>{children}</Layout>
    </RequireData>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Upload />} />
        <Route path="/dashboard" element={<WithLayout><Dashboard /></WithLayout>} />
        <Route path="/olts" element={<WithLayout><OLTs /></WithLayout>} />
        <Route path="/ports" element={<WithLayout><Ports /></WithLayout>} />
        <Route path="/duplicates" element={<WithLayout><Duplicates /></WithLayout>} />
        <Route path="/inactive" element={<WithLayout><Inactive /></WithLayout>} />
      </Routes>
    </BrowserRouter>
  );
}
