'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

interface Idea {
  id: string
  ideas: string
  status: 'unused' | 'used'
  created_at: string
}

interface Profile {
  writing_style: string
  niche?: string
  topics?: string
}

export function Ideas({ initialIdeas }: { initialIdeas: Idea[] }) {
  const [ideas, setIdeas] = useState(initialIdeas)
  const [isGenerating, setIsGenerating] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [niche, setNiche] = useState('')
  const [topics, setTopics] = useState('')
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
          .select('writing_style, niche, topics')
          .eq('user_id', user.id)
          .single()
        
        if (data) {
          setProfile(data)
          setNiche(data.niche || '')
          setTopics(data.topics || '')
        }
      }
    }
    fetchProfile()
  }, [])

  const saveProfile = async () => {
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
        .update({
          niche,
          topics
        })
        .eq('user_id', user.id)

      if (error) throw error

      setSaveMessage({ type: 'success', text: 'Profile saved successfully!' })
      
      // Update local profile state
      setProfile(prev => prev ? { ...prev, niche, topics } : null)
    } catch (error) {
      console.error('Failed to save profile:', error)
      setSaveMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save profile' 
      })
    } finally {
      setIsSaving(false)
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null)
      }, 3000)
    }
  }

  const generateIdeas = async () => {
    if (!niche || !topics) {
      alert('Please fill in your niche and topics first')
      return
    }

    try {
      setIsGenerating(true)
      const response = await fetch('/api/generate-ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          niche,
          topics
        })
      })
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      if (data.ideas) {
        setIdeas([{ 
          id: Date.now().toString(), 
          ideas: data.ideas, 
          status: 'unused',
          created_at: new Date().toISOString()
        }, ...ideas])
      }
    } catch (error) {
      console.error('Failed to generate ideas:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const markAsUsed = async (id: string) => {
    await fetch(`/api/ideas/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'used' })
    })
    setIdeas(ideas.map(idea => 
      idea.id === id ? { ...idea, status: 'used' } : idea
    ))
  }

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1a1a] rounded-lg border border-zinc-800/50 p-6 space-y-4">
        <h3 className="text-lg font-medium text-white">Your Content Profile</h3>
        
        <div className="space-y-4">
          {profile?.writing_style && (
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">
                Writing Style
              </label>
              <div className="text-sm text-white bg-black/30 rounded-md p-3">
                {profile.writing_style}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Your Niche
            </label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g., Web Development, Digital Marketing, Personal Growth"
              className="w-full bg-black/30 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Topics You Cover
            </label>
            <textarea
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              placeholder="Enter the main topics you write about, separated by commas"
              className="w-full bg-black/30 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={saveProfile}
              disabled={isSaving}
              variant="secondary"
            >
              {isSaving ? 'Saving...' : 'Save Profile'}
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

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Content Ideas</h2>
        <Button 
          onClick={generateIdeas}
          disabled={isGenerating || !niche || !topics}
        >
          {isGenerating ? 'Generating...' : 'Generate New Ideas'}
        </Button>
      </div>
      
      <div className="space-y-4">
        {ideas.map((idea) => (
          <Card key={idea.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="whitespace-pre-wrap">{idea.ideas}</div>
              <Button
                variant={idea.status === 'used' ? 'secondary' : 'default'}
                onClick={() => markAsUsed(idea.id)}
                disabled={idea.status === 'used'}
              >
                {idea.status === 'used' ? 'Used' : 'Mark as Used'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 