'use client'

import { useEffect } from 'react'
import { useAuth } from './auth-provider'

// This component doesn't render anything visible
// It just controls when to show your existing login modal
export default function LoginModalController() {
  const { showLoginModal, setShowLoginModal, session } = useAuth()

  // This effect will trigger your existing login modal
  // You'll need to modify this to work with your actual modal implementation
  useEffect(() => {
    // If we need to show the login modal and there's no active session
    if (showLoginModal && !session) {
      // This is where you would trigger your existing login modal
      // For example, if you have a global state or event system:
      // triggerLoginModal() or dispatchEvent(new CustomEvent('showLoginModal'))
      
      // You might need to replace this with your actual implementation
      const event = new CustomEvent('showLoginModal')
      window.dispatchEvent(event)
    }
  }, [showLoginModal, session])

  // This effect handles session expiration
  useEffect(() => {
    // Function to check if the session is valid
    const checkSession = async () => {
      // If we have no session but we're on a protected route
      // (middleware would have redirected with showLogin=true)
      if (!session && window.location.search.includes('showLogin=true')) {
        setShowLoginModal(true)
      }
    }

    checkSession()

    // Also set up an interval to periodically check the session
    // This helps catch expired sessions even when the user is inactive
    const intervalId = setInterval(checkSession, 15 * 60 * 1000) // Check every 15 minutes

    return () => clearInterval(intervalId)
  }, [session, setShowLoginModal])

  // This component doesn't render anything visible
  return null
} 