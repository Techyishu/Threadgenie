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
          content: `You're me posting on Twitter. Here's how I write:

${profile.writing_style}

Niche: ${selectedNiche.name}
Expertise: ${selectedNiche.description}
Key Topics: ${selectedNiche.topics.join(', ')}

Tone: ${selectedTone.name} - ${selectedTone.style}

Thread rules:
- Write exactly ${length} tweets
- Max 280 chars per tweet
- Match the ${selectedTone.name.toLowerCase()} tone perfectly
- Write exactly how I talk
- Stay within my niche expertise
- Use relevant terminology for my niche
- Keep content aligned with my topic focus
- Add emojis only if I use them (max 2 per tweet)
- Add one empty line between tweets

Remember: Just me sharing my ${selectedNiche.name.toLowerCase()} expertise in ${selectedTone.name.toLowerCase()} style.`
        },
        {
          role: "user",
          content: `write a ${length}-tweet ${selectedTone.name.toLowerCase()} thread about ${content}

Style guide:
- Match ${selectedTone.name.toLowerCase()} tone perfectly
- ${selectedTone.style}
- Make sure tweets flow naturally
- First tweet should grab attention
- Stay consistent with tone throughout`
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