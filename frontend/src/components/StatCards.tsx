import { Users, FileSpreadsheet, Award } from 'lucide-react';
import type { AuthorStats } from '../lib/types.ts';

const cards = [
  { key: 'authors', label: 'Total Authors', icon: Users, iconBg: 'bg-indigo-50 text-indigo-600', darkIconBg: 'dark:bg-indigo-500/10 dark:text-indigo-400' },
  { key: 'posts', label: 'Total Posts', icon: FileSpreadsheet, iconBg: 'bg-emerald-50 text-emerald-600', darkIconBg: 'dark:bg-emerald-500/10 dark:text-emerald-400' },
  { key: 'top', label: 'Top Contributor', icon: Award, iconBg: 'bg-amber-50 text-amber-600', darkIconBg: 'dark:bg-amber-500/10 dark:text-amber-400' },
] as const;

export function StatCards({ analytics }: { analytics: AuthorStats }) {
  const values = {
    authors: analytics.totalAuthors,
    posts: analytics.totalPosts,
    top: analytics.topAuthor
      ? `${analytics.topAuthor.name} (${analytics.topAuthor.postCount})`
      : 'No Active Authors',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {cards.map(({ key, label, icon: Icon, iconBg, darkIconBg }) => (
        <div
          key={key}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center space-x-3.5"
        >
          <div className={`p-2.5 rounded-lg ${iconBg} ${darkIconBg}`}>
            <Icon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {label}
            </p>
            <h4
              className={`font-bold text-slate-800 dark:text-slate-100 truncate ${
                key === 'top' ? 'text-sm' : 'text-xl'
              }`}
              title={key === 'top' ? values.top : undefined}
            >
              {values[key]}
            </h4>
          </div>
        </div>
      ))}
    </div>
  );
}
