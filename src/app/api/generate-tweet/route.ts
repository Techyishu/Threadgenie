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

    const selectedNiche = NICHES[profile.niche as NicheType]

    // Check generation limit
    const { canGenerate, remainingGenerations } = await checkGenerationLimit(user.id)
    
    if (!canGenerate) {
      return NextResponse.json(
        { error: 'Daily generation limit reached. Upgrade to Pro for unlimited generations.' },
        { status: 403 }
      )
    }

    const { tweetPrompt, tone = 'casual' } = await request.json()
    const selectedTone = TONES[tone as ToneType]

    if (!tweetPrompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You're me posting on Twitter. Here's how I write:

${profile.writing_style}

Niche: ${selectedNiche.name}
Expertise: ${selectedNiche.description}
Key Topics: ${selectedNiche.topics.join(', ')}

Tone: ${selectedTone.name} - ${selectedTone.style}

Tweet rules:
- Max 280 characters
- Match the ${selectedTone.name.toLowerCase()} tone perfectly
- Write exactly how I talk
- Stay within my niche expertise
- Use relevant terminology for my niche
- Keep content aligned with my topic focus
- Add emojis only if appropriate for tone (max 2)
- Make it attention-grabbing
- Keep it authentic to the tone

Remember: One perfect tweet sharing my ${selectedNiche.name.toLowerCase()} expertise in ${selectedTone.name.toLowerCase()} style.`
        },
        {
          role: "user",
          content: `Write a ${selectedTone.name.toLowerCase()} tweet about: ${tweetPrompt}

Style guide:
- Match ${selectedTone.name.toLowerCase()} tone perfectly
- ${selectedTone.style}
- Make it engaging
- Keep it concise
- Stay true to the tone and niche`
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