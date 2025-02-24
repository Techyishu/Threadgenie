import { CONTENT_PATTERNS, CONTENT_TYPES } from './content-styles'

export const TONES = {
  viral: {
    name: "Viral & Engaging",
    description: "Highly shareable content optimized for engagement",
    style: "Create attention-grabbing, discussion-worthy content",
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
    description: "Narrative-driven personal experiences",
    style: "Share authentic stories that resonate and teach",
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
    description: "Authoritative and educational content",
    style: "Share deep expertise and actionable insights",
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
    description: "Unique perspectives that challenge norms",
    style: "Present thought-provoking alternative viewpoints",
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
    description: "Clear, actionable educational content",
    style: "Break down complex topics into digestible lessons",
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