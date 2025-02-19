'use client'

import { useRouter } from 'next/navigation'
import { WritingStyleOnboarding } from './writing-style-onboarding'

interface WritingStyleWrapperProps {
  children: React.ReactNode
  needsOnboarding: boolean
}

export function WritingStyleWrapper({ children, needsOnboarding }: WritingStyleWrapperProps) {
  const router = useRouter()

  const handleComplete = () => {
    router.refresh()
  }

  if (needsOnboarding) {
    return <WritingStyleOnboarding onComplete={handleComplete} />
  }

  return <>{children}</>
} 