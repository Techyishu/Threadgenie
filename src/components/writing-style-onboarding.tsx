'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export function WritingStyleOnboarding({ onComplete }: { onComplete: () => void }) {
  const [writingStyle, setWritingStyle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      const { error: updateError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          writing_style: writingStyle,
        })

      if (updateError) throw updateError
      onComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save writing style')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setWritingStyle(e.target.value)
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#1a1f2d] rounded-2xl border border-gray-800/50">
      <h2 className="text-2xl font-bold mb-4">Define Your Writing Style</h2>
      <p className="text-gray-400 mb-6">
        Please write 300-400 words that best represent your writing style. This will help our AI generate content that matches your voice.
        You can write about any topic - the important thing is that it captures your natural writing style.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            value={writingStyle}
            onChange={handleChange}
            className="w-full h-64 bg-[#0d1117] border border-gray-800 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Start writing here..."
            required
          />
          <div className="text-sm text-gray-400 mt-2">
            {writingStyle.length} / 400 characters
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading || writingStyle.length < 300 || writingStyle.length > 400}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Writing Style'}
        </button>
      </form>
    </div>
  )
} 