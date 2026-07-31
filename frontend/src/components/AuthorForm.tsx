import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import type { NewAuthor } from '../lib/types.ts';

interface AuthorFormProps {
  initial?: Partial<NewAuthor>;
  submitLabel?: string;
  onSubmit: (data: NewAuthor) => void;
  isPending: boolean;
}

export function AuthorForm({ initial, submitLabel = 'Register Author', onSubmit, isPending }: AuthorFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [age, setAge] = useState(initial?.age != null ? String(initial.age) : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const parsedAge = age.trim() === '' ? undefined : Number(age);
    onSubmit({ name: name.trim(), email: email.trim(), age: parsedAge });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <UserPlus size={16} className="text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Add Author</h3>
      </div>
      <input
        type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required
        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100"
      />
      <input
        type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required
        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100"
      />
      <input
        type="number" placeholder="Age (Optional 18+)" value={age} onChange={(e) => setAge(e.target.value)}
        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100"
      />
      <button
        type="submit" disabled={isPending}
        className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition-colors disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  );
}
