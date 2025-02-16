import { Header } from '@/components/header'
import { ContentTabs } from '@/components/content-tabs'
import { History } from '@/components/history'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-3xl font-bold">Dashboard</h2>
              <p className="text-gray-400">Generate various types of X content</p>
            </div>

            <ContentTabs />
          </div>

          <div className="space-y-6">
            <History />
          </div>
        </div>
      </main>
    </div>
  )
} 