'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { GeneratedContent } from '@/types'

export function HistoryTab() {
  const [history, setHistory] = useState<GeneratedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const supabase = createClient()

  useEffect(() => {
    async function fetchHistory() {
      try {
        setLoading(true)
        let query = supabase
          .from('generated_content')
          .select('*')
          .order('timestamp', { ascending: false })

        if (filter !== 'all') {
          query = query.ilike('type', `%${filter}%`)
        }

        const { data, error: fetchError } = await query
        console.log('Fetched data:', data)

        if (fetchError) throw fetchError
        setHistory(data || [])
      } catch (err) {
        console.error('Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load history')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [filter])

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFilter = e.target.value
    console.log('Filter changed to:', newFilter)
    setFilter(newFilter)
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'thread':
        return 'text-blue-500 bg-blue-500/10'
      case 'tweet':
        return 'text-purple-500 bg-purple-500/10'
      case 'bio':
        return 'text-green-500 bg-green-500/10'
      default:
        return 'text-blue-400 bg-blue-400/10'
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-medium text-white">Recent Generations</h2>
        <div className="flex items-center gap-2">
          <select 
            className="bg-[#1a1a1a] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-gray-300"
            value={filter}
            onChange={handleFilterChange}
          >
            <option value="all">All Types</option>
            <option value="thread">Threads</option>
            <option value="tweet">Tweets</option>
            <option value="bio">Bios</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : history.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          No generations found. Start creating some content!
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <div key={item.id} className="bg-[#1a1a1a] rounded-lg p-6 border border-zinc-800/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded ${getTypeColor(item.type)}`}>
                  {item.type}
                </span>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-400">Prompt</label>
                  <p className="text-sm text-gray-300">{item.prompt}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-400">Generated Content</label>
                  <div className="text-white whitespace-pre-wrap text-sm bg-[#0d1117] rounded-lg p-4 border border-gray-800">
                    {item.generated_text}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 