import { Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Dashboard } from './pages/Dashboard.tsx';
import { AuthorDetail } from './pages/AuthorDetail.tsx';

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-100">
            <span className="bg-indigo-600 text-white rounded-lg px-2 py-1 text-xs">📚</span>
            Publisher CMS
          </Link>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            Hono · Drizzle · Postgres
          </span>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/author/:id" element={<AuthorDetail />} />
      </Routes>
    </>
  );
}
