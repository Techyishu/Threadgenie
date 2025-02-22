'use client'

import { useState } from 'react'
import { CopyButton } from './copy-button'
import { PricingModal } from './pricing-modal'
import { Button } from '@/components/ui/button'
import { TONES } from '@/lib/tones'

export function ThreadGenerator() {
  const [content, setContent] = useState('')
  const [tone, setTone] = useState('casual')
  const [length, setLength] = useState('3')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [thread, setThread] = useState<string[]>([])
  const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null)
  const [isPricingOpen, setIsPricingOpen] = useState(false)

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

      const data = await response.json()
      
      if (response.ok) {
        if (Array.isArray(data.thread)) {
          setThread(data.thread)
        } else {
          setThread(data.thread ? [data.thread] : [])
        }
        setRemainingGenerations(data.remainingGenerations)
      } else {
        if (data.error === 'Daily generation limit reached. Upgrade to Pro for unlimited generations.') {
          setIsPricingOpen(true)
        }
        setError(data.error)
        setThread([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setThread([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Thread Generator</h3>
        <p className="text-sm text-zinc-400">Create engaging Twitter threads that capture attention</p>
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
                {Object.entries(TONES).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value.name}
                  </option>
                ))}
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
                <option value="10">10 tweets</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          variant="gradient-purple"
          size="lg"
          fullWidth
        >
          Generate Thread
        </Button>
      </form>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {error && error.includes('limit reached') && (
        <div className="bg-blue-500/10 text-blue-500 p-4 rounded-lg">
          <p>
            You've reached your daily limit.{' '}
            <button onClick={() => setIsPricingOpen(true)} className="underline">
              Upgrade to Pro
            </button>{' '}
            for unlimited generations.
          </p>
        </div>
      )}

      {thread.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-300">Generated Thread</h4>
          <div className="space-y-3">
            {thread.map((tweet, index) => (
              <div key={index} className="rounded-lg bg-[#0d1117] border border-gray-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Tweet {index + 1}</span>
                    <div className="h-1 w-1 rounded-full bg-gray-400" />
                    <span className="text-sm text-gray-400">{tweet.length} characters</span>
                  </div>
                  <CopyButton text={tweet} />
                </div>
                <p className="text-white">{tweet}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </div>
  )
} 