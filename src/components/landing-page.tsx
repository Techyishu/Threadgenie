'use client'

import { useState } from 'react'
import { PricingModal } from './pricing-modal'
import { AuthForm } from './auth-form'

export function LandingPage() {
  const [showPricing, setShowPricing] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-serif italic text-white">ThreadGenius</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <button className="text-gray-300 hover:text-white">Features</button>
              <button 
                onClick={() => setShowPricing(true)}
                className="text-gray-300 hover:text-white"
              >
                Pricing
              </button>
              <button
                onClick={() => setShowAuth(true)}
                className="inline-flex items-center px-4 py-2 rounded-full bg-white text-black hover:bg-gray-100 transition-colors"
              >
                Get started for free
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-serif italic text-white mb-8 leading-tight">
              Write engaging X content while you think
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto">
              Transform your ideas into captivating threads, tweets, and bios. Let AI handle the writing while you focus on what matters - your unique perspective.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowAuth(true)}
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium rounded-full bg-white text-black hover:bg-gray-100 transition-colors"
              >
                Get started for free
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Features Header */}
        <div className="text-center mb-24">
          <div className="flex items-center justify-center gap-2 mb-6">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-gray-400 uppercase tracking-wider text-sm font-medium">Features</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif italic text-white mb-6">
            Three tools. Endless possibilities.
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to create engaging content for your X profile
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Thread Generator */}
          <div className="bg-[#1a1f2d] rounded-2xl p-8 border border-gray-800/50">
            <div className="flex items-start justify-between mb-6">
              <div className="text-blue-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm text-gray-500">01</span>
            </div>
            <h3 className="text-xl font-medium text-white mb-3">Thread Generator</h3>
            <p className="text-gray-400 mb-6">
              Transform your ideas into engaging thread formats. Perfect for storytelling, tutorials, and thought leadership.
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <span>Try it now</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>

          {/* Tweet Generator */}
          <div className="bg-[#1a1f2d] rounded-2xl p-8 border border-gray-800/50">
            <div className="flex items-start justify-between mb-6">
              <div className="text-purple-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
              <span className="text-sm text-gray-500">02</span>
            </div>
            <h3 className="text-xl font-medium text-white mb-3">Tweet Generator</h3>
            <p className="text-gray-400 mb-6">
              Craft the perfect tweet that captures attention. Ideal for announcements, insights, and engaging your audience.
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <span>Try it now</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>

          {/* Bio Generator */}
          <div className="bg-[#1a1f2d] rounded-2xl p-8 border border-gray-800/50">
            <div className="flex items-start justify-between mb-6">
              <div className="text-green-500">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="text-sm text-gray-500">03</span>
            </div>
            <h3 className="text-xl font-medium text-white mb-3">Bio Generator</h3>
            <p className="text-gray-400 mb-6">
              Create a compelling bio that showcases your personality. Let your profile make the perfect first impression.
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <span>Try it now</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button
            onClick={() => setShowAuth(true)}
            className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Open the app
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* Pricing Header */}
        <div className="text-center mb-24">
          <div className="flex items-center justify-center gap-2 mb-6">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-400 uppercase tracking-wider text-sm font-medium">Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif italic text-white mb-6">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Choose the plan that's right for you
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-[#1a1f2d] rounded-2xl p-8 border border-gray-800/50">
            <div className="mb-6">
              <h3 className="text-2xl font-medium text-white mb-2">Free</h3>
              <p className="text-gray-400">Perfect for getting started</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-serif italic text-white">$0</span>
              <span className="text-gray-400">/month</span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>5 Threads per day</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Basic thread generation</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Bio generator</span>
              </div>
            </div>

            <button
              onClick={() => setShowAuth(true)}
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full bg-white text-black hover:bg-gray-100 transition-colors"
            >
              Get started
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-black rounded-2xl p-8 border border-purple-500/50">
            <div className="mb-6">
              <h3 className="text-2xl font-medium text-white mb-2">Pro</h3>
              <p className="text-gray-400">For power users</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-serif italic text-white">$5</span>
              <span className="text-gray-400">/month</span>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Unlimited threads</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Advanced thread customization</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Priority support</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Analytics dashboard</span>
              </div>
            </div>

            <button
              className="w-full inline-flex items-center justify-center px-6 py-3 rounded-full bg-gray-800 text-gray-300 cursor-not-allowed"
            >
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        {/* FAQ Header */}
        <div className="text-center mb-24">
          <div className="flex items-center justify-center gap-2 mb-6">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-400 uppercase tracking-wider text-sm font-medium">FAQ</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif italic text-white mb-6">
            Your questions, answered
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Get detailed answers to the most common questions about our AI content platform, so you can make the most of its powerful features.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              question: "Is this just another AI content generator?",
              answer: "No, ThreadGenius is specifically designed for X (formerly Twitter) content. Unlike generic AI writers, we understand the nuances of social media - thread structure, engagement patterns, and character limits. Our AI is trained to maintain your authentic voice while optimizing for social media impact.",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              )
            },
            {
              question: "Will the content sound too AI-generated?",
              answer: "Not at all! ThreadGenius preserves your unique voice and style. Our AI adapts to your tone preferences - whether casual, professional, or humorous. You can always edit and refine the generated content to ensure it perfectly matches your voice. The goal is to enhance your creativity, not replace it.",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              )
            },
            {
              question: "Can I edit the AI-generated content?",
              answer: "Absolutely! Every piece of content generated by ThreadGenius is fully editable. You can modify individual tweets in a thread, adjust the tone, length, and style. Think of it as a smart writing partner that gives you a strong starting point, which you can then perfect to match your exact needs.",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              )
            },
            {
              question: "What are the limits for the free plan?",
              answer: "The free plan includes 5 thread generations per day, basic thread customization, and access to our bio generator. Each thread can be up to 5 tweets long. This is perfect for getting started and experiencing the power of ThreadGenius. For unlimited access and advanced features, check out our Pro plan.",
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              )
            }
          ].map((faq, index) => (
            <div key={index} className="bg-[#1a1f2d] rounded-2xl border border-gray-800/50 overflow-hidden">
              <button 
                className="w-full flex items-center justify-between p-6 text-left"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <div className="flex items-center gap-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {faq.icon}
                  </svg>
                  <span className="text-lg text-white">{faq.question}</span>
                </div>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${openFaq === index ? 'rotate-45' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              {openFaq === index && (
                <div className="px-6 pb-6 text-gray-400">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <button
            onClick={() => setShowAuth(true)}
            className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            Open the app
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="border-t border-gray-800 mt-32 py-16 bg-black/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-serif italic text-white">Built by Shashank</h3>
              <p className="text-gray-400 max-w-2xl leading-relaxed">
                Hey! I'm a 25 year old software developer who loves building products. 
                When I'm not at my day job, you'll find me crafting tools like ThreadGenius 
                that make content creation more intuitive. Follow my journey and behind-the-scenes 
                updates on X - <a href="https://twitter.com/yourusername" className="text-blue-400 hover:text-blue-300 transition-colors">@yourusername</a>
              </p>
              <p className="text-gray-400">Thanks for checking out ThreadGenius!</p>
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-gray-800/50">
              <div className="text-sm text-gray-500">
                © 2024 ThreadGenius - All Rights Reserved
              </div>
              <a 
                href="https://twitter.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
      {showAuth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-[#1a1f2d] rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Get Started</h2>
              <button
                onClick={() => setShowAuth(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AuthForm />
          </div>
        </div>
      )}
    </div>
  )
} 