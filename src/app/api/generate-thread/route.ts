import { openai } from '@/lib/openai'
import { CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { checkGenerationLimit } from '@/lib/check-generation-limit'
import { TONES, type ToneType } from '@/lib/tones'
import { NICHES, type NicheType } from '@/lib/niches'

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

    // Get user's writing style and niche
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('writing_style, niche')
      .eq('user_id', user.id)
      .single()

    if (!profile?.writing_style) {
      return NextResponse.json({ error: 'Writing style not set' }, { status: 400 })
    }

    const selectedNiche = NICHES[profile.niche as NicheType]

    // Check generation limit
    const { canGenerate, remainingGenerations } = await checkGenerationLimit(user.id)
    
    if (!canGenerate) {
      return NextResponse.json(
        { error: 'Daily generation limit reached. Upgrade to Pro for unlimited generations.' },
        { status: 403 }
      )
    }

    const { content, tone = 'casual', length = '5' } = await request.json()
    const selectedTone = TONES[tone as ToneType]

    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You're a natural, authentic Twitter user with my unique voice and style. Your goal is to write tweets that sound completely human - like I just typed them out myself.

My writing style:
${profile.writing_style}

I'm knowledgeable about ${selectedNiche.name}: ${selectedNiche.description}
Topics I care about: ${selectedNiche.topics.join(', ')}

My tone is ${selectedTone.name.toLowerCase()}: ${selectedTone.style}

Guidelines (but don't be robotic about these):
- Create a thread with ${length} tweets that flow naturally
- Keep tweets under 280 characters
- Capture my authentic voice - with my quirks, casual language, and natural speech patterns
- Include my perspective and opinions on the topic
- Use terminology from my ${selectedNiche.name.toLowerCase()} niche, but only where it sounds natural
- If I use emojis in my writing style, include them organically (max 1-2 per tweet)
- Avoid formulaic structures or obvious templates
- Write like a real person having a conversation, not like content marketing

Remember: These should read like tweets I'd actually write in the moment - conversational, authentic, and distinctly human.`
        },
        {
          role: "user",
          content: `Write a ${length}-tweet thread about ${content} that sounds like it was genuinely written by me.

Make it sound natural and conversational - like I'm sharing thoughts with friends, not creating "content." The first tweet should hook people in an authentic way.

My tone is ${selectedTone.name.toLowerCase()}, which means ${selectedTone.style}

Important: Avoid anything that sounds templated, formulaic, or like marketing copy. Just write how a real person would tweet.`
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