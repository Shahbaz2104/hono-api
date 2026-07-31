import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Trash2, ChevronDown, ChevronUp, FileText, Pencil, Eye } from 'lucide-react';
import type { Author } from '../lib/types.ts';

interface AuthorListProps {
  authors: Author[];
  onDelete: (author: Author) => void;
  onEdit: (author: Author) => void;
}

export function AuthorList({ authors, onDelete, onEdit }: AuthorListProps) {
  const [expandedAuthorId, setExpandedAuthorId] = useState<number | null>(null);

  if (authors.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400 text-sm">
        No relational entries found. Register profiles above to spin up workspace nodes!
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {authors.map((author) => {
        const isExpanded = expandedAuthorId === author.id;
        const hasPosts = author.posts.length > 0;

        return (
          <li key={author.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
            <div
              onClick={() => setExpandedAuthorId(isExpanded ? null : author.id)}
              className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors select-none"
            >
              <div className="flex flex-col space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base">{author.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${author.age ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {author.age ? `${author.age} yrs` : 'Age N/A'}
                  </span>
                  {hasPosts && (
                    <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
                      <FileText size={10} />
                      {author.posts.length} {author.posts.length === 1 ? 'post' : 'posts'}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Mail size={12} />
                  {author.email}
                </span>
              </div>

              <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                <Link
                  to={`/author/${author.id}`}
                  className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                  title="View profile"
                >
                  <Eye size={15} />
                </Link>
                <button
                  onClick={() => onEdit(author)}
                  className="p-1.5 text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors"
                  title="Edit author"
                >
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => onDelete(author)}
                  className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Delete author"
                >
                  <Trash2 size={15} />
                </button>
                <div className="text-slate-400 p-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-md">
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100/80 dark:border-slate-800 p-4 space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                  <FileText size={12} />
                  Published Materials Catalog
                </h4>

                {!hasPosts ? (
                  <p className="text-xs text-slate-400 italic pl-1">This author hasn't published any structural text blocks yet.</p>
                ) : (
                  <div className="space-y-2">
                    {author.posts.map((post) => (
                      <div key={post.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700 shadow-xs">
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">{post.title}</h5>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{post.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
