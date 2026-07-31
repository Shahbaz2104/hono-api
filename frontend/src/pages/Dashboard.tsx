import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useAuthors } from '../hooks/useAuthors.ts';
import { computeAnalytics } from '../lib/analytics.ts';
import { createAuthor, createPost, deleteAuthor, updateAuthor } from '../lib/api.ts';
import type { Author } from '../lib/types.ts';
import { StatCards } from '../components/StatCards.tsx';
import { AuthorForm } from '../components/AuthorForm.tsx';
import { PostForm } from '../components/PostForm.tsx';
import { AuthorList } from '../components/AuthorList.tsx';
import { EditAuthorModal } from '../components/EditAuthorModal.tsx';
import { useState } from 'react';

export function Dashboard() {
  const queryClient = useQueryClient();
  const { data: authors = [], isLoading, error } = useAuthors();
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['authors'] });

  const addAuthorMutation = useMutation({
    mutationFn: createAuthor,
    onMutate: () => ({ toastId: toast.loading('Registering author...') }),
    onSuccess: (_data, variables, context) => {
      toast.dismiss(context?.toastId);
      toast.success(`Author "${variables.name}" registered!`);
      invalidate();
    },
    onError: (err, _variables, context) => {
      toast.dismiss(context?.toastId);
      toast.error(`Error: ${err.message}`);
    },
  });

  const addPostMutation = useMutation({
    mutationFn: createPost,
    onMutate: () => ({ toastId: toast.loading('Publishing post...') }),
    onSuccess: (_data, variables, context) => {
      toast.dismiss(context?.toastId);
      toast.success(`"${variables.title}" published!`);
      invalidate();
    },
    onError: (err, _variables, context) => {
      toast.dismiss(context?.toastId);
      toast.error(`Error: ${err.message}`);
    },
  });

  const updateAuthorMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof updateAuthor>[1] }) =>
      updateAuthor(id, data),
    onSuccess: (_data, variables) => {
      toast.success(`Author #${variables.id} updated!`);
      setEditingAuthor(null);
      invalidate();
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  const deleteAuthorMutation = useMutation({
    mutationFn: async (author: Author) => {
      await deleteAuthor(author.id);
      return author;
    },
    onSuccess: (author) => {
      toast.success(`Removed "${author.name}" and their history.`);
      invalidate();
    },
    onError: (err) => toast.error(`Error: ${err.message}`),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-2">
          <Loader2 className="animate-spin text-indigo-600 mx-auto dark:text-indigo-400" size={40} />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Calculating Core Ledger Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/40 p-6 rounded-2xl max-w-sm text-center shadow-sm">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-md font-bold text-slate-900 dark:text-slate-100 mt-2">Network Error</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ensure your Hono backend is running on port 3000.</p>
        </div>
      </div>
    );
  }

  const analytics = computeAnalytics(authors);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 mb-6 text-center sm:text-left sm:flex sm:items-center sm:space-x-4">
          <div className="mx-auto sm:mx-0 bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-xl inline-block text-indigo-600 dark:text-indigo-400">
            <span className="block w-8 h-8 flex items-center justify-center font-bold">📚</span>
          </div>
          <div className="mt-4 sm:mt-0">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Publisher CMS Dashboard</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Relational data network running on Hono, Drizzle, and Postgres</p>
          </div>
        </div>

        <StatCards analytics={analytics} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
            <AuthorForm onSubmit={(data) => addAuthorMutation.mutate(data)} isPending={addAuthorMutation.isPending} />
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-5">
            <PostForm authors={authors} onSubmit={(data) => addPostMutation.mutate(data)} isPending={addPostMutation.isPending} />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase px-2">System Core Ledger</h3>
          <AuthorList
            authors={authors}
            onDelete={(author) => {
              toast.warning(`Wipe author and all nested posts?`, {
                action: {
                  label: 'Delete All',
                  onClick: () => deleteAuthorMutation.mutate(author),
                },
              });
            }}
            onEdit={setEditingAuthor}
          />
        </div>

        {editingAuthor && (
          <EditAuthorModal
            author={editingAuthor}
            onClose={() => setEditingAuthor(null)}
            isPending={updateAuthorMutation.isPending}
            onSubmit={(data) => updateAuthorMutation.mutate({ id: editingAuthor.id, data })}
          />
        )}
      </div>
    </div>
  );
}
