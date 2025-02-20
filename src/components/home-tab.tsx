'use client'

export function HomeTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-white mb-2">Home / X</h3>
        <p className="text-sm text-zinc-400">Create and manage your X (Twitter) content</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="bg-[#1a1a1a]/50 rounded-lg border border-zinc-800/50 p-4 hover:bg-[#1a1a1a] transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">🧵</span>
            <h4 className="text-sm font-medium text-white">Thread Generator</h4>
          </div>
          <p className="text-sm text-zinc-400">Create engaging Twitter threads that capture attention</p>
        </div>

        <div className="bg-[#1a1a1a]/50 rounded-lg border border-zinc-800/50 p-4 hover:bg-[#1a1a1a] transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">📝</span>
            <h4 className="text-sm font-medium text-white">Tweet Generator</h4>
          </div>
          <p className="text-sm text-zinc-400">Generate viral tweets with AI assistance</p>
        </div>

        <div className="bg-[#1a1a1a]/50 rounded-lg border border-zinc-800/50 p-4 hover:bg-[#1a1a1a] transition-colors">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">👤</span>
            <h4 className="text-sm font-medium text-white">Bio Generator</h4>
          </div>
          <p className="text-sm text-zinc-400">Create a compelling Twitter bio that stands out</p>
        </div>
      </div>
    </div>
  )
} 