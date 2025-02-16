import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function checkGenerationLimit(userId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(
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
    .rpc('check_generation_limit', { p_user_id: userId })
    .single()

  if (error) {
    throw error
  }

  return {
    canGenerate: data.can_generate,
    remainingGenerations: data.remaining_generations
  }
}

// No need for incrementGenerationCount anymore since we're tracking in generated_content table 