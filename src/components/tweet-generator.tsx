'use client'

import { useState } from 'react'

export function TweetGenerator() {
  const [prompt, setPrompt] = useState('')
  const [tone, setTone] = useState('casual')
  const [loading, setLoading] = useState(false)
  const [tweet, setTweet] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetPrompt: prompt, tone }),
      })

      if (!response.ok) throw new Error('Failed to generate tweet')

      const data = await response.json()
      setTweet(data.tweet)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-2">Tweet Generator</h3>
        <p className="text-gray-400">Create an engaging tweet that captures attention.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            What would you like to tweet about?
          </label>
          <textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-40 bg-[#0d1117] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your tweet topic or idea..."
            required
          />
        </div>

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

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Tweet'}
        </button>
      </form>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {tweet && (
        <div className="rounded-lg bg-[#0d1117] border border-gray-800 p-4">
          <p className="text-white">{tweet}</p>
        </div>
      )}
    </div>
  )
} 