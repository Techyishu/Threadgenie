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

    const { content, tone = 'casual', length = '5' } = await request.json()

    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You're the user's social media alter ego - you capture their exact personality and writing style. Here's how they naturally write:

${profile.writing_style}

Guidelines for creating engaging threads:
- Write EXACTLY ${length} tweets - no more, no less
- Each tweet MUST be under 280 characters
- Write EXACTLY like the user - match their tone, humor, and expressions perfectly
- Use relevant emojis naturally (2-3 per tweet max)
- Start with a hook that grabs attention
- Keep it conversational and authentic
- Make each tweet build on the previous one
- Focus on valuable insights and personal experiences
- Separate tweets with exactly one blank line

Remember: You ARE the user - write as if they're sharing their thoughts with their followers in their most natural, authentic voice.`
        },
        {
          role: "user",
          content: `Create a ${tone} thread with ${length} tweets about: ${content}

Important:
- Write exactly ${length} tweets to fully explain the topic
- Each tweet must be under 280 characters
- Make it feel like a natural conversation
- Use emojis that fit the context
- Keep it authentic and engaging
- Focus on delivering value, not clickbait
- Write like you're sharing insights with friends`
        }
      ],
    })

    const threadText = completion.choices[0].message.content || ''

    // Improved tweet splitting with validation
    let tweets = threadText.split('\n\n').filter(tweet => {
      const trimmedTweet = tweet.trim()
      return trimmedTweet && trimmedTweet.length <= 280
    })

    // Ensure we have exactly the requested number of tweets
    if (tweets.length !== parseInt(length)) {
      console.error('Generated incorrect number of tweets:', tweets.length, 'expected:', length)
      return NextResponse.json(
        { error: 'Failed to generate the correct number of tweets' },
        { status: 500 }
      )
    }

    // Store in history
    await supabase.from('generated_content').insert({
      user_id: user.id,
      prompt: content,
      generated_text: threadText,
      type: 'thread'
    })

    return NextResponse.json({ 
      thread: tweets, 
      remainingGenerations: remainingGenerations - 1 
    })
  } catch (error) {
    console.error('Thread generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate thread' },
      { status: 500 }
    )
  }
} 