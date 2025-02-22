import { openai } from '@/lib/openai'
import { CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { checkGenerationLimit } from '@/lib/check-generation-limit'
import { TONES, type ToneType } from '@/lib/tones'

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

    const { bioKeywords, tone = 'professional' } = await request.json()
    const selectedTone = TONES[tone as ToneType]

    if (!bioKeywords) {
      return NextResponse.json({ error: 'Missing keywords' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You're helping create a Twitter bio. Here's the style:

${profile.writing_style}

Tone: ${selectedTone.name} - ${selectedTone.style}

Bio rules:
- Max 160 characters
- Match the ${selectedTone.name.toLowerCase()} tone perfectly
- Include relevant keywords
- Make it memorable
- Use appropriate language for the tone
- Add emojis if they fit the tone (max 3)
- Focus on unique value proposition
- Keep it authentic to the tone

Remember: Create a compelling bio in ${selectedTone.name.toLowerCase()} style.`
        },
        {
          role: "user",
          content: `Create a ${selectedTone.name.toLowerCase()} Twitter bio using these keywords: ${bioKeywords}

Style guide:
- Match ${selectedTone.name.toLowerCase()} tone perfectly
- ${selectedTone.style}
- Make it stand out
- Include key expertise
- Stay true to the tone`
        }
      ],
    })

    const bio = completion.choices[0].message.content

    // Store in history
    await supabase.from('generated_content').insert({
      user_id: user.id,
      prompt: bioKeywords,
      generated_text: bio,
      type: 'bio'
    })

    return NextResponse.json({ bio, remainingGenerations: remainingGenerations - 1 })
  } catch (error) {
    console.error('Bio generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate bio' },
      { status: 500 }
    )
  }
} 