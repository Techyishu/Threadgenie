'use client'

import { useEffect } from 'react'
import { useAuth } from '@/components/auth-provider'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/?auth=signin')
    }
  }, [user, isLoading, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  // If we're still here and not authenticated, show nothing while redirecting
  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">Welcome, {user.email}</h2>
        <p className="text-gray-600">
          This is your dashboard. You can generate Twitter threads and manage your content here.
        </p>
      </div>
    </div>
  )
} 