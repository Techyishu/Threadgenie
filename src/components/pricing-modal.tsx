'use client'

import { useState } from 'react'

interface PricingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 flex justify-between items-center border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Pricing Plans</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-white mb-4">Simple, transparent pricing</h1>
            <p className="text-gray-400">Choose the plan that's right for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Free</h2>
                <p className="text-gray-400">Perfect for getting started</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="mb-8 space-y-4">
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  5 generations per day
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Basic content generation
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Bio generator
                </li>
              </ul>
              <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-150">
                Get Started
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-gray-800 rounded-lg p-8 border border-purple-500">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Pro</h2>
                <p className="text-gray-400">For power users</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$5</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="mb-8 space-y-4">
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Unlimited generations
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Advanced content generation
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Priority support
                </li>
                <li className="flex items-center text-gray-300">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Analytics dashboard
                </li>
              </ul>
              <button className="w-full bg-gray-700 text-gray-300 font-semibold py-3 px-4 rounded-lg cursor-not-allowed">
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 