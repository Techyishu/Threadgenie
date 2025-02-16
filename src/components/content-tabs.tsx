'use client'

import { useState } from 'react'
import { ThreadGenerator } from './thread-generator'
import { TweetGenerator } from './tweet-generator'
import { BioGenerator } from './bio-generator'

type Tab = 'thread' | 'tweet' | 'bio'

export function ContentTabs() {
  const [activeTab, setActiveTab] = useState<Tab>('thread')

  return (
    <div className="space-y-4">
      <div className="flex space-x-4 border-b border-gray-800">
        {(['thread', 'tweet', 'bio'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 ${
              activeTab === tab
                ? 'text-white bg-[#1a1f2d] rounded-t-lg border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-[#0d1117] rounded-lg p-6">
        {activeTab === 'thread' && <ThreadGenerator />}
        {activeTab === 'tweet' && <TweetGenerator />}
        {activeTab === 'bio' && <BioGenerator />}
      </div>
    </div>
  )
} 