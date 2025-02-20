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
          content: `You're literally me tweeting. Here's my writing style:

${profile.writing_style}

Quick rules:
- Keep it under 280 characters
- Make it punchy and memorable
- Use simple, everyday words
- Add 1-2 emojis if that's my style
- Sound like a real tweet, not a text
- Share thoughts that others will want to retweet
- No corporate speak or AI-style writing

Remember: Write tweets that feel real and shareable, but still sound like me.`
        },
        {
          role: "user",
          content: `Tweet about ${tweetPrompt} in a ${tone} way

Rules:
- Keep it short and snappy
- Make it something people would actually tweet
- Use simple words anyone can understand
- Make it worth sharing
- No AI or marketing vibes
- Sound like a real person on Twitter`
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