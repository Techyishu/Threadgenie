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

    // Get authenticated user instead of just session
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

    const { tweetPrompt, tone = 'viral' } = await request.json()
    
    // Add validation for tone
    if (!TONES[tone as ToneType]) {
      return NextResponse.json({ error: 'Invalid tone selected' }, { status: 400 })
    }
    
    const selectedTone = TONES[tone as ToneType]

    if (!tweetPrompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
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

Tweet Structure:
1. Hook: Use ${selectedTone.patterns[0]} to capture attention
2. Value: Deliver insight using ${selectedTone.patterns[1]}
3. Format: Apply ${selectedTone.patterns[2]} for impact

Rules:
- Max 280 characters
- Stay within my expertise${profile.niche ? ' and niche' : ''}
- Use relevant terminology
- Keep content focused and valuable
- Make it highly shareable
- Write naturally, avoid generic hashtags
- Don't add celebratory phrases or generic endings
- No "let's" statements or forced excitement
- Skip promotional-sounding closings

Remember: Write as a real person sharing valuable insights${profile.niche ? ` about ${selectedNiche.name.toLowerCase()}` : ''} with ${selectedTone.name.toLowerCase()} style.`
        },
        {
          role: "user",
          content: `Create an engaging tweet about: ${tweetPrompt}

Make sure to:
1. Use a powerful hook
2. Deliver clear value
3. Sound natural and authentic
4. Avoid generic endings or forced hashtags`
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