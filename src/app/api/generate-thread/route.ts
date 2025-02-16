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
          content: `You are a master storyteller who creates captivating Twitter threads. Here is the user's writing style for reference:

${profile.writing_style}

Your task is to write threads that match this writing style while maintaining these guidelines:
- Hook readers with a strong, intriguing opening tweet
- Each tweet builds curiosity for the next one
- Use simple, clear language that anyone can understand
- Create smooth transitions between tweets
- End with insight that makes readers think or take action
- Avoid clickbait or artificial cliffhangers
- No hashtags or forced engagement requests
- Each tweet must be under 280 characters
- Separate tweets with blank lines`
        },
        {
          role: "user",
          content: `Create an engaging ${tone} thread with ${length} tweets about: ${content}

Guidelines:
- First tweet must grab attention and hint at value
- Build the story naturally, like telling it to a friend
- Include specific details and personal insights
- Make each tweet flow into the next
- End with a meaningful conclusion that resonates
- Keep it conversational and authentic throughout
- Match the user's writing style exactly
- No clickbait or artificial suspense`
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