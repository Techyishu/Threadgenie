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

    // Set default niche if none selected
    const selectedNiche = profile.niche ? NICHES[profile.niche as NicheType] : {
      name: "General",
      description: "General content and thoughts",
      topics: ["general", "thoughts", "insights"]
    }

    // Check generation limit
    const { canGenerate, remainingGenerations } = await checkGenerationLimit(user.id)
    
    if (!canGenerate) {
      return NextResponse.json(
        { error: 'Daily generation limit reached. Upgrade to Pro for unlimited generations.' },
        { status: 403 }
      )
    }

    const { content, tone = 'viral', length = '5' } = await request.json()
    
    // Add validation for tone
    if (!TONES[tone as ToneType]) {
      return NextResponse.json({ error: 'Invalid tone selected' }, { status: 400 })
    }
    
    const selectedTone = TONES[tone as ToneType]

    if (!content) {
      return NextResponse.json({ error: 'Missing content' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You're me posting on Twitter. Write in my style:

${profile.writing_style}

${profile.niche ? `Niche: ${selectedNiche.name}
Focus: ${selectedNiche.description}
Topics: ${selectedNiche.topics.join(', ')}` : ''}

Style: ${selectedTone.name}
${selectedTone.style}

Key Rules:
- Write exactly ${length} tweets
- Max 280 chars per tweet
- Start with a hook
- Stay focused on ${profile.niche ? selectedNiche.name.toLowerCase() : 'the topic'}
- Be concise and direct
- Add one empty line between tweets
- No generic hashtags or forced endings
- Sound natural and authentic

Format each tweet to be engaging and valuable.`
        },
        {
          role: "user",
          content: `Create a ${length}-tweet thread about: ${content}

Requirements:
- Strong opening hook
- Clear value in each tweet
- Natural flow between tweets
- Authentic voice`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.6,
      frequency_penalty: 0.6
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