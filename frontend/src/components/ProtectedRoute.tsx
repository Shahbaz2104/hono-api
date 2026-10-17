import { Navigate, Outlet } from 'react-router-dom';
import { isAuthed } from '../lib/auth.ts';

export function ProtectedRoute() {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  return <Outlet />;
}
