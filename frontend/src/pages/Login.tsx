import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2, LogIn, ShieldCheck } from 'lucide-react';
import { login, register } from '../lib/api.ts';
import { setToken } from '../lib/auth.ts';

export function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setIsPending(true);
    const toastId = toast.loading(mode === 'login' ? 'Signing in...' : 'Creating account...');
    try {
      if (mode === 'login') {
        const { token } = await login(email.trim(), password);
        setToken(token);
        toast.success('Welcome back!');
        navigate('/');
      } else {
        await register(email.trim(), password);
        const { token } = await login(email.trim(), password);
        setToken(token);
        toast.success('Account created!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      toast.dismiss(toastId);
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 font-sans">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="mx-auto bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl inline-block text-indigo-600 dark:text-indigo-400 mb-3">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {mode === 'login' ? 'Sign in to Publisher CMS' : 'Create your account'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            JWT secured · Hono · Drizzle · Postgres
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 space-y-3"
        >
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100"
          />
          <input
            type="password"
            placeholder={mode === 'register' ? 'Password (min 8 characters)' : 'Password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={mode === 'register' ? 8 : undefined}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />}
            {mode === 'login' ? 'Sign In' : 'Register'}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="w-full text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 py-1"
          >
            {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
