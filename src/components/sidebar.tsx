'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

export function Sidebar({ 
  isMobileMenuOpen, 
  setIsMobileMenuOpen 
}: { 
  isMobileMenuOpen: boolean; 
  setIsMobileMenuOpen: (open: boolean) => void 
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const navigation = [
    {
      name: 'Home / X',
      href: '/dashboard?tab=home',
      icon: '✨',
    },
    { type: 'divider' },
    {
      name: 'Thread Generator',
      href: '/dashboard?tab=thread-generator',
      icon: '🧵',
    },
    {
      name: 'Tweet Generator',
      href: '/dashboard?tab=tweet-generator',
      icon: '📝',
    },
    {
      name: 'Bio Generator',
      href: '/dashboard?tab=bio-generator',
      icon: '👤',
    },
  ]

  const isActive = (href: string | undefined) => {
    if (!href) return false;
    if (href.includes('?tab=')) {
      const [basePath, queryParams] = href.split('?');
      return pathname === basePath && queryParams === `tab=${searchParams.get('tab')}`;
    }
    return pathname === href;
  };

  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1a1a1a] border-r border-zinc-800/50 ${isMobileMenuOpen ? 'block' : 'hidden'} lg:block`}>
        <div className="flex flex-col h-full">
          <div className="flex h-14 items-center px-4 border-b border-zinc-800/50">
            <span className="text-lg font-medium text-white">ThreadGenius</span>
          </div>
          <nav className="flex-1 space-y-0.5 px-2 py-3">
            {navigation.map((item, i) => {
              if (item.type === 'divider') {
                return <div key={i} className="h-px bg-zinc-800/50 my-3" />;
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href || ''}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-white/10 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile sidebar backdrop */}
      <div className={`fixed inset-0 bg-black/50 z-40 lg:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} onClick={() => setIsMobileMenuOpen(false)} />
    </>
  )
} 