'use client'

import { useRouter } from 'next/navigation'
import { WritingStyleOnboarding } from './writing-style-onboarding'

export function WritingStyleWrapper() {
  const router = useRouter()

  const handleComplete = () => {
    router.refresh()
  }

  return <WritingStyleOnboarding onComplete={handleComplete} />
} 