import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { UserPlus, Mail, Calendar, Trash2, Users } from 'lucide-react';

// Define the type matching our Drizzle schema
interface Author {
  id: number
  name: string
  email: string
  age?: number
}

export default function App() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [age, setAge] = useState('')

  // 1. FETCH AUTHORS (GET request via TanStack Query)
  const { data: authors, isLoading, error } = useQuery<Author[]>({
    queryKey: ['authors'],
    queryFn: async () => {
      const res = await fetch('http://localhost:3000/author')
      if (!res.ok) throw new Error('Network response was not ok')
      return res.json()
    }
  })

  // 2. CREATE AUTHOR (POST request via TanStack Query Mutation)
  const addAuthorMutation = useMutation({
    mutationFn: async (newAuthor: { name: string; email: string ; age? : number }) => {
      const res = await fetch('http://localhost:3000/author', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAuthor),
      })
      if (!res.ok) throw new Error('Validation failed or server error')
      return res.json()
    },
    // When successful, automatically refresh the 'authors' list!
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
      setName('')
      setEmail('')
      setAge('')
    }
  })


  // 3. DELETE AUTHOR (DELETE request via TanStack Query Mutation)
  const deleteAuthorMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`http://localhost:3000/author/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete author')
      return res.json()
    },
    // When a delete succeeds, automatically wipe the cache and refresh the UI list!
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authors'] })
    }
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) return

const parsedAge = age.trim() === "" ? undefined : Number(age);

    addAuthorMutation.mutate({ 
      name,
      email,
      age : parsedAge && !isNaN(parsedAge) && parsedAge >= 18 ? parsedAge : undefined // Only send age if it's a valid number and meets the minimum age requirement
     })
  }

  if (isLoading) return <p style={{ padding: '20px' }}>Loading authors...</p>
  if (error) return <p style={{ color: 'red' }}>Error loading data!</p>

return (
  <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
    <div className="max-w-xl mx-auto">
      
      {/* Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 text-center sm:text-left sm:flex sm:items-center sm:space-x-4">
        <div className="mx-auto sm:mx-0 bg-indigo-50 p-3 rounded-xl inline-block text-indigo-600">
          <Users size={32} />
        </div>
        <div className="mt-4 sm:mt-0">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Author Directory</h2>
          <p className="text-sm text-slate-500">Manage directory records powered by Hono & Drizzle</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8">
        <h3 className="text-md font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-indigo-500" />
          Add New Author
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Users size={16} />
            </span>
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400"
            />
          </div>

          {/* Email Field */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Mail size={16} />
            </span>
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400"
            />
          </div>

          {/* Age Field */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Calendar size={16} />
            </span>
            <input 
              type="number" 
              placeholder="Age (Minimum 18, optional)" 
              value={age} 
              onChange={e => setAge(e.target.value)} 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-slate-400"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={addAuthorMutation.isPending}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-sm shadow-sm transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {addAuthorMutation.isPending ? 'Processing Registration...' : 'Register Author'}
          </button>
        </form>
      </div>

      {/* Directory List Container */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase">Registered Directory</h3>
          <span className="bg-slate-200/60 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
            {authors?.length || 0} Total
          </span>
        </div>

        {authors?.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-slate-400 text-sm">
            No authors found. Try adding one above!
          </div>
        ) : (
          <ul className="space-y-3">
            {authors?.map(author => (
              <li 
                key={author.id} 
                className="group flex justify-between items-center bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-sm sm:text-base">{author.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${author.age ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {author.age ? `${author.age} yrs` : 'Age N/A'}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1">
                    <Mail size={12} className="text-slate-400" />
                    {author.email}
                  </span>
                </div>
                
                <button 
                  onClick={() => {
                    if(confirm(`Are you sure you want to delete ${author.name}?`)) {
                      deleteAuthorMutation.mutate(author.id)
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-150"
                  title="Remove Profile"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  </div>
)
}