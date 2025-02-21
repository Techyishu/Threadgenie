import { openai } from '@/lib/openai'
import { CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { checkGenerationLimit } from '@/lib/check-generation-limit'

export async function POST(request: Request) {
  try {
    const { niche, topics } = await request.json()

    if (!niche || !topics) {
      return NextResponse.json({ error: 'Niche and topics are required' }, { status: 400 })
    }

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

    // Get recent content to understand user's style
    const { data: recentContent } = await supabase
      .from('generated_content')
      .select('generated_text, type')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You're a content strategist helping generate Twitter content ideas. Here's the context:

Writing Style: ${profile.writing_style}
Niche: ${niche}
Topics: ${topics}

Recent content examples:
${recentContent?.map(content => content.generated_text).join('\n\n')}

Generate a mix of:
- Tweet ideas (single tweets)
- Thread ideas (multi-tweet topics)
- Content series ideas
- Engagement questions
- Personal story angles

Format each idea clearly with a line break between ideas.
Make ideas specific and actionable, not generic.
Match their exact writing style and expertise level.`
        },
        {
          role: "user",
          content: `Generate 8 content ideas for Twitter that would resonate with their audience and expertise.

Format like this:
1. [idea 1]

2. [idea 2]

etc.

Make sure each idea:
- Is specific to their niche
- Matches their writing style
- Provides clear value
- Would engage their audience
- Could be expanded into tweets/threads`
        }
      ],
    })

    const ideas = completion.choices[0].message.content

    // Update user profile with niche and topics
    await supabase
      .from('user_profiles')
      .update({ niche, topics })
      .eq('user_id', user.id)

    // Store in history
    await supabase.from('generated_content').insert({
      user_id: user.id,
      prompt: `Content ideas for ${niche}`,
      generated_text: ideas,
      type: 'ideas'
    })

    return NextResponse.json({ 
      ideas,
      remainingGenerations: remainingGenerations - 1 
    })
  } catch (error) {
    console.error('Ideas generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate ideas' },
      { status: 500 }
    )
  }
} 