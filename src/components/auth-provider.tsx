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
  showLoginModal: boolean
  setShowLoginModal: (show: boolean) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  showLoginModal: false,
  setShowLoginModal: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Check for showLogin query parameter
  useEffect(() => {
    const showLogin = searchParams.get('showLogin')
    if (showLogin === 'true') {
      setShowLoginModal(true)
      // Remove the query parameter from the URL without refreshing the page
      const newUrl = window.location.pathname
      window.history.replaceState({}, '', newUrl)
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
        } else {
          // If no session, we might want to show the login modal
          // depending on the current route (handled by middleware)
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
        setSession(session)
        setUser(session?.user ?? null)
        
        if (event === 'SIGNED_OUT') {
          // Clear any cached data
          router.refresh()
        } else if (event === 'SIGNED_IN') {
          // Hide login modal when signed in
          setShowLoginModal(false)
          router.refresh()
        } else if (event === 'TOKEN_REFRESHED') {
          // Session was refreshed, update the UI
          router.refresh()
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  const signOut = async () => {
    await supabase.auth.signOut()
    // After signing out, refresh the page to clear any user-specific data
    router.refresh()
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      signOut,
      showLoginModal,
      setShowLoginModal
    }}>
      {children}
    </AuthContext.Provider>
  )
} 