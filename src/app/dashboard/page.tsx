import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { DashboardClient } from './dashboard-client'
import { redirect } from 'next/navigation'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { tab?: string }
}) {
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
  const isAuthenticated = !!user

  let profile = null
  let needsOnboarding = false
  let ideas = []

  if (isAuthenticated) {
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('writing_style')
      .eq('user_id', user.id)
      .single()

    profile = profileData
    needsOnboarding = !profile?.writing_style

    if (searchParams.tab === 'ideas') {
      const { data: ideasData } = await supabase
        .from('content_ideas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      ideas = ideasData || []
    }
  }

  return <DashboardClient 
    searchParams={searchParams} 
    needsOnboarding={needsOnboarding} 
    ideas={ideas}
    isAuthenticated={isAuthenticated}
  />
} 