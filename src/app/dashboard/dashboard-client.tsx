'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/header'
import { History } from '@/components/history'
import { WritingStyleWrapper } from '@/components/writing-style-wrapper'
import { Sidebar } from '@/components/sidebar'
import { ThreadGenerator } from '@/components/thread-generator'
import { TweetGenerator } from '@/components/tweet-generator'
import { BioGenerator } from '@/components/bio-generator'
import { HomeTab } from '@/components/home-tab'
import { Ideas } from './components/ideas'
import dynamic from 'next/dynamic'
import { Settings } from './components/settings'

interface DashboardClientProps {
  searchParams: { tab?: string }
  needsOnboarding: boolean
  ideas: any[] // Add proper type later
}

// Memoize the components to prevent unnecessary re-renders
const MemoizedHistory = dynamic(() => import('@/components/history').then(mod => mod.History), {
  ssr: false
})

export function DashboardClient({ 
  searchParams, 
  needsOnboarding,
  ideas 
}: DashboardClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Memoize the active component to prevent re-renders
  const ActiveComponent = useMemo(() => {
    switch (searchParams.tab) {
      case 'home':
        return <HomeTab />;
      case 'thread-generator':
        return <ThreadGenerator />;
      case 'tweet-generator':
        return <TweetGenerator />;
      case 'bio-generator':
        return <BioGenerator />;
      case 'settings':
        return <Settings />;
      // Temporarily hidden
      // case 'ideas':
      //   return <Ideas initialIdeas={ideas} />;
      default:
        return <HomeTab />;
    }
  }, [searchParams.tab])

  return (
    <div className="min-h-screen bg-[#121212]">
      <Header isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      <main className="lg:pl-64 pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {needsOnboarding ? (
            <WritingStyleWrapper />
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2">
                  <div className="bg-[#1a1a1a] rounded-lg border border-zinc-800/50 p-6">
                    {ActiveComponent}
                  </div>
                </div>

                <div>
                  <div className="sticky top-24">
                    <div className="bg-[#1a1a1a] rounded-lg border border-zinc-800/50 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-sm font-medium text-white">History</h3>
                      </div>
                      <div className="overflow-y-auto max-h-[calc(100vh-12rem)]">
                        <MemoizedHistory />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
} 