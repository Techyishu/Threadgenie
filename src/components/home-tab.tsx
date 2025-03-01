'use client'

import { motion } from 'framer-motion'

const features = [
  {
    title: "Thread Generator",
    description: "Transform your ideas into engaging Twitter threads. Perfect for storytelling, tutorials, and thought leadership.",
    icon: "🧵",
    color: "from-blue-600/20 to-purple-600/20 border-blue-500/20",
    link: "/?tab=thread-generator"
  },
  {
    title: "Tweet Enhancer",
    description: "Make your tweets more engaging while keeping your original message intact. Perfect for improving impact and reach.",
    icon: "📝",
    color: "from-purple-600/20 to-pink-600/20 border-purple-500/20",
    link: "/?tab=tweet-generator"
  },
  {
    title: "Bio Generator",
    description: "Create a compelling profile bio that showcases your personality and expertise.",
    icon: "👤",
    color: "from-green-600/20 to-emerald-600/20 border-green-500/20",
    link: "/?tab=bio-generator"
  }
]

const tips = [
  {
    title: "Writing Style",
    description: "Set your writing style in settings to ensure all generated content matches your voice.",
    icon: "✍️"
  },
  {
    title: "Thread Length",
    description: "For threads, start with 3-5 tweets and expand if needed. Keep each tweet focused.",
    icon: "📏"
  },
  {
    title: "Bio Keywords",
    description: "Use specific keywords in your bio that reflect your expertise and interests.",
    icon: "🎯"
  },
  {
    title: "Content History",
    description: "Review your generation history to refine and reuse successful content.",
    icon: "📚"
  }
]

export function HomeTab() {
  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-serif italic bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Welcome to ThreadGenius
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Your AI-powered content creation companion for X (Twitter). Create engaging threads, tweets, and bios that capture attention.
        </p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid md:grid-cols-3 gap-6"
      >
        {features.map((feature, index) => (
          <a
            key={feature.title}
            href={feature.link}
            className={`block p-6 rounded-xl bg-gradient-to-br ${feature.color} border border-opacity-20 hover:border-opacity-40 transition-all duration-200 transform hover:scale-[1.02]`}
          >
            <div className="flex items-start gap-4">
              <span className="text-3xl">{feature.icon}</span>
              <div>
                <h3 className="text-xl font-medium text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            </div>
          </a>
        ))}
      </motion.div>

      {/* Pro Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <h2 className="text-2xl font-medium text-white">Pro Tips</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {tips.map((tip) => (
            <div 
              key={tip.title}
              className="p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{tip.icon}</span>
                <h3 className="font-medium text-white">{tip.title}</h3>
              </div>
              <p className="text-gray-400 text-sm">{tip.description}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Usage Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid sm:grid-cols-3 gap-6"
      >
        <div className="p-6 rounded-xl bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20">
          <div className="text-3xl font-bold text-white mb-1">10</div>
          <div className="text-sm text-gray-400">Daily Generations</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-purple-600/10 to-pink-600/10 border border-purple-500/20">
          <div className="text-3xl font-bold text-white mb-1">3</div>
          <div className="text-sm text-gray-400">Recent Threads</div>
        </div>
        <div className="p-6 rounded-xl bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-500/20">
          <div className="text-3xl font-bold text-white mb-1">5</div>
          <div className="text-sm text-gray-400">Recent Tweets</div>
        </div>
      </motion.div>

      {/* Getting Started */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl bg-gradient-to-b from-zinc-800/50 to-transparent p-8"
      >
        <h2 className="text-2xl font-medium text-white mb-6">Getting Started</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 text-sm">1</span>
              <h3 className="font-medium">Choose Your Tool</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Select the type of content you want to create from the options above.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500/20 text-purple-500 text-sm">2</span>
              <h3 className="font-medium">Enter Your Prompt</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Describe what you want to create. Be specific about tone and style.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-white">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/20 text-green-500 text-sm">3</span>
              <h3 className="font-medium">Review & Publish</h3>
            </div>
            <p className="text-gray-400 text-sm">
              Edit the generated content and publish it to your X profile.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 