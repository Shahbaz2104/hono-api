import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'sonner';
import { LogOut } from 'lucide-react';
import { Dashboard } from './pages/Dashboard.tsx';
import { AuthorDetail } from './pages/AuthorDetail.tsx';
import { Login } from './pages/Login.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { clearToken, isAuthed } from './lib/auth.ts';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const authed = isAuthed() && location.pathname !== '/login';

  const handleLogout = () => {
    clearToken();
    toast.success('Signed out.');
    navigate('/login');
  };

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            <span className="bg-indigo-600 text-white rounded-lg px-2 py-1 text-xs">📚</span>
            Publisher CMS
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider hidden sm:inline">
              Hono · Drizzle · Postgres
            </span>
            {authed && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
              >
                <LogOut size={13} /> Logout
              </button>
            )}
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/author/:id" element={<AuthorDetail />} />
        </Route>
      </Routes>
    </>
  );
}
