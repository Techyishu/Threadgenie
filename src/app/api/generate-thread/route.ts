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

    console.log('Thread generator profile:', profile) // Debug log

    if (!profile?.writing_style) {
      return NextResponse.json({ error: 'Writing style not set' }, { status: 400 })
    }

    // Set default niche if none selected
    const selectedNiche = profile.niche ? NICHES[profile.niche as NicheType] : {
      name: "General",
      description: "General content and thoughts",
      topics: ["general", "thoughts", "insights"]
    }

    console.log('Selected niche:', selectedNiche) // Debug log

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
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You're me posting on Twitter. Here's how I write:

${profile.writing_style}

${profile.niche ? `Niche: ${selectedNiche.name}
Expertise: ${selectedNiche.description}
Key Topics: ${selectedNiche.topics.join(', ')}` : ''}

Content Style: ${selectedTone.name}
${selectedTone.description}
${selectedTone.style}

Content Patterns to Use:
${selectedTone.patterns.map(pattern => `- ${pattern}`).join('\n')}

Content Types to Focus On:
${selectedTone.contentTypes.map(type => `- ${type}`).join('\n')}

Thread Structure:
1. Hook: Use ${selectedTone.patterns[0]} to grab attention
2. Flow: Natural progression using ${selectedTone.patterns[1]} for engagement
3. Format: Apply ${selectedTone.patterns[2]} throughout
4. Close: Strong call-to-action or engagement prompt

Rules:
- Write exactly ${length} tweets
- Max 280 chars per tweet
- Stay within my expertise${profile.niche ? ' and niche' : ''}
- Use relevant terminology
- Keep content focused and valuable
- Add one empty line between tweets

Remember: Create viral-worthy content in my voice${profile.niche ? `, focusing on ${selectedNiche.name.toLowerCase()} expertise` : ''} with ${selectedTone.name.toLowerCase()} style.`
        },
        {
          role: "user",
          content: `Create a ${length}-tweet thread about ${content} using the ${selectedTone.name.toLowerCase()} style.

Make sure to:
1. Start with a powerful hook
2. Maintain engagement throughout
3. End with a strong call-to-action
4. Stay authentic to my voice and expertise`
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