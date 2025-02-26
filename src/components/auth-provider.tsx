'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import { Session, User } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signOut: () => Promise<void>
  showAuthModal: boolean
  setShowAuthModal: (show: boolean) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  showAuthModal: false,
  setShowAuthModal: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Check if we should show the auth modal based on URL params
    const authParam = searchParams.get('auth')
    if (authParam === 'signin' || authParam === 'signup') {
      setShowAuthModal(true)
    }
  }, [searchParams])

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true)
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          setSession(null)
          setUser(null)
          return
        }
        
        if (session) {
          setSession(session)
          setUser(session.user)
        }
      } catch (error) {
        console.error('Unexpected error during session check:', error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event)
        setSession(session)
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_OUT') {
          // Clear any cached data
          router.refresh()
        } else if (event === 'SIGNED_IN') {
          // Close the auth modal if it's open
          setShowAuthModal(false)
          // Refresh the page to ensure we have the latest data
          router.refresh()
        } else if (event === 'TOKEN_REFRESHED') {
          // Session was refreshed successfully
          router.refresh()
        } else if (event === 'USER_UPDATED') {
          // User was updated
          router.refresh()
        }
      }
    )

    // Set up a timer to periodically check session validity
    const sessionCheckInterval = setInterval(async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session && session) {
        // Session has expired, update state
        setSession(null)
        setUser(null)
        // Show auth modal if session expired
        setShowAuthModal(true)
      }
    }, 5 * 60 * 1000) // Check every 5 minutes

    return () => {
      subscription.unsubscribe()
      clearInterval(sessionCheckInterval)
    }
  }, [supabase, router, session])

  const signOut = async () => {
    await supabase.auth.signOut()
    // Clear session and user state
    setSession(null)
    setUser(null)
    // Redirect to home page
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      signOut,
      showAuthModal,
      setShowAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  )
} 