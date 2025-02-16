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

    const { bioKeywords, personalStyle = 'professional' } = await request.json()

    if (!bioKeywords) {
      return NextResponse.json({ error: 'Missing keywords' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert at crafting memorable Twitter bios that reflect real personality. Here is the user's writing style for reference:

${profile.writing_style}

Your task is to write a bio that matches this writing style while maintaining these guidelines:
- Write like a real person, not a LinkedIn profile
- Show personality through specific details
- Balance professional credibility with personal authenticity
- Avoid overused phrases and clichés
- Use humor naturally, not forcefully
- Maximum 160 characters
- Emojis only if they add meaning (max 2-3)

Avoid these clichés:
- "Coffee lover ☕"
- "Professional by day, [hobby] by night"
- "Living life to the fullest"
- "Views are my own"
- "Passionate about..."`
        },
        {
          role: "user",
          content: `Create a ${personalStyle} Twitter bio using these elements about me: ${bioKeywords}

Guidelines:
- Make it sound like a real person wrote it
- Include specific details that make it unique
- Avoid corporate language and buzzwords
- If using emojis, make them meaningful
- Focus on what makes them interesting/different
- Keep it under 160 characters
- Match their personality style: ${personalStyle}
- Make it memorable and conversation-worthy
- Match the user's writing style exactly`
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

    try {
      // Increment usage count before returning
      await incrementGenerationCount(user.id)
    } catch (error) {
      console.error('Failed to increment generation count:', error)
      // Continue with the response even if increment fails
    }

    return NextResponse.json({ bio, remainingGenerations: remainingGenerations - 1 })
  } catch (error) {
    console.error('Bio generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate bio' },
      { status: 500 }
    )
  }
} 