'use client'

import { useState, useMemo } from 'react'
import { Header } from '@/components/header'
import { WritingStyleWrapper } from '@/components/writing-style-wrapper'
import { Sidebar } from '@/components/sidebar'
import { ThreadGenerator } from '@/components/thread-generator'
import { TweetGenerator } from '@/components/tweet-generator'
import { BioGenerator } from '@/components/bio-generator'
import { HomeTab } from '@/components/home-tab'
import { Ideas } from './components/ideas'
import { Settings } from './components/settings'
import { AuthForm } from '@/components/auth-form'
import { HistoryTab } from './components/history-tab'

interface DashboardClientProps {
  searchParams: { tab?: string }
  needsOnboarding: boolean
  ideas: any[] // Add proper type later
  isAuthenticated: boolean
}

export function DashboardClient({ 
  searchParams, 
  needsOnboarding,
  ideas,
  isAuthenticated 
}: DashboardClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showAuth, setShowAuth] = useState(!isAuthenticated)

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
      case 'history':
        return <HistoryTab />;
      default:
        return <HomeTab />;
    }
  }, [searchParams.tab])

  return (
    <div className="min-h-screen bg-[#121212]">
      {!isAuthenticated && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1f2d] rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Get Started</h2>
            </div>
            <AuthForm />
          </div>
        </div>
      )}

      <Header isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />
      
      <main className="lg:pl-64 pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {needsOnboarding ? (
            <WritingStyleWrapper />
          ) : (
            <div className="space-y-6">
              <div className={searchParams.tab === 'history' ? '' : 'xl:grid-cols-1'}>
                <div className="xl:col-span-2">
                  <div className="bg-[#1a1a1a] rounded-lg border border-zinc-800/50 p-6">
                    {ActiveComponent}
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