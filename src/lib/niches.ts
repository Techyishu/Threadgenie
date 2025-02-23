export const NICHES = {
  tech: {
    name: "Technology & Programming",
    description: "Software development, tech trends, and digital innovation",
    topics: ["coding", "software", "tech news", "AI", "web development"]
  },
  business: {
    name: "Business & Entrepreneurship",
    description: "Startups, business strategy, and entrepreneurship",
    topics: ["startups", "marketing", "leadership", "business growth", "entrepreneurship"]
  },
  personal_growth: {
    name: "Personal Development",
    description: "Self-improvement, productivity, and lifestyle optimization",
    topics: ["productivity", "mindset", "habits", "personal growth", "motivation"]
  },
  creator_economy: {
    name: "Creator Economy",
    description: "Content creation, social media, and online business",
    topics: ["content creation", "social media", "personal branding", "monetization", "audience building"]
  },
  finance: {
    name: "Finance & Investing",
    description: "Personal finance, investing, and wealth building",
    topics: ["investing", "crypto", "personal finance", "wealth building", "financial literacy"]
  },
  health_wellness: {
    name: "Health & Wellness",
    description: "Physical health, mental wellbeing, and lifestyle",
    topics: ["fitness", "mental health", "nutrition", "wellness", "mindfulness"]
  }
} as const

export type NicheType = keyof typeof NICHES 