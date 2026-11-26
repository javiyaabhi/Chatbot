export type Language = 'en' | 'hi' | 'gu'
export type TeachingMode = 'beginner' | 'intermediate' | 'advanced' | 'step-by-step'

export interface User {
  id: string
  name: string
  email: string
  preferredLanguage: Language
  learningLevel: 'beginner' | 'intermediate' | 'advanced'
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
}

export interface Conversation {
  id: string
  title: string
  subject: string
  language: Language
  messages: Message[]
  createdAt: string
  updatedAt: string
}
