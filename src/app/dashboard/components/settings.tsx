'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

interface Profile {
  writing_style: string
}

export function Settings() {
  const [writingStyle, setWritingStyle] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const createSupabaseClient = () => {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  useEffect(() => {
    async function fetchProfile() {
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('user_profiles')
          .select('writing_style')
          .eq('user_id', user.id)
          .single()
        
        if (data) {
          setWritingStyle(data.writing_style || '')
        }
      }
    }
    fetchProfile()
  }, [])

  const saveWritingStyle = async () => {
    setSaveMessage(null)
    try {
      setIsSaving(true)
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({ writing_style: writingStyle })
        .eq('user_id', user.id)

      if (error) throw error

      setSaveMessage({ type: 'success', text: 'Writing style updated successfully!' })
    } catch (error) {
      console.error('Failed to save writing style:', error)
      setSaveMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save writing style' 
      })
    } finally {
      setIsSaving(false)
      setTimeout(() => {
        setSaveMessage(null)
      }, 3000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        
        <div className="bg-[#1a1a1a] rounded-lg border border-zinc-800/50 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Your Writing Style
            </label>
            <textarea
              value={writingStyle}
              onChange={(e) => setWritingStyle(e.target.value)}
              placeholder="Describe your writing style..."
              className="w-full bg-black/30 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
            />
            <p className="mt-2 text-sm text-zinc-500">
              This writing style will be used to generate content that matches your voice.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={saveWritingStyle}
              disabled={isSaving}
              variant="secondary"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>

            {saveMessage && (
              <span className={`text-sm ${
                saveMessage.type === 'success' ? 'text-green-500' : 'text-red-500'
              }`}>
                {saveMessage.text}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 