import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Mail, FileText, Pencil, X, Check } from 'lucide-react';
import { useState } from 'react';
import { useAuthors } from '../hooks/useAuthors.ts';
import { updatePost, updateAuthor } from '../lib/api.ts';
import type { Author } from '../lib/types.ts';

function PostCard({ postId, title, content, onSave }: {
  postId: number;
  title: string;
  content: string;
  onSave: (id: number, data: { title: string; content: string }) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [draftContent, setDraftContent] = useState(content);

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700 shadow-xs">
        <div className="flex items-start justify-between gap-2">
          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">{title}</h5>
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-slate-300 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-colors shrink-0"
            title="Edit post"
          >
            <Pencil size={13} />
          </button>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{content}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 shadow-xs space-y-2">
      <input
        type="text" value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)}
        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-100"
      />
      <textarea
        rows={2} value={draftContent} onChange={(e) => setDraftContent(e.target.value)}
        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 dark:text-slate-100 resize-none"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setIsEditing(false)}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          title="Cancel"
        >
          <X size={13} />
        </button>
        <button
          onClick={() => {
            if (!draftTitle.trim() || !draftContent.trim()) return;
            onSave(postId, { title: draftTitle.trim(), content: draftContent.trim() });
            setIsEditing(false);
          }}
          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
          title="Save"
        >
          <Check size={13} />
        </button>
      </div>
    </div>
  );
}

export function AuthorDetail() {
  const { id } = useParams();
  const authorId = Number(id);
  const queryClient = useQueryClient();
  const { data: authors = [], isLoading, error } = useAuthors();

  const author: Author | undefined = authors.find((a) => a.id === authorId);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['authors'] });

  const updatePostMutation = useMutation({
    mutationFn: ({ postId, data }: { postId: number; data: { title: string; content: string } }) =>
      updatePost(postId, data),
    onSuccess: (_data, variables) => {
      toast.success(`Post #${variables.postId} updated!`);
      invalidate();
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const updateAuthorMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => updateAuthor(id, { name }),
    onSuccess: () => {
      toast.success('Author updated!');
      invalidate();
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-indigo-600 mx-auto dark:text-indigo-400" size={40} />
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/40 p-6 rounded-2xl max-w-sm text-center shadow-sm">
          <h3 className="text-md font-bold text-slate-900 dark:text-slate-100 mt-2">Author not found</h3>
          <Link to="/" className="inline-block mt-4 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 mb-6">
          <ArrowLeft size={14} /> Back to dashboard
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl text-indigo-600 dark:text-indigo-400">
              <FileText size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{author.name}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Mail size={12} /> {author.email}
                {author.age != null && <span className="ml-2 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">{author.age} yrs</span>}
              </p>
            </div>
          </div>
          <input
            type="text" defaultValue={author.name}
            placeholder="New author name"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim() && e.currentTarget.value.trim() !== author.name) {
                updateAuthorMutation.mutate({ id: author.id, name: e.currentTarget.value.trim() });
              }
            }}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 dark:text-slate-100"
          />
          <p className="text-[10px] text-slate-400 mt-1.5">Press Enter to rename the author.</p>
        </div>

        <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase px-2 mb-3">
          Published Materials ({author.posts.length})
        </h3>
        <div className="space-y-2">
          {author.posts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center text-slate-400 text-sm">
              This author hasn't published any posts yet.
            </div>
          ) : (
            author.posts.map((post) => (
              <PostCard
                key={post.id}
                postId={post.id}
                title={post.title}
                content={post.content}
                onSave={(postId, data) => updatePostMutation.mutate({ postId, data })}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
