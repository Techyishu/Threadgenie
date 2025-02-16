import { openai } from '@/lib/openai'
import { CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { checkGenerationLimit } from '@/lib/check-generation-limit'

export async function POST(request: Request) {
  try {
    // Get session to check auth
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options })
          }
        }
      }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's writing style
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('writing_style')
      .eq('user_id', user.id)
      .single()

    if (!profile?.writing_style) {
      return NextResponse.json({ error: 'Writing style not set' }, { status: 400 })
    }

    // Check generation limit
    const { canGenerate, remainingGenerations } = await checkGenerationLimit(user.id)
    
    if (!canGenerate) {
      return NextResponse.json(
        { error: 'Daily generation limit reached. Upgrade to Pro for unlimited generations.' },
        { status: 403 }
      )
    }

    const { bioKeywords, personalStyle = 'professional' } = await request.json()

    if (!bioKeywords) {
      return NextResponse.json({ error: 'Missing keywords' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a friendly helper who's good at writing Twitter bios that show who people really are. Here's how the user naturally writes:

${profile.writing_style}

When writing their bio:
- Write exactly like the user writes
- Show their real personality
- Use simple, clear words
- Keep it honest and real
- Skip overused phrases
- Only use emojis if they really fit (max 2-3)
- Keep it under 160 characters

Skip these overused phrases:
- "Coffee lover ☕"
- "Living life to the fullest"
- "Views are my own"
- "Passionate about..."
- Any job title + "by day, [hobby] by night"

Remember: The bio should sound just like the user - not like a resume or brand statement.`
        },
        {
          role: "user",
          content: `Create a ${personalStyle} Twitter bio using these details: ${bioKeywords}

Write it in the user's exact style and voice.
Make it sound real and personal - like they wrote it themselves.
Keep the words simple and clear.
Focus on what makes them unique and interesting.
Skip business language and buzzwords.
If you use emojis, make sure they really fit who they are.`
        }
      ],
    })

    const bio = completion.choices[0].message.content

    // Store in history
    await supabase.from('generated_content').insert({
      user_id: user.id,
      prompt: bioKeywords,
      generated_text: bio,
      type: 'bio'
    })

    return NextResponse.json({ bio, remainingGenerations: remainingGenerations - 1 })
  } catch (error) {
    console.error('Bio generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate bio' },
      { status: 500 }
    )
  }
} 