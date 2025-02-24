import { CONTENT_PATTERNS, CONTENT_TYPES } from './content-styles'

export const TONES = {
  viral: {
    name: "Viral & Engaging",
    description: "Casual, high-energy content that sparks conversations",
    style: "Write like you're sharing an exciting discovery with friends - use emojis, casual language, and create FOMO",
    patterns: [
      CONTENT_PATTERNS.hooks.curiosity,
      CONTENT_PATTERNS.engagement_tactics.fomo,
      CONTENT_PATTERNS.formatting.emphasis
    ],
    contentTypes: [
      CONTENT_TYPES.insights,
      CONTENT_TYPES.prediction
    ]
  },

  storyteller: {
    name: "Storyteller",
    description: "Warm, relatable stories that draw readers in",
    style: "Write like you're having coffee with a friend - be vulnerable, use vivid details, and share personal lessons",
    patterns: [
      CONTENT_PATTERNS.hooks.story,
      CONTENT_PATTERNS.engagement_tactics.social_proof,
      CONTENT_PATTERNS.formatting.whitespace
    ],
    contentTypes: [
      CONTENT_TYPES.casestudy,
      CONTENT_TYPES.insights
    ]
  },

  expert: {
    name: "Industry Expert",
    description: "Knowledgeable but approachable industry insights",
    style: "Write like a trusted mentor - balance expertise with accessibility, use real examples, and provide clear takeaways",
    patterns: [
      CONTENT_PATTERNS.hooks.statistic,
      CONTENT_PATTERNS.engagement_tactics.callToAction,
      CONTENT_PATTERNS.formatting.lists
    ],
    contentTypes: [
      CONTENT_TYPES.howTo,
      CONTENT_TYPES.frameworks
    ]
  },

  contrarian: {
    name: "Contrarian Thinker",
    description: "Fresh perspectives that make readers think differently",
    style: "Write like an insightful friend who sees things others miss - be bold but reasonable, back up claims, and encourage discussion",
    patterns: [
      CONTENT_PATTERNS.hooks.controversy,
      CONTENT_PATTERNS.engagement_tactics.questions,
      CONTENT_PATTERNS.formatting.emphasis
    ],
    contentTypes: [
      CONTENT_TYPES.myths,
      CONTENT_TYPES.prediction
    ]
  },

  educator: {
    name: "Helpful Educator",
    description: "Patient, encouraging guidance that builds confidence",
    style: "Write like a supportive teacher - anticipate questions, celebrate small wins, and make complex topics feel manageable",
    patterns: [
      CONTENT_PATTERNS.hooks.problem_solution,
      CONTENT_PATTERNS.engagement_tactics.validation,
      CONTENT_PATTERNS.formatting.lists
    ],
    contentTypes: [
      CONTENT_TYPES.howTo,
      CONTENT_TYPES.checklist
    ]
  }
} as const

export type ToneType = keyof typeof TONES 