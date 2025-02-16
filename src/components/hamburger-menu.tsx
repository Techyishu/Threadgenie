'use client'

import { useState } from 'react'

interface HamburgerMenuProps {
  onSignOut: () => Promise<void>
  onPricingClick: () => void
}

export function HamburgerMenu({ onSignOut, onPricingClick }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePricingClick = () => {
    setIsOpen(false)
    onPricingClick()
  }

  return (
    <div className="lg:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-300 hover:text-white p-2"
        aria-label="Toggle menu"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-16 right-0 w-48 py-2 bg-gray-900 rounded-lg shadow-xl">
          <a href="#" className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800">
            Home
          </a>
          <button
            onClick={handlePricingClick}
            className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            Pricing
          </button>
          <button
            onClick={onSignOut}
            className="w-full text-left px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
} 