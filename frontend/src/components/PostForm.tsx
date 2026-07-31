import { useState } from 'react';
import { FileText } from 'lucide-react';
import type { Author, NewPost } from '../lib/types.ts';

interface PostFormProps {
  authors: Author[];
  selectedAuthorId?: string;
  submitLabel?: string;
  onSubmit: (data: NewPost) => void;
  isPending: boolean;
}

export function PostForm({ authors, selectedAuthorId = '', submitLabel = 'Publish Post', onSubmit, isPending }: PostFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorId, setAuthorId] = useState(selectedAuthorId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !authorId) return;
    onSubmit({ title: title.trim(), content: content.trim(), authorId: Number(authorId) });
    setTitle('');
    setContent('');
    setAuthorId('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <FileText size={16} className="text-emerald-500" />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Publish Article</h3>
      </div>
      <select
        value={authorId} onChange={(e) => setAuthorId(e.target.value)} required
        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100 cursor-pointer"
      >
        <option value="">Assign to Author...</option>
        {authors.map((author) => (
          <option key={author.id} value={author.id}>{author.name}</option>
        ))}
      </select>
      <input
        type="text" placeholder="Article Title" value={title} onChange={(e) => setTitle(e.target.value)} required
        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100"
      />
      <textarea
        placeholder="Write text content here..." value={content} onChange={(e) => setContent(e.target.value)} required rows={2}
        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100 resize-none"
      />
      <button
        type="submit" disabled={isPending}
        className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs transition-colors disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  );
}
