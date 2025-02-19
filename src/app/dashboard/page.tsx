import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Header } from '@/components/header'
import { ContentTabs } from '@/components/content-tabs'
import { History } from '@/components/history'
import { WritingStyleWrapper } from '@/components/writing-style-wrapper'
import { AuthForm } from '@/components/auth-form'

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        }
      }
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()

  // If no user, show auth form instead of dashboard
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <AuthForm />
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('writing_style')
    .eq('user_id', user.id)
    .single()

  const needsOnboarding = !profile?.writing_style

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      <main className="pt-24 pb-12">
        <WritingStyleWrapper needsOnboarding={needsOnboarding}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ContentTabs />
            <History />
          </div>
        </WritingStyleWrapper>
      </main>
    </div>
  )
} 