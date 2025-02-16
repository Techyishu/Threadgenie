import { openai } from '@/lib/openai'
import { CookieOptions, createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

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

    const { tweetPrompt, tone = 'casual' } = await request.json()

    if (!tweetPrompt) {
      return NextResponse.json({ error: 'Missing prompt' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a social media expert who writes tweets that go viral. Your style is:
- Natural and conversational, like talking to a friend
- Thought-provoking without being pretentious
- Clear and accessible, avoiding industry jargon
- Engaging but not clickbaity
- Zero hashtags unless absolutely essential
- No corporate speak or marketing buzzwords

Examples of good tweets:
"Just realized my best code is written at 2 AM. My worst code is also written at 2 AM. It's a mystery 🤔"
"Hot take: Documentation isn't just about helping others. Future you is the first person you're writing it for."

Examples to avoid:
"10 MIND-BLOWING JavaScript hacks that will 100x your productivity! 🚀 #coding #javascript #webdev"
"Leveraging synergistic opportunities in the digital transformation space"`
        },
        {
          role: "user",
          content: `Write a ${tone} tweet about: '${tweetPrompt}'. 
Make it feel like a genuine thought or observation that would spark replies.
If using emojis, keep them minimal and natural (max 1-2).
Focus on starting a conversation or sharing a unique perspective.
Remember: write like a real person, not a brand.`
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

    return NextResponse.json({ tweet })
  } catch (error) {
    console.error('Tweet generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate tweet' },
      { status: 500 }
    )
  }
} 