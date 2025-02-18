'use client'

export function AuthLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <h2 className="text-2xl font-medium text-white">Authenticating...</h2>
        <p className="text-gray-400">You will be redirected shortly</p>
      </div>
    </div>
  )
} 