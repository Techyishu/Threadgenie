'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { GeneratedContent } from '@/types'

export function History() {
  const [history, setHistory] = useState<GeneratedContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data, error } = await supabase
          .from('generated_content')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(10)

        if (error) throw error

        setHistory(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  if (loading) {
    return (
      <div className="p-4 bg-[#0d1117] rounded-lg">
        <p className="text-gray-400">Loading history...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-[#0d1117] rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">Recent Generations</h3>
      <div className="space-y-3">
        {history.map((item) => (
          <div key={item.id} className="p-4 bg-[#0d1117] rounded-lg border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-400">
                {new Date(item.timestamp).toLocaleDateString()}
              </span>
              <span className="px-2 py-1 text-xs font-medium text-blue-400 bg-blue-400/10 rounded">
                {item.type}
              </span>
            </div>
            <p className="text-sm text-gray-300 mb-2">Prompt: {item.prompt}</p>
            <div className="text-white whitespace-pre-wrap">
              {item.generated_text}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 