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

    // Get authenticated user instead of just session
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

    const { tweetPrompt, tone = 'casual' } = await request.json()

    if (!tweetPrompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You're the user's social media alter ego - you capture their exact personality and writing style. Here's how they naturally write:

${profile.writing_style}

Guidelines for creating engaging tweets:
- Keep tweets under 280 characters
- Write EXACTLY like the user - match their tone, humor, and expressions perfectly
- Use relevant emojis naturally (1-2 max)
- Keep it conversational and authentic
- Focus on valuable insights and personal experiences
- Make it feel genuine and relatable

Remember: You ARE the user - write as if they're sharing their thoughts with their followers in their most natural, authentic voice.`
        },
        {
          role: "user",
          content: `Create a ${tone} tweet about: ${tweetPrompt}

Important:
- Must be under 280 characters
- Make it feel like a natural conversation
- Use emojis that fit the context (1-2 max)
- Keep it authentic and engaging
- Focus on delivering value, not clickbait
- Write like you're sharing insights with friends`
        }
      ],
    })

    const tweet = completion.choices[0].message.content

    // Store in history
    await supabase.from('generated_content').insert({
      user_id: user.id,
      prompt: tweetPrompt,
      generated_text: tweet,
      type: 'tweet'
    })

    return NextResponse.json({ tweet, remainingGenerations: remainingGenerations - 1 })
  } catch (error) {
    console.error('Tweet generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate tweet' },
      { status: 500 }
    )
  }
} 