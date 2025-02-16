import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'

type UserUsage = Database['public']['Functions']['get_user_usage']['Returns'][0]

export async function checkGenerationLimit(userId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        }
      }
    }
  )

  const { data, error } = await supabase
    .rpc('get_user_usage', { p_user_id: userId })
    .single()

  if (error) {
    console.error('Error checking generation limit:', error)
    throw error
  }

  const usage = data as UserUsage

  return {
    canGenerate: usage.remaining_generations > 0,
    remainingGenerations: usage.remaining_generations
  }
}

export async function incrementGenerationCount(userId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        }
      }
    }
  )

  const { error } = await supabase
    .rpc('increment_generation_count', { p_user_id: userId })

  if (error) {
    console.error('Error incrementing generation count:', error)
    throw error
  }

  // Get updated count after increment
  const { data, error: usageError } = await supabase
    .rpc('get_user_usage', { p_user_id: userId })
    .single()

  if (usageError) {
    console.error('Error getting updated usage:', usageError)
    throw usageError
  }

  const usage = data as UserUsage
  return usage.remaining_generations
} 