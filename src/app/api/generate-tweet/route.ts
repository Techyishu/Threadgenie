import { openai } from '@/lib/openai'
import { CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { checkGenerationLimit, incrementGenerationCount } from '@/lib/check-generation-limit'

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
          content: `You are a social media expert who writes tweets that go viral. Here is the user's writing style for reference:

${profile.writing_style}

Your task is to write tweets that match this writing style while maintaining these guidelines:
- Natural and conversational, like talking to a friend
- Thought-provoking without being pretentious
- Clear and accessible, avoiding industry jargon
- Engaging but not clickbaity
- Zero hashtags unless absolutely essential
- No corporate speak or marketing buzzwords`
        },
        {
          role: "user",
          content: `Write a ${tone} tweet about: '${tweetPrompt}'. 
Make it feel like a genuine thought or observation that would spark replies.
If using emojis, keep them minimal and natural (max 1-2).
Focus on starting a conversation or sharing a unique perspective.
Remember: write like the user, matching their writing style exactly.`
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

    try {
      // Increment usage count before returning
      await incrementGenerationCount(user.id)
    } catch (error) {
      console.error('Failed to increment generation count:', error)
      // Continue with the response even if increment fails
    }

    return NextResponse.json({ tweet, remainingGenerations: remainingGenerations - 1 })
  } catch (error) {
    console.error('Tweet generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate tweet' },
      { status: 500 }
    )
  }
} 