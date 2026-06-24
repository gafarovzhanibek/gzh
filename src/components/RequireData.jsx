import { Navigate } from 'react-router-dom';
import { loadData } from '../utils/storage';

export default function RequireData({ children }) {
  const data = loadData();
  if (!data) return <Navigate to="/" replace />;
  return children;
}
