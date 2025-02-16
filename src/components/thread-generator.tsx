'use client'

import { useState } from 'react'

export function ThreadGenerator() {
  const [content, setContent] = useState('')
  const [tone, setTone] = useState('casual')
  const [length, setLength] = useState('3')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [thread, setThread] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, tone, length }),
      })

      if (!response.ok) throw new Error('Failed to generate thread')

      const data = await response.json()
      setThread(data.tweets)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Thread Generator</h3>
        <p className="text-gray-400">Convert your content into an engaging Twitter thread.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Content
          </label>
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-40 bg-[#0d1117] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter the content you want to convert into a thread..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tone
            </label>
            <div className="relative">
              <select 
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-[#0d1117] border border-gray-800 rounded-lg p-3 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="casual">Casual</option>
                <option value="professional">Professional</option>
                <option value="humorous">Humorous</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Thread Length
            </label>
            <div className="relative">
              <select 
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className="w-full bg-[#0d1117] border border-gray-800 rounded-lg p-3 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="3">3 tweets</option>
                <option value="5">5 tweets</option>
                <option value="7">7 tweets</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Thread'}
        </button>
      </form>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {thread.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-300">Generated Thread</h4>
          <div className="space-y-3">
            {thread.map((tweet, index) => (
              <div key={index} className="rounded-lg bg-[#0d1117] border border-gray-800 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-400">Tweet {index + 1}</span>
                  <div className="h-1 w-1 rounded-full bg-gray-400" />
                  <span className="text-sm text-gray-400">{tweet.length} characters</span>
                </div>
                <p className="text-white">{tweet}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 