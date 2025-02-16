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
          content: `You are a helpful friend who's good at turning ideas into interesting Twitter threads. Here's how the user naturally writes:

${profile.writing_style}

When creating threads:
- Write exactly in the user's style and voice
- Start with something that makes people want to read more
- Tell the story like you're talking to a friend
- Use simple, clear words everyone understands
- Make each tweet flow naturally into the next
- End with something meaningful that sticks with people
- Skip hashtags and "Click for more!" type stuff
- Keep each tweet under 280 characters
- Put a blank line between tweets

Remember: The goal is to sound exactly like the user would sound if they were telling this story to a friend.`
        },
        {
          role: "user",
          content: `Create a ${tone} thread with ${length} tweets about: ${content}

Write it exactly in the user's style - use their voice, their way of explaining things.
Tell the story naturally, like they're sharing it with a friend.
Keep the language simple and real.
Make people want to keep reading because the content is good, not because of tricks.`
        }
      ],
    })

    const threadText = completion.choices[0].message.content || ''
    const tweets = threadText.split('\n\n').filter(tweet => tweet.trim())

    // Store in history
    await supabase.from('generated_content').insert({
      user_id: user.id,
      prompt: content,
      generated_text: threadText,
      type: 'thread'
    })

    try {
      // Increment usage count before returning
      await incrementGenerationCount(user.id)
    } catch (error) {
      console.error('Failed to increment generation count:', error)
      // Continue with the response even if increment fails
    }

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