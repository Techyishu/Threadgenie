'use client'

import { useState } from 'react'
import { CopyButton } from './copy-button'
import { PricingModal } from './pricing-modal'

export function BioGenerator() {
  const [bioKeywords, setBioKeywords] = useState('')
  const [personalStyle, setPersonalStyle] = useState('professional')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bio, setBio] = useState<string | null>(null)
  const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null)
  const [isPricingOpen, setIsPricingOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bioKeywords, personalStyle }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setBio(data.bio)
        setRemainingGenerations(data.remainingGenerations)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold">Bio Generator</h3>
      </div>

      <div>
        <p className="text-gray-400">Create a compelling X profile bio that captures attention.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Keywords (comma-separated)
          </label>
          <input
            type="text"
            value={bioKeywords}
            onChange={(e) => setBioKeywords(e.target.value)}
            className="w-full bg-[#0d1117] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="developer, coffee lover, tech enthusiast"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Personal Style
          </label>
          <div className="relative">
            <select 
              value={personalStyle}
              onChange={(e) => setPersonalStyle(e.target.value)}
              className="w-full bg-[#0d1117] border border-gray-800 rounded-lg p-3 pr-10 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="professional">Professional</option>
              <option value="creative">Creative</option>
              <option value="humorous">Humorous</option>
              <option value="minimalist">Minimalist</option>
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
          {loading ? 'Generating...' : 'Generate Bio'}
        </button>
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

      {bio && (
        <div className="rounded-lg bg-[#0d1117] border border-gray-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">{bio.length} characters</span>
            <CopyButton text={bio} />
          </div>
          <p className="text-white">{bio}</p>
        </div>
      )}

      <PricingModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </div>
  )
} 