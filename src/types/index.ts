export type GeneratedContent = {
  id: string
  user_id: string
  prompt: string
  generated_text: string
  type: 'tweet' | 'thread' | 'bio'
  timestamp: string
}

export type User = {
  id: string
  email: string
  username: string
} 