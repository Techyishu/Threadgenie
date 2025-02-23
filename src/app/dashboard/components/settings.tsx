'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { NICHES, type NicheType } from '@/lib/niches'

interface Profile {
  writing_style: string
  niche: string
}

export function Settings() {
  const [writingStyle, setWritingStyle] = useState('')
  const [selectedNiche, setSelectedNiche] = useState<NicheType>('tech')
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
          .select('writing_style, niche')
          .eq('user_id', user.id)
          .single()
        
        if (data) {
          setWritingStyle(data.writing_style || '')
          if (data.niche) {
            setSelectedNiche(data.niche as NicheType)
          }
        }
      }
    }
    fetchProfile()
  }, [])

  const saveProfile = async () => {
    try {
      setIsSaving(true)
      const supabase = createSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('Not authenticated')
      }

      const { error } = await supabase
        .from('user_profiles')
        .update({
          writing_style: writingStyle,
          niche: selectedNiche
        })
        .eq('user_id', user.id)

      if (error) throw error
      
      setSaveMessage({ type: 'success', text: 'Settings saved successfully!' })
    } catch (error) {
      console.error('Failed to save settings:', error)
      setSaveMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save settings' 
      })
    } finally {
      setIsSaving(false)
      setTimeout(() => setSaveMessage(null), 3000)
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

          <div>
            <label className="block text-lg font-medium text-white mb-4">
              Your Content Niche
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(NICHES).map(([key, niche]) => (
                <div
                  key={key}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedNiche === key
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-gray-800 hover:border-gray-700'
                  }`}
                  onClick={() => setSelectedNiche(key as NicheType)}
                >
                  <h3 className="text-white font-medium mb-2">{niche.name}</h3>
                  <p className="text-gray-400 text-sm">{niche.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {niche.topics.map(topic => (
                      <span
                        key={topic}
                        className="text-xs px-2 py-1 rounded-full bg-gray-800 text-gray-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={saveProfile}
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