import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Mail, Calendar, Trash2, Users, Loader2, BookOpen, ChevronDown, ChevronUp, FileText, BarChart3, Award, FileSpreadsheet } from 'lucide-react';
import { Toaster, toast } from 'sonner';

interface Post {
  id: number;
  title: string;
  content: string;
}

interface Author {
  id: number;
  name: string;
  email: string;
  age?: number;
  posts: Post[];
}

export default function App() {
  const queryClient = useQueryClient();
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedAuthorId, setSelectedAuthorId] = useState('');
  const [expandedAuthorId, setExpandedAuthorId] = useState<number | null>(null);

  // FETCH CORE DATA
  const { data: authors, isLoading, error } = useQuery<Author[]>({
    queryKey: ['authors'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/author');
      if (!res.ok) throw new Error('Failed to synchronize directory data');
      return res.json();
    }
  });



  
  // --- DERIVED ANALYTICS CALCULATIONS ---
  const totalAuthors = authors?.length || 0;
  const totalPosts = authors?.reduce((sum, author) => sum + (author.posts?.length || 0), 0) || 0;

  let mostActiveAuthor = "No Active Authors";
  let maxPosts = 0;
  authors?.forEach(author => {
    const postCount = author.posts?.length || 0;
    if (postCount > maxPosts) {
      maxPosts = postCount;
      mostActiveAuthor = `${author.name} (${postCount})`;
    }
  });

  // MUTATIONS
  const addAuthorMutation = useMutation({
    mutationFn: async (newAuthor: { name: string; email: string; age?: number }) => {
      const res = await fetch('http://localhost:3000/author', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAuthor),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Validation gate rejected entry');
      }
      return res.json();
    },
    onMutate: () => ({ toastId: toast.loading('Registering author...') }),
    onSuccess: (data, variables, context) => {
      toast.dismiss(context?.toastId);
      toast.success(`Author "${variables.name}" registered!`);
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      setName(''); setEmail(''); setAge('');
    },
    onError: (err, variables, context) => {
      toast.dismiss(context?.toastId);
      toast.error(`Error: ${err.message}`);
    }
  });

  const addPostMutation = useMutation({
    mutationFn: async (newPost: { title: string; content: string; authorId: number }) => {
      const res = await fetch('http://localhost:3000/author/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });
      if (!res.ok) throw new Error('Failed to publish article');
      return res.json();
    },
    onMutate: () => ({ toastId: toast.loading('Publishing post...') }),
    onSuccess: (data, variables, context) => {
      toast.dismiss(context?.toastId);
      toast.success(`"${variables.title}" published!`);
      queryClient.invalidateQueries({ queryKey: ['authors'] });
      setExpandedAuthorId(variables.authorId);
      setTitle(''); setContent(''); setSelectedAuthorId('');
    },
    onError: (err, variables, context) => {
      toast.dismiss(context?.toastId);
      toast.error(`Error: ${err.message}`);
    }
  });

  const deleteAuthorMutation = useMutation({
    mutationFn: async ({ id, authorName }: { id: number; authorName: string }) => {
      const res = await fetch(`http://localhost:3000/author/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Database refused deletion');
      return { id, authorName };
    },
    onSuccess: (data) => {
      toast.success(`Removed "${data.authorName}" and their history.`);
      queryClient.invalidateQueries({ queryKey: ['authors'] });
    },
    onError: (err) => toast.error(`Error: ${err.message}`)
  });

  const handleAuthorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    const parsedAge = age.trim() === "" ? undefined : Number(age);
    addAuthorMutation.mutate({ name, email, age: parsedAge });
  };

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !selectedAuthorId) return;
    addPostMutation.mutate({ title, content, authorId: Number(selectedAuthorId) });
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-2">
        <Loader2 className="animate-spin text-indigo-600 mx-auto" size={40} />
        <p className="text-sm font-medium text-slate-500">Calculating Core Ledger Data...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white border border-rose-100 p-6 rounded-2xl max-w-sm text-center shadow-sm">
        <span className="text-3xl">⚠️</span>
        <h3 className="text-md font-bold text-slate-900 mt-2">Network Error</h3>
        <p className="text-xs text-slate-500 mt-1">Ensure your Hono backend is running on port 3000.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <Toaster position="top-right" richColors closeButton />
      
      <div className="max-w-2xl mx-auto">
        
        {/* Header Component */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6 text-center sm:text-left sm:flex sm:items-center sm:space-x-4">
          <div className="mx-auto sm:mx-0 bg-indigo-50 p-3 rounded-xl inline-block text-indigo-600">
            <BookOpen size={32} />
          </div>
          <div className="mt-4 sm:mt-0">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Publisher CMS Dashboard</h2>
            <p className="text-sm text-slate-500">Relational data network running on Hono, Drizzle, and SQLite</p>
          </div>
        </div>

        {/* --- BRAND NEW ANALYTICS STATS BANNER --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Card 1: Total Authors */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Authors</p>
              <h4 className="text-xl font-bold text-slate-800">{totalAuthors}</h4>
            </div>
          </div>

          {/* Card 2: Total Posts */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Posts</p>
              <h4 className="text-xl font-bold text-slate-800">{totalPosts}</h4>
            </div>
          </div>

          {/* Card 3: Most Productive Contributor */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-3.5">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <Award size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Contributor</p>
              <h4 className="text-sm font-bold text-slate-800 truncate" title={mostActiveAuthor}>
                {mostActiveAuthor}
              </h4>
            </div>
          </div>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Form 1: Add Author */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <UserPlus size={16} className="text-indigo-500" />
              Add Author
            </h3>
            <form onSubmit={handleAuthorSubmit} className="space-y-3">
              <input 
                type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              />
              <input 
                type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              />
              <input 
                type="number" placeholder="Age (Optional 18+)" value={age} onChange={e => setAge(e.target.value)} 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
              />
              <button type="submit" disabled={addAuthorMutation.isPending} className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition-colors disabled:opacity-50">
                Register Author
              </button>
            </form>
          </div>

          {/* Form 2: Add Post */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <FileText size={16} className="text-emerald-500" />
              Publish Article
            </h3>
            <form onSubmit={handlePostSubmit} className="space-y-3">
              <select 
                value={selectedAuthorId} onChange={e => setSelectedAuthorId(e.target.value)} required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 cursor-pointer"
              >
                <option value="">Assign to Author...</option>
                {authors?.map(author => (
                  <option key={author.id} value={author.id}>{author.name}</option>
                ))}
              </select>
              <input 
                type="text" placeholder="Article Title" value={title} onChange={e => setTitle(e.target.value)} required 
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800"
              />
              <textarea 
                placeholder="Write text content here..." value={content} onChange={e => setContent(e.target.value)} required rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 resize-none"
              />
              <button type="submit" disabled={addPostMutation.isPending} className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs transition-colors disabled:opacity-50">
                Publish Post
              </button>
            </form>
          </div>
        </div>

        {/* Directory List Container */}
        <div className="space-y-3">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase">System Core Ledger</h3>
          </div>

          {authors?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-sm">
              No relational entries found. Register profiles above to spin up workspace nodes!
            </div>
          ) : (
            <ul className="space-y-3">
              {authors?.map(author => {
                const isExpanded = expandedAuthorId === author.id;
                const hasPosts = author.posts && author.posts.length > 0;
                
                return (
                  <li key={author.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transition-all">
                    <div 
                      onClick={() => setExpandedAuthorId(isExpanded ? null : author.id)}
                      className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50/50 transition-colors select-none"
                    >
                      <div className="flex flex-col space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-800 text-sm sm:text-base">{author.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${author.age ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                            {author.age ? `${author.age} yrs` : 'Age N/A'}
                          </span>
                          {hasPosts && (
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1">
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
                      
                      <div className="flex items-center space-x-2" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => {
                            toast.warning(`Wipe author and all nested posts?`, {
                              action: {
                                label: 'Delete All',
                                onClick: () => deleteAuthorMutation.mutate({ id: author.id, authorName: author.name })
                              },
                            });
                          }}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                        <div className="text-slate-400 p-1 bg-slate-50 border border-slate-100 rounded-md">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="bg-slate-50/50 border-t border-slate-100/80 p-4 space-y-3">
                        <h4 className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                          <FileText size={12} className="text-slate-400" />
                          Published Materials Catalog
                        </h4>
                        
                        {!hasPosts ? (
                          <p className="text-xs text-slate-400 italic pl-1">This author hasn't published any structural text blocks yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {author.posts.map(post => (
                              <div key={post.id} className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-xs">
                                <h5 className="text-xs font-bold text-slate-800">{post.title}</h5>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{post.content}</p>
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
          )}
        </div>

      </div>
    </div>
  );
}