import { useState } from 'react';
import { X } from 'lucide-react';
import type { Author, NewAuthor } from '../lib/types.ts';

interface EditAuthorModalProps {
  author: Author;
  onClose: () => void;
  onSubmit: (data: NewAuthor) => void;
  isPending: boolean;
}

export function EditAuthorModal({ author, onClose, onSubmit, isPending }: EditAuthorModalProps) {
  const [name, setName] = useState(author.name);
  const [email, setEmail] = useState(author.email);
  const [age, setAge] = useState(author.age != null ? String(author.age) : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    const parsedAge = age.trim() === '' ? undefined : Number(age);
    onSubmit({ name: name.trim(), email: email.trim(), age: parsedAge });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-5 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Edit Author</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
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
          <div className="flex gap-2 pt-1">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={isPending}
              className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition-colors disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
