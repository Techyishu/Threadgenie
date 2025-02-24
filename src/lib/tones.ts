export const TONES = {
  casual: {
    name: "Casual",
    description: "Relaxed, friendly, and conversational",
    style: "Use everyday language, slang, and a laid-back tone. Like chatting with friends."
  },
  professional: {
    name: "Professional",
    description: "Polished, authoritative, and business-focused",
    style: "Use formal language, industry terms, and maintain a professional demeanor."
  },
  humorous: {
    name: "Humorous",
    description: "Fun, witty, and entertaining",
    style: "Include jokes, wordplay, and light-hearted observations. Keep it entertaining but not silly."
  },
  educational: {
    name: "Educational",
    description: "Informative, clear, and helpful",
    style: "Break down complex topics, use examples, and focus on teaching/explaining."
  },
  inspirational: {
    name: "Inspirational",
    description: "Motivational, uplifting, and encouraging",
    style: "Use powerful language, share insights, and focus on growth and possibilities."
  },
  controversial: {
    name: "Controversial",
    description: "Thought-provoking and debate-sparking",
    style: "Present challenging viewpoints, ask tough questions, but remain respectful."
  },
  storytelling: {
    name: "Storytelling",
    description: "Narrative-focused and engaging",
    style: "Use narrative techniques, build suspense, and focus on the story arc."
  }
} as const

export type ToneType = keyof typeof TONES 