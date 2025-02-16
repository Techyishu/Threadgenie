'use client'

import { useState } from 'react'
import { ThreadGenerator } from './thread-generator'
import { TweetGenerator } from './tweet-generator'
import { BioGenerator } from './bio-generator'

export function ContentTabs() {
  const [activeTab, setActiveTab] = useState('thread')

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('thread')}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === 'thread' 
              ? 'text-white border-b-2 border-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Thread Generator
        </button>
        <button
          onClick={() => setActiveTab('tweet')}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === 'tweet' 
              ? 'text-white border-b-2 border-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Tweet Generator
        </button>
        <button
          onClick={() => setActiveTab('bio')}
          className={`pb-3 text-sm font-medium transition-colors relative ${
            activeTab === 'bio' 
              ? 'text-white border-b-2 border-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Bio Generator
        </button>
      </div>

      {activeTab === 'thread' && <ThreadGenerator />}
      {activeTab === 'tweet' && <TweetGenerator />}
      {activeTab === 'bio' && <BioGenerator />}
    </div>
  )
} 