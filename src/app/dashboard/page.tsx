import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Header } from '@/components/header'
import { ContentTabs } from '@/components/content-tabs'
import { History } from '@/components/history'
import { WritingStyleOnboarding } from '@/components/writing-style-onboarding'
import { redirect } from 'next/navigation'

export default async function Dashboard() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('writing_style')
    .eq('user_id', user.id)
    .single()

  const needsOnboarding = !profile?.writing_style

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {needsOnboarding ? (
          <WritingStyleOnboarding onComplete={() => window.location.reload()} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-4xl font-serif italic text-white mb-3">Dashboard</h2>
                <p className="text-xl text-gray-400">Create engaging content for your X profile</p>
              </div>

              <div className="bg-[#1a1f2d] rounded-2xl border border-gray-800/50 p-6">
                <ContentTabs />
              </div>
            </div>

            <div>
              <div className="sticky top-28 h-[calc(100vh-8rem)]">
                <div className="bg-[#1a1f2d] rounded-2xl border border-gray-800/50 p-6 h-full flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-white">History</h3>
                  </div>
                  <div className="overflow-y-auto flex-1 -mr-2 pr-2">
                    <History />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 